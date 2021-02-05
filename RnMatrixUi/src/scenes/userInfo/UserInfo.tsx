/*
Copyright 2015, 2016 OpenMarket Ltd
Copyright 2017, 2018 Vector Creations Ltd
Copyright 2019 Michael Telatynski <7t3chguy@gmail.com>
Copyright 2019, 2020 The Matrix.org Foundation C.I.C.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import { useDimensions } from '@react-native-community/hooks';
import { matrix } from '@rn-matrix/core';
import createRoom, {
  findDMForUser,
  privateShouldBeEncrypted,
} from '@rn-matrix/core/src/react-sdk-utils/createRoom';
import DMRoomMap from '@rn-matrix/core/src/react-sdk-utils/DMRoomMap';
import { EventType, EventTimeline } from '@rn-matrix/core/src/types/event';
import {
  ask,
  confirm,
  showError,
  showInfo,
  warnSelfDemote,
} from '@rn-matrix/core/src/react-sdk-utils/modals';
import MultiInviter from '@rn-matrix/core/src/react-sdk-utils/MultiInviter';
import { E2EStatus } from '@rn-matrix/core/src/react-sdk-utils/ShieldUtils';
// import { RouteProp, useNavigation } from '@react-navigation/native';
// import { StackNavigationProp } from '@react-navigation/stack';
// import { EventType } from 'matrix-js-sdk/src/@types/event';
// import { MatrixClient } from 'matrix-js-sdk/src/client';
// import { EventTimeline } from 'matrix-js-sdk/src/models/event-timeline';
// import { Room } from 'matrix-js-sdk/src/models/room';
// import { RoomMember } from 'matrix-js-sdk/src/models/room-member';
// import { User } from 'matrix-js-sdk/src/models/user';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import Avatar from '../../common/Avatar';
import Button from '../../common/Button';
import Navbar from '../../common/Navbar';
import Spinner from '../../common/Spinner';
// import i18n from '../../utilities/i18n';
// import {
//   AppStackParamList,
//   RootStackParamList,
// } from '../../../../navigation/NavigationTypes';
// import colors from '../../../../styles/Colors';
// import MatrixClientContext from '../../contexts/MatrixClientContext';
import { useAsyncMemo, useEventEmitter, useIsEncrypted } from '@rn-matrix/core/hooks';
import useNavigation from '../../hooks/useNavigation';
import ThemedStyles from '../../styles/ThemedStyles';
import PresenceLabel from '../../utilities/PresenceLabel';
import RoomContext, { useRoom } from '../room/RoomContext';
import PowerSelector from '../roomInfo/components/PowerSelector';
import { textualPowerLevel } from '../roomInfo/components/Roles';
// import EncryptionPanel from './EncryptionPanel';

type MatrixClient = any;
type Room = any;
type RoomMember = any;
type User = any;

// TODO: translate
const _t = (s, obj?) => {
  if (!obj) return s;

  let count = 0;

  return s.replace(/(\{\{)(.*?)(\}\})/gm, (substring: string) => {
    const value = Object.values(obj)[count];
    count++;
    return value;
  });
};

// What needs to be imported

interface IDevice {
  deviceId: string;
  ambiguous?: boolean;

  getDisplayName(): string;
}

const disambiguateDevices = (devices: IDevice[]) => {
  const names = Object.create(null);
  for (let i = 0; i < devices.length; i++) {
    const name = devices[i].getDisplayName();
    const indexList = names[name] || [];
    indexList.push(i);
    names[name] = indexList;
  }
  for (const name in names) {
    if (names[name].length > 1) {
      names[name].forEach((j) => {
        devices[j].ambiguous = true;
      });
    }
  }
};

export const getE2EStatus = (cli: MatrixClient, userId: string, devices: IDevice[]): E2EStatus => {
  const isMe = userId === cli.getUserId();
  const userTrust = cli.checkUserTrust(userId);
  if (!userTrust.isCrossSigningVerified()) {
    return userTrust.wasCrossSigningVerified() ? E2EStatus.Warning : E2EStatus.Normal;
  }

  const anyDeviceUnverified = devices.some((device) => {
    const { deviceId } = device;
    // For your own devices, we use the stricter check of cross-signing
    // verification to encourage everyone to trust their own devices via
    // cross-signing so that other users can then safely trust you.
    // For other people's devices, the more general verified check that
    // includes locally verified devices can be used.
    const deviceTrust = cli.checkDeviceTrust(userId, deviceId);
    return isMe ? !deviceTrust.isCrossSigningVerified() : !deviceTrust.isVerified();
  });
  return anyDeviceUnverified ? E2EStatus.Warning : E2EStatus.Verified;
};

async function openDMForUser(matrixClient: MatrixClient, userId: string, navigation: any) {
  // TODO: dm for user
  const lastActiveRoom = findDMForUser(matrixClient, userId);

  if (lastActiveRoom) {
    return;
    // return navigation.navigate('MessengerRoom', {
    //   roomId: lastActiveRoom.roomId,
    //   room: null, // important
    // });
  }

  const createRoomOptions = {
    dmUserId: userId,
    encryption: undefined,
    andView: true,
    navigation,
  };

  if (privateShouldBeEncrypted()) {
    // Check whether all users have uploaded device keys before.
    // If so, enable encryption in the new room.
    const usersToDevicesMap = await matrixClient.downloadKeys([userId]);
    const allHaveDeviceKeys = Object.values(usersToDevicesMap).every((devices: any) => {
      // `devices` is an object of the form { deviceId: deviceInfo, ... }.
      return Object.keys(devices).length > 0;
    });
    if (allHaveDeviceKeys) {
      // @ts-ignore
      createRoomOptions.encryption = true;
    }
  }

  return createRoom(createRoomOptions);
}

type SetUpdating = (updating: boolean) => void;

function useHasCrossSigningKeys(
  cli: MatrixClient,
  member: RoomMember,
  canVerify: boolean,
  setUpdating: SetUpdating
) {
  return useAsyncMemo(
    async () => {
      if (!canVerify) {
        return undefined;
      }
      setUpdating(true);
      try {
        await cli.downloadKeys([member.userId]);
        const xsi = cli.getStoredCrossSigningForUser(member.userId);
        const key = xsi && xsi.getId();
        return !!key;
      } finally {
        setUpdating(false);
      }
    },
    [cli, member, canVerify],
    undefined
  );
}

function DeviceItem({ userId, device }: { userId: string; device: IDevice }) {
  const cli: any = matrix.getClient();
  const isMe = userId === cli.getUserId();
  const deviceTrust = cli.checkDeviceTrust(userId, device.deviceId);
  const userTrust = cli.checkUserTrust(userId);
  // For your own devices, we use the stricter check of cross-signing
  // verification to encourage everyone to trust their own devices via
  // cross-signing so that other users can then safely trust you.
  // For other people's devices, the more general verified check that
  // includes locally verified devices can be used.
  const isVerified = isMe ? deviceTrust.isCrossSigningVerified() : deviceTrust.isVerified();

  // const classes = classNames('mx_UserInfo_device', {
  //   mx_UserInfo_device_verified: isVerified,
  //   mx_UserInfo_device_unverified: !isVerified,
  // });
  // const iconClasses = classNames('mx_E2EIcon', {
  //   mx_E2EIcon_normal: !userTrust.isVerified(),
  //   mx_E2EIcon_verified: isVerified,
  //   mx_E2EIcon_warning: userTrust.isVerified() && !isVerified,
  // });

  const onDeviceClick = () => {
    // verifyDevice(cli.getUser(userId), device);
  };

  const deviceName = device.ambiguous
    ? (device.getDisplayName() ? device.getDisplayName() : '') + ' (' + device.deviceId + ')'
    : device.getDisplayName();
  let trustedLabel = null;
  if (userTrust.isVerified()) trustedLabel = isVerified ? _t('Trusted') : _t('Not trusted');

  if (isVerified) {
    return (
      <View /*className={classes} title={device.deviceId}*/>
        <View /*className={iconClasses}*/ />
        <Text>{deviceName}</Text>
        <Text>{trustedLabel}</Text>
      </View>
    );
  } else {
    return (
      <Button onPress={onDeviceClick}>
        <View />
        <Text>{deviceName}</Text>
        <Text>{trustedLabel}</Text>
      </Button>
    );
  }
}

function DevicesSection({
  devices,
  userId,
  loading,
}: {
  devices: IDevice[];
  userId: string;
  loading: boolean;
}) {
  const cli: any = matrix.getClient();
  const userTrust = cli.checkUserTrust(userId);

  const [isExpanded, setExpanded] = useState(false);

  if (loading) {
    // still loading
    return <Spinner />;
  }
  if (devices === null) {
    return <Text>{_t('Unable to load session list')}</Text>;
  }
  const isMe = userId === cli.getUserId();
  const deviceTrusts = devices.map((d) => cli.checkDeviceTrust(userId, d.deviceId));

  let expandSectionDevices: IDevice[] = [];
  const unverifiedDevices: IDevice[] = [];

  let expandCountCaption;
  let expandHideCaption;
  let expandIconClasses = 'mx_E2EIcon';

  if (userTrust.isVerified()) {
    for (let i = 0; i < devices.length; ++i) {
      const device = devices[i];
      const deviceTrust = deviceTrusts[i];
      // For your own devices, we use the stricter check of cross-signing
      // verification to encourage everyone to trust their own devices via
      // cross-signing so that other users can then safely trust you.
      // For other people's devices, the more general verified check that
      // includes locally verified devices can be used.
      const isVerified = isMe ? deviceTrust.isCrossSigningVerified() : deviceTrust.isVerified();

      if (isVerified) {
        expandSectionDevices.push(device);
      } else {
        unverifiedDevices.push(device);
      }
    }
    expandCountCaption = _t('{{count}} verified sessions', {
      count: expandSectionDevices.length,
    });
    expandHideCaption = _t('Hide verified sessions');
    expandIconClasses += ' mx_E2EIcon_verified';
  } else {
    expandSectionDevices = devices;
    expandCountCaption = _t('{{count}} sessions', { count: devices.length });
    expandHideCaption = _t('Hide sessions');
    expandIconClasses += ' mx_E2EIcon_normal';
  }

  let expandButton;
  if (expandSectionDevices.length) {
    if (isExpanded) {
      expandButton = <Button onPress={() => setExpanded(false)} label={expandHideCaption} />;
    } else {
      expandButton = (
        <Button
          className="mx_UserInfo_expand mx_linkButton"
          onPress={() => setExpanded(true)}
          label={expandCountCaption}
        />
      );
    }
  }

  let deviceList = unverifiedDevices.map((device, i) => {
    return <DeviceItem key={i} userId={userId} device={device} />;
  });
  if (isExpanded) {
    const keyStart = unverifiedDevices.length;
    deviceList = deviceList.concat(
      expandSectionDevices.map((device, i) => {
        return <DeviceItem key={i + keyStart} userId={userId} device={device} />;
      })
    );
  }

  return (
    <View>
      <View>{deviceList}</View>
      <View>{expandButton}</View>
    </View>
  );
}

const UserOptionsSection: React.FC<{
  member: RoomMember;
  isIgnored: boolean;
  canInvite: boolean;
}> = ({ member, isIgnored, canInvite }) => {
  const cli: any = matrix.getClient();
  const navigation = useNavigation();
  const room = useRoom();

  let ignoreButton: JSX.Element | null = null;
  let insertPillButton: JSX.Element | null = null;
  let inviteUserButton: JSX.Element | null = null;
  let readReceiptButton: JSX.Element | null = null;

  const isMe = member.userId === cli.getUserId();

  const onShareUserClick = () => {};

  // Only allow the user to ignore the user if its not ourselves
  // same goes for jumping to read receipt
  if (!isMe) {
    const onIgnoreToggle = () => {
      const ignoredUsers = cli.getIgnoredUsers();
      if (isIgnored) {
        const index = ignoredUsers.indexOf(member.userId);
        if (index !== -1) ignoredUsers.splice(index, 1);
      } else {
        ignoredUsers.push(member.userId);
      }

      cli.setIgnoredUsers(ignoredUsers);
    };

    ignoreButton = (
      <Button
        label={isIgnored ? _t('Unignore') : _t('Ignore')}
        onPress={onIgnoreToggle}
        // className={classNames('mx_UserInfo_field', {
        //   mx_UserInfo_destructive: !isIgnored,
        // })}
      />
    );

    if (member.roomId) {
      const onReadReceiptButton = function () {
        const room = cli.getRoom(member.roomId);
        // TODO: navigate
        // dis.dispatch({
        //   action: 'view_room',
        //   highlighted: true,
        //   event_id: room.getEventReadUpTo(member.userId),
        //   room_id: member.roomId,
        // });
      };

      const onInsertPillButton = function () {
        // TODO: navigate
        // dis.dispatch({
        //   action: 'insert_mention',
        //   user_id: member.userId,
        // });
      };

      const room = cli.getRoom(member.roomId);
      if (room?.getEventReadUpTo(member.userId)) {
        readReceiptButton = (
          <Button label={_t('Jump to read receipt')} onPress={onReadReceiptButton} disabled />
        );
      }

      insertPillButton = <Button label={_t('Mention')} onPress={onInsertPillButton} disabled />;
    }

    if (canInvite && (!member || !member.membership || member.membership === 'leave')) {
      const roomId = member && member.roomId ? member.roomId : room.roomId;

      const onInviteUserButton = async () => {
        try {
          // We use a MultiInviter to re-use the invite logic, even though
          // we're only inviting one user.
          const inviter = new MultiInviter(roomId);
          await inviter.invite([member.userId]).then(() => {
            if (inviter.getCompletionState(member.userId) !== 'invited') {
              throw new Error(inviter.getErrorText(member.userId));
            }
          });
        } catch (err) {
          showError({
            title: _t('Failed to invite'),
            description: err && err.message ? err.message : _t('Operation failed'),
          });
        }
      };

      inviteUserButton = <Button label={_t('Invite')} onPress={onInviteUserButton} />;
    }
  }

  const shareUserButton = (
    <Button label={_t('Share Link to User')} onPress={onShareUserClick} disabled />
  );

  let directMessageButton;
  if (!isMe) {
    directMessageButton = (
      <Button
        label={_t('Direct message')}
        disabled
        onPress={() => openDMForUser(cli, member.userId, navigation)}
      />
    );
  }

  return (
    <View style={[ThemedStyles.style.paddingHorizontal4x, ThemedStyles.style.paddingVertical2x]}>
      <Text
        style={[
          ThemedStyles.style.fontXL,
          ThemedStyles.style.colorSecondaryText,
          ThemedStyles.style.marginBottom2x,
        ]}>
        {_t('Options')}
      </Text>
      <View>
        {directMessageButton}
        {readReceiptButton}
        {shareUserButton}
        {insertPillButton}
        {inviteUserButton}
        {ignoreButton}
      </View>
    </View>
  );
};

const GenericAdminToolsContainer: React.FC<{}> = ({ children }) => {
  return (
    <View style={[ThemedStyles.style.paddingHorizontal4x, ThemedStyles.style.paddingVertical2x]}>
      <Text
        style={[
          ThemedStyles.style.fontXL,
          ThemedStyles.style.colorSecondaryText,
          ThemedStyles.style.marginBottom2x,
        ]}>
        {_t('Admin Tools')}
      </Text>
      <View>{children}</View>
    </View>
  );
};

interface IPowerLevelsContent {
  events?: Record<string, number>;
  // eslint-disable-next-line camelcase
  users_default?: number;
  // eslint-disable-next-line camelcase
  events_default?: number;
  // eslint-disable-next-line camelcase
  state_default?: number;
  ban?: number;
  kick?: number;
  redact?: number;
}

const isMuted = (member: RoomMember, powerLevelContent: IPowerLevelsContent) => {
  if (!powerLevelContent || !member) return false;

  const levelToSend =
    (powerLevelContent.events ? powerLevelContent.events['m.room.message'] : null) ||
    powerLevelContent.events_default;
  return member.powerLevel < Number(levelToSend);
};

export const useRoomPowerLevels = (cli: MatrixClient, room: Room) => {
  const [powerLevels, setPowerLevels] = useState<IPowerLevelsContent>({});

  const update = useCallback(() => {
    if (!room) {
      return;
    }
    const event = room.currentState.getStateEvents('m.room.power_levels', '');
    if (event) {
      setPowerLevels(event.getContent());
    } else {
      setPowerLevels({});
    }
    return () => {
      setPowerLevels({});
    };
  }, [room]);

  useEventEmitter(cli, 'RoomState.members', update);
  useEffect(() => {
    update();
    return () => {
      setPowerLevels({});
    };
  }, [update]);
  return powerLevels;
};

interface IBaseProps {
  member: RoomMember;

  startUpdating(): void;

  stopUpdating(): void;
}

const RoomKickButton: React.FC<IBaseProps> = ({ member, startUpdating, stopUpdating }) => {
  const cli: any = matrix.getClient();

  // check if user can be kicked/disinvited
  if (member.membership !== 'invite' && member.membership !== 'join') return null;

  const onKick = async () => {
    const finished = await confirm({
      member,
      action: member.membership === 'invite' ? _t('Disinvite') : _t('Kick'),
      title: member.membership === 'invite' ? _t('Disinvite this user?') : _t('Kick this user?'),
      askReason: member.membership === 'join',
      danger: true,
    });

    const [proceed, reason] = finished;
    if (!proceed) return;

    startUpdating();
    cli
      .kick(member.roomId, member.userId, reason || undefined)
      .then(
        () => {
          // NO-OP; rely on the m.room.member event coming down else we could
          // get out of sync if we force setState here!
          console.log('Kick success');
        },
        function (err) {
          console.error('Kick error: ' + err);
          showError({
            title: _t('Failed to kick'),
            description: err && err.message ? err.message : 'Operation failed',
          });
        }
      )
      .finally(() => {
        stopUpdating();
      });
  };

  const kickLabel = member.membership === 'invite' ? _t('Disinvite') : _t('Kick');
  return <Button type={'danger'} label={kickLabel} onPress={onKick} />;
};

const RedactMessagesButton: React.FC<IBaseProps> = ({ member }) => {
  const cli: any = matrix.getClient();

  const onRedactAllMessages = async () => {
    const { roomId, userId } = member;
    const room = cli.getRoom(roomId);
    if (!room) {
      return;
    }
    let timeline = room.getLiveTimeline();
    let eventsToRedact = [];
    while (timeline) {
      eventsToRedact = timeline.getEvents().reduce((events, event) => {
        if (
          event.getSender() === userId &&
          !event.isRedacted() &&
          !event.isRedaction() &&
          event.getType() !== EventType.RoomCreate &&
          // Don't redact ACLs because that'll obliterate the room
          // See https://github.com/matrix-org/synapse/issues/4042 for details.
          event.getType() !== EventType.RoomServerAcl
        ) {
          return events.concat(event);
        } else {
          return events;
        }
      }, eventsToRedact);
      timeline = timeline.getNeighbouringTimeline(EventTimeline.BACKWARDS);
    }

    const count = eventsToRedact.length;
    const user = member.name;

    if (count === 0) {
      showInfo({
        title: _t('No recent messages by {{user}} found', { user }),
        description: (
          <View>
            <Text>
              {_t('Try scrolling up in the timeline to see if there are any earlier ones.')}
            </Text>
          </View>
        ),
      });
    } else {
      const [confirmed] = await confirm({
        title: _t('Remove recent messages by {{user}}', { user }),
        description: `
          ${_t(
            'You are about to remove {{count}} messages by {{user}}. ' +
              'This cannot be undone. Do you wish to continue?',
            { count, user }
          )}
          
          ${_t(
            'For a large amount of messages, this might take some time. ' +
              "Please don't refresh your client in the meantime."
          )}
          `,
        action: _t('Remove {{count}} messages', { count }),
      });
      if (!confirmed) {
        return;
      }

      // Submitting a large number of redactions freezes the UI,
      // so first yield to allow to rerender after closing the dialog.
      await Promise.resolve();

      console.info(`Started redacting recent ${count} messages for ${user} in ${roomId}`);
      await Promise.all(
        eventsToRedact.map(async (event: any) => {
          try {
            await cli.redactEvent(roomId, event.getId());
          } catch (err) {
            // log and swallow errors
            console.error('Could not redact', event.getId());
            console.error(err);
          }
        })
      );
      console.info(`Finished redacting recent ${count} messages for ${user} in ${roomId}`);
    }
  };

  return (
    <Button type={'danger'} label={_t('Remove recent messages')} onPress={onRedactAllMessages} />
  );
};

const BanToggleButton: React.FC<IBaseProps> = ({ member, startUpdating, stopUpdating }) => {
  const cli: any = matrix.getClient();

  const onBanOrUnban = async () => {
    const finished = await confirm({
      member,
      action: member.membership === 'ban' ? _t('Unban') : _t('Ban'),
      title: member.membership === 'ban' ? _t('Unban this user?') : _t('Ban this user?'),
      askReason: member.membership !== 'ban',
      danger: member.membership !== 'ban',
    });

    const [proceed, reason] = finished;
    if (!proceed) return;

    startUpdating();
    let promise;
    if (member.membership === 'ban') {
      promise = cli.unban(member.roomId, member.userId);
    } else {
      promise = cli.ban(member.roomId, member.userId, reason || undefined);
    }
    promise
      .then(
        () => {
          // NO-OP; rely on the m.room.member event coming down else we could
          // get out of sync if we force setState here!
          console.log('Ban success');
        },
        function (err) {
          console.error('Ban error: ' + err);
          showError({
            title: _t('Error'),
            description: _t('Failed to ban user'),
          });
        }
      )
      .finally(() => {
        stopUpdating();
      });
  };

  let label = _t('Ban');
  if (member.membership === 'ban') {
    label = _t('Unban');
  }

  // const classes = classNames('mx_UserInfo_field', {
  //   mx_UserInfo_destructive: member.membership !== 'ban',
  // });

  return <Button type={'danger'} onPress={onBanOrUnban} label={label} />;
};

interface IBaseRoomProps extends IBaseProps {
  room: Room;
  powerLevels: IPowerLevelsContent;
}

const MuteToggleButton: React.FC<IBaseRoomProps> = ({
  member,
  room,
  powerLevels,
  startUpdating,
  stopUpdating,
}) => {
  const cli: any = matrix.getClient();

  // Don't show the mute/unmute option if the user is not in the room
  if (member.membership !== 'join') return null;

  const muted = isMuted(member, powerLevels);
  const onMuteToggle = async () => {
    const roomId = member.roomId;
    const target = member.userId;

    // if muting self, warn as it may be irreversible
    if (target === cli.getUserId()) {
      try {
        if (!(await warnSelfDemote())) return;
      } catch (e) {
        console.error('Failed to warn about self demotion: ', e);
        return;
      }
    }

    const powerLevelEvent = room.currentState.getStateEvents('m.room.power_levels', '');
    if (!powerLevelEvent) return;

    const powerLevels = powerLevelEvent.getContent();
    const levelToSend =
      (powerLevels.events ? powerLevels.events['m.room.message'] : null) ||
      powerLevels.events_default;
    let level;
    if (muted) {
      // unmute
      level = levelToSend;
    } else {
      // mute
      level = levelToSend - 1;
    }
    level = parseInt(level);

    if (!isNaN(level)) {
      startUpdating();
      cli
        .setPowerLevel(roomId, target, level, powerLevelEvent)
        .then(
          () => {
            // NO-OP; rely on the m.room.member event coming down else we could
            // get out of sync if we force setState here!
            console.log('Mute toggle success');
          },
          function (err) {
            console.error('Mute error: ' + err);
            showError({
              title: _t('Error'),
              description: _t('Failed to mute user'),
            });
          }
        )
        .finally(() => {
          stopUpdating();
        });
    }
  };

  // const classes = classNames('mx_UserInfo_field', {
  //   mx_UserInfo_destructive: !muted,
  // });

  const muteLabel = muted ? _t('Unmute') : _t('Mute');
  return <Button type={'danger'} onPress={onMuteToggle} label={muteLabel} />;
};

const RoomAdminToolsContainer: React.FC<IBaseRoomProps> = ({
  room,
  children,
  member,
  startUpdating,
  stopUpdating,
  powerLevels,
}) => {
  const cli: any = matrix.getClient();
  let kickButton;
  let banButton;
  let muteButton;
  let redactButton;

  const editPowerLevel =
    (powerLevels.events ? powerLevels.events['m.room.power_levels'] : null) ||
    powerLevels.state_default;

  // if these do not exist in the event then they should default to 50 as per the spec
  const {
    ban: banPowerLevel = 50,
    kick: kickPowerLevel = 50,
    redact: redactPowerLevel = 50,
  } = powerLevels;

  const me = room.getMember(cli.getUserId());
  if (!me) {
    // we aren't in the room, so return no admin tooling
    return <View />;
  }

  const isMe = me.userId === member.userId;
  const canAffectUser = member.powerLevel < me.powerLevel || isMe;

  if (canAffectUser && me.powerLevel >= kickPowerLevel) {
    kickButton = (
      <RoomKickButton member={member} startUpdating={startUpdating} stopUpdating={stopUpdating} />
    );
  }
  if (me.powerLevel >= redactPowerLevel) {
    redactButton = (
      <RedactMessagesButton
        member={member}
        startUpdating={startUpdating}
        stopUpdating={stopUpdating}
      />
    );
  }
  if (canAffectUser && me.powerLevel >= banPowerLevel) {
    banButton = (
      <BanToggleButton member={member} startUpdating={startUpdating} stopUpdating={stopUpdating} />
    );
  }
  if (canAffectUser && me.powerLevel >= Number(editPowerLevel)) {
    muteButton = (
      <MuteToggleButton
        member={member}
        room={room}
        powerLevels={powerLevels}
        startUpdating={startUpdating}
        stopUpdating={stopUpdating}
      />
    );
  }

  if (kickButton || banButton || muteButton || redactButton || children) {
    return (
      <GenericAdminToolsContainer>
        {muteButton}
        {kickButton}
        {banButton}
        {redactButton}
        {children}
      </GenericAdminToolsContainer>
    );
  }

  return <View />;
};

interface GroupMember {
  userId: string;
  displayname?: string; // XXX: GroupMember objects are inconsistent :((
  avatarUrl?: string;
}

// const GroupAdminToolsSection: React.FC<{
//   groupId: string;
//   groupMember: GroupMember;
//   startUpdating(): void;
//   stopUpdating(): void;
// }> = ({ children, groupId, groupMember, startUpdating, stopUpdating }) => {
//   const cli: any = matrix.getClient();
//
//   const [isPrivileged, setIsPrivileged] = useState(false);
//   const [isInvited, setIsInvited] = useState(false);
//
//   // Listen to group store changesMember
//   useEffect(() => {
//     let unmounted = false;
//
//     const onGroupStoreUpdated = () => {
//       if (unmounted) return;
//       setIsPrivileged(GroupStore.isUserPrivileged(groupId));
//       setIsInvited(
//         GroupStore.getGroupInvitedMembers(groupId).some(
//           (m) => m.userId === groupMember.userId,
//         ),
//       );
//     };
//
//     GroupStore.registerListener(groupId, onGroupStoreUpdated);
//     onGroupStoreUpdated();
//     // Handle unmount
//     return () => {
//       unmounted = true;
//       GroupStore.unregisterListener(onGroupStoreUpdated);
//     };
//   }, [groupId, groupMember.userId]);
//
//   if (isPrivileged) {
//     const onKick = async () => {
//       const finished = await confirm({
//         matrixClient: cli,
//         groupMember,
//         action: isInvited ? _t('Disinvite') : _t('Remove from community'),
//         title: isInvited
//           ? _t('Disinvite this user from community?')
//           : _t('Remove this user from community?'),
//         danger: true,
//       });
//
//       const [proceed] = finished;
//       if (!proceed) return;
//
//       startUpdating();
//       cli
//         .removeUserFromGroup(groupId, groupMember.userId)
//         .then(() => {
//           // return to the user list
//           dis.dispatch({
//             action: Action.ViewUser,
//             member: null,
//           });
//         })
//         .catch((e) => {
//           showError({
//             title: _t('Error'),
//             description: isInvited
//               ? _t('Failed to withdraw invitation')
//               : _t('Failed to remove user from community'),
//           });
//           console.log(e);
//         })
//         .finally(() => {
//           stopUpdating();
//         });
//     };
//
//     const kickButton = (
//       <Button
//         className="mx_UserInfo_field mx_UserInfo_destructive"
//         onPress={onKick}>
//         {isInvited ? _t('Disinvite') : _t('Remove from community')}
//       </Button>
//     );
//
//     // No make/revoke admin API yet
//     /*const opLabel = this.state.isTargetMod ? _t("Revoke Moderator") : _t("Make Moderator");
//     giveModButton = <Button className="mx_UserInfo_field" onPress={this.onModToggle}>
//         {giveOpLabel}
//     </Button>;*/
//
//     return (
//       <GenericAdminToolsContainer>
//         {kickButton}
//         {children}
//       </GenericAdminToolsContainer>
//     );
//   }
//
//   return <View />;
// };

const useIsSynapseAdmin = (cli: MatrixClient) => {
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    cli.isSynapseAdministrator().then(
      (isAdmin) => {
        setIsAdmin(isAdmin);
      },
      () => {
        setIsAdmin(false);
      }
    );
  }, [cli]);
  return isAdmin;
};

const useHomeserverSupportsCrossSigning = (cli: MatrixClient) => {
  return useAsyncMemo<boolean>(
    async () => {
      return cli.doesServerSupportUnstableFeature('org.matrix.e2e_cross_signing');
    },
    [cli],
    false
  );
};

interface IRoomPermissions {
  modifyLevelMax: number;
  canEdit: boolean;
  canInvite: boolean;
}

export function useRoomPermissions(cli: MatrixClient, room: Room, user: User): IRoomPermissions {
  const [roomPermissions, setRoomPermissions] = useState<IRoomPermissions>({
    // modifyLevelMax is the max PL we can set this user to, typically min(their PL, our PL) && canSetPL
    modifyLevelMax: -1,
    canEdit: false,
    canInvite: false,
  });
  const updateRoomPermissions = useCallback(() => {
    if (!room) {
      return;
    }

    const powerLevelEvent = room.currentState.getStateEvents('m.room.power_levels', '');
    if (!powerLevelEvent) return;
    const powerLevels = powerLevelEvent.getContent();
    if (!powerLevels) return;

    const me = room.getMember(cli.getUserId());
    if (!me) return;

    const them = user;
    const isMe = me.userId === them.userId;
    const canAffectUser = them.powerLevel < me.powerLevel || isMe;

    let modifyLevelMax = -1;
    if (canAffectUser) {
      const editPowerLevel =
        (powerLevels.events ? powerLevels.events['m.room.power_levels'] : null) ||
        powerLevels.state_default;
      if (me.powerLevel >= editPowerLevel && (isMe || me.powerLevel > them.powerLevel)) {
        modifyLevelMax = me.powerLevel;
      }
    }

    setRoomPermissions({
      canInvite: me.powerLevel >= powerLevels.invite,
      canEdit: modifyLevelMax >= 0,
      modifyLevelMax,
    });
  }, [cli, user, room]);
  useEventEmitter(cli, 'RoomState.members', updateRoomPermissions);
  useEffect(() => {
    updateRoomPermissions();
    return () => {
      setRoomPermissions({
        modifyLevelMax: -1,
        canEdit: false,
        canInvite: false,
      });
    };
  }, [updateRoomPermissions]);

  return roomPermissions;
}

const PowerLevelSection: React.FC<{
  user: User;
  room: Room;
  roomPermissions: IRoomPermissions;
  powerLevels: IPowerLevelsContent;
}> = ({ user, room, roomPermissions, powerLevels }) => {
  if (roomPermissions.canEdit) {
    return <PowerLevelEditor user={user} room={room} roomPermissions={roomPermissions} />;
  } else {
    const powerLevelUsersDefault = powerLevels.users_default || 0;
    const powerLevel = parseInt(user.powerLevel, 10);
    const role = textualPowerLevel(powerLevel, powerLevelUsersDefault);
    return (
      <View style={ThemedStyles.style.alignCenter}>
        <Text style={ThemedStyles.style.colorTertiaryText}>{role}</Text>
      </View>
    );
  }
};

const PowerLevelEditor: React.FC<{
  user: User;
  room: Room;
  roomPermissions: IRoomPermissions;
}> = ({ user, room, roomPermissions }) => {
  const cli: any = matrix.getClient();

  const [selectedPowerLevel, setSelectedPowerLevel] = useState(parseInt(user.powerLevel, 10));
  const onPowerChange = useCallback(
    async (powerLevelStr: string) => {
      const powerLevel = parseInt(powerLevelStr, 10);
      setSelectedPowerLevel(powerLevel);

      const applyPowerChange = (roomId, target, powerLevel, powerLevelEvent) => {
        return cli.setPowerLevel(roomId, target, parseInt(powerLevel), powerLevelEvent).then(
          function () {
            // NO-OP; rely on the m.room.member event coming down else we could
            // get out of sync if we force setState here!
            console.log('Power change success');
          },
          function (err) {
            console.error('Failed to change power level ' + err);
            showError({
              title: _t('Error'),
              description: _t('Failed to change power level'),
            });
          }
        );
      };

      const roomId = user.roomId;
      const target = user.userId;

      const powerLevelEvent = room.currentState.getStateEvents('m.room.power_levels', '');
      if (!powerLevelEvent) return;

      const myUserId = cli.getUserId();
      const myPower = powerLevelEvent.getContent().users[myUserId];
      if (myPower && parseInt(myPower) === powerLevel) {
        const confirmed = ask({
          title: _t('Warning!'),
          description: (
            <View>
              {_t(
                'You will not be able to undo this change as you are promoting the user ' +
                  'to have the same power level as yourself.'
              )}
              <br />
              {_t('Are you sure?')}
            </View>
          ),
          button: _t('Continue'),
        });
        if (!confirmed) return;
      } else if (myUserId === target) {
        // If we are changing our own PL it can only ever be decreasing, which we cannot reverse.
        try {
          if (!(await warnSelfDemote())) return;
        } catch (e) {
          console.error('Failed to warn about self demotion: ', e);
        }
      }

      await applyPowerChange(roomId, target, powerLevel, powerLevelEvent);
    },
    [user.roomId, user.userId, cli, room]
  );

  const powerLevelEvent = room.currentState.getStateEvents('m.room.power_levels', '');
  const powerLevelUsersDefault = powerLevelEvent ? powerLevelEvent.getContent().users_default : 0;

  return (
    <View>
      <PowerSelector
        value={String(selectedPowerLevel)}
        maxValue={roomPermissions.modifyLevelMax}
        usersDefault={powerLevelUsersDefault}
        onChange={onPowerChange}
      />
    </View>
  );
};

export const useDevices = (userId: string) => {
  const cli: any = matrix.getClient();

  // undefined means yet to be loaded, null means failed to load, otherwise list of devices
  const [devices, setDevices] = useState(undefined);
  // Download device lists
  useEffect(() => {
    setDevices(undefined);

    let cancelled = false;

    async function downloadDeviceList() {
      try {
        await cli.downloadKeys([userId], true);
        const devices = cli.getStoredDevicesForUser(userId);

        if (cancelled) {
          // we got cancelled - presumably a different user now
          return;
        }

        disambiguateDevices(devices);
        setDevices(devices);
      } catch (err) {
        setDevices(undefined);
      }
    }

    downloadDeviceList();

    // Handle being unmounted
    return () => {
      cancelled = true;
    };
  }, [cli, userId]);

  // Listen to changes
  useEffect(() => {
    let cancel = false;
    const updateDevices = async () => {
      const newDevices = cli.getStoredDevicesForUser(userId);
      if (cancel) return;
      setDevices(newDevices);
    };
    const onDevicesUpdated = (users) => {
      if (!users.includes(userId)) return;
      updateDevices();
    };
    const onDeviceVerificationChanged = (_userId, device) => {
      if (_userId !== userId) return;
      updateDevices();
    };
    const onUserTrustStatusChanged = (_userId, trustStatus) => {
      if (_userId !== userId) return;
      updateDevices();
    };
    cli.on('crypto.devicesUpdated', onDevicesUpdated);
    cli.on('deviceVerificationChanged', onDeviceVerificationChanged);
    cli.on('userTrustStatusChanged', onUserTrustStatusChanged);
    // Handle being unmounted
    return () => {
      cancel = true;
      cli.removeListener('crypto.devicesUpdated', onDevicesUpdated);
      cli.removeListener('deviceVerificationChanged', onDeviceVerificationChanged);
      cli.removeListener('userTrustStatusChanged', onUserTrustStatusChanged);
    };
  }, [cli, userId]);

  return devices;
};

const BasicUserInfo: React.FC<{
  room: Room;
  member: User | RoomMember;
  groupId: string;
  devices: IDevice[];
  isRoomEncrypted: boolean;
}> = ({ room, member, groupId, devices, isRoomEncrypted }) => {
  const cli: any = matrix.getClient();

  const powerLevels = useRoomPowerLevels(cli, room);
  // Load whether or not we are a Synapse Admin
  const isSynapseAdmin = useIsSynapseAdmin(cli);

  // Check whether the user is ignored
  const [isIgnored, setIsIgnored] = useState(cli.isUserIgnored(member.userId));
  // Recheck if the user or client changes
  useEffect(() => {
    setIsIgnored(cli.isUserIgnored(member.userId));
  }, [cli, member.userId]);
  // Recheck also if we receive new accountData m.ignored_user_list
  const accountDataHandler = useCallback(
    (ev) => {
      if (ev.getType() === 'm.ignored_user_list') {
        setIsIgnored(cli.isUserIgnored(member.userId));
      }
    },
    [cli, member.userId]
  );
  useEventEmitter(cli, 'accountData', accountDataHandler);

  // Count of how many operations are currently in progress, if > 0 then show a Spinner
  const [pendingUpdateCount, setPendingUpdateCount] = useState(0);
  const startUpdating = useCallback(() => {
    setPendingUpdateCount(pendingUpdateCount + 1);
  }, [pendingUpdateCount]);
  const stopUpdating = useCallback(() => {
    setPendingUpdateCount(pendingUpdateCount - 1);
  }, [pendingUpdateCount]);

  const roomPermissions = useRoomPermissions(cli, room, member);

  const onSynapseDeactivate = useCallback(async () => {
    const confirmed = await ask({
      title: _t('Deactivate user?'),
      description: (
        <Text>
          {_t(
            'Deactivating this user will log them out and prevent them from logging back in. Additionally, ' +
              'they will leave all the rooms they are in. This action cannot be reversed. Are you sure you ' +
              'want to deactivate this user?'
          )}
        </Text>
      ),
      button: _t('Deactivate user'),
      danger: true,
    });
    if (!confirmed) return;
    try {
      await cli.deactivateSynapseUser(member.userId);
    } catch (err) {
      console.error('Failed to deactivate user');
      console.error(err);

      showError({
        title: _t('Failed to deactivate user'),
        description: err && err.message ? err.message : _t('Operation failed'),
      });
    }
  }, [cli, member.userId]);

  let synapseDeactivateButton;
  let spinner;

  let adminToolsContainer;
  if (room && member.roomId) {
    adminToolsContainer = (
      <RoomAdminToolsContainer
        powerLevels={powerLevels}
        member={member}
        room={room}
        startUpdating={startUpdating}
        stopUpdating={stopUpdating}>
        {synapseDeactivateButton}
      </RoomAdminToolsContainer>
    );
  } else if (groupId) {
    // adminToolsContainer = (
    //   <GroupAdminToolsSection
    //     groupId={groupId}
    //     groupMember={member}
    //     startUpdating={startUpdating}
    //     stopUpdating={stopUpdating}>
    //     {synapseDeactivateButton}
    //   </GroupAdminToolsSection>
    // );
  } else if (synapseDeactivateButton) {
    adminToolsContainer = (
      <GenericAdminToolsContainer>{synapseDeactivateButton}</GenericAdminToolsContainer>
    );
  }

  if (pendingUpdateCount > 0) {
    spinner = <Spinner />;
  }

  let memberDetails;
  // hide the Roles section for DMs as it doesn't make sense there
  // console.log('room', room)
  // console.log('member.roomId', member)
  // console.log('DMRoomMap.shared().getUserIdForRoomId(member.roomId)', DMRoomMap.shared().getUserIdForRoomId(member.roomId))
  if (room && member.roomId && !DMRoomMap.shared().getUserIdForRoomId(member.roomId)) {
    memberDetails = (
      <PowerLevelSection
        powerLevels={powerLevels}
        user={member}
        room={room}
        roomPermissions={roomPermissions}
      />
    );
  }

  // only display the devices list if our client supports E2E
  const cryptoEnabled = cli.isCryptoEnabled();

  let text;
  if (!isRoomEncrypted) {
    if (!cryptoEnabled) {
      text = _t('This client does not support end-to-end encryption.');
    } else if (room) {
      text = _t('Messages in this room are not end-to-end encrypted.');
    } else {
      // TODO what to render for GroupMember
    }
  } else {
    text = _t('Messages in this room are end-to-end encrypted.');
  }

  let verifyButton;
  const homeserverSupportsCrossSigning = useHomeserverSupportsCrossSigning(cli);

  const userTrust = cryptoEnabled && cli.checkUserTrust(member.userId);
  const userVerified = cryptoEnabled && userTrust.isCrossSigningVerified();
  const isMe = member.userId === cli.getUserId();
  const canVerify =
    cryptoEnabled &&
    homeserverSupportsCrossSigning &&
    !userVerified &&
    !isMe &&
    devices &&
    devices.length > 0;

  const setUpdating = (updating) => {
    setPendingUpdateCount((count) => count + (updating ? 1 : -1));
  };
  const hasCrossSigningKeys = useHasCrossSigningKeys(cli, member, canVerify, setUpdating);

  const showDeviceListSpinner = devices === undefined;
  if (canVerify) {
    if (hasCrossSigningKeys !== undefined) {
      // Note: mx_UserInfo_verifyButton is for the end-to-end tests
      verifyButton = (
        <Button
          label={_t('Verify')}
          disabled
          onPress={() => {
            if (hasCrossSigningKeys) {
              // verifyUser(member);
            } else {
              // legacyVerifyUser(member);
            }
          }}
        />
      );
    } else if (!showDeviceListSpinner) {
      // HACK: only show a spinner if the device section spinner is not shown,
      // to avoid showing a double spinner
      // We should ask for a design that includes all the different loading states here
      verifyButton = <Spinner />;
    }
  }

  const securitySection = (
    <View style={[ThemedStyles.style.paddingHorizontal4x, ThemedStyles.style.paddingVertical2x]}>
      <Text
        style={[
          ThemedStyles.style.fontXL,
          ThemedStyles.style.colorSecondaryText,
          ThemedStyles.style.marginBottom2x,
        ]}>
        {_t('Security')}
      </Text>
      <Text style={ThemedStyles.style.marginBottom}>{text}</Text>
      {verifyButton}
      {cryptoEnabled && (
        <DevicesSection loading={showDeviceListSpinner} devices={devices} userId={member.userId} />
      )}
    </View>
  );

  return (
    <View style={ThemedStyles.style.paddingVertical4x}>
      {memberDetails}

      {securitySection}
      <UserOptionsSection
        canInvite={roomPermissions.canInvite}
        isIgnored={isIgnored}
        member={member}
      />

      {adminToolsContainer}

      {spinner}
    </View>
  );
};

type Member = User | RoomMember | GroupMember;

const UserInfoHeader: React.FC<{
  member: Member;
  e2eStatus: E2EStatus;
}> = ({ member, e2eStatus }) => {
  const cli: any = matrix.getClient();
  const { width } = useDimensions().window;

  const onMemberAvatarClick = useCallback(() => {
    const avatarUrl = member.getMxcAvatarUrl ? member.getMxcAvatarUrl() : member.avatarUrl;
    if (!avatarUrl) return;

    const httpUrl = cli.mxcUrlToHttp(avatarUrl);
    const params = {
      src: httpUrl,
      name: member.name,
    };

    // TODO: show imageViewModal
    // Modal.createDialog(ImageView, params, 'mx_Dialog_lightbox');
  }, [cli, member]);
  const avatarUrl = member.getMxcAvatarUrl ? member.getMxcAvatarUrl() : member.avatarUrl;

  const avatarElement = (
    <Avatar
      key={member.userId} // to instantly blank the avatar when UserInfo changes members
      // member={member}
      size={0.3 * width} // 2x@30vh
      // height={2 * 0.3 * height} // 2x@30vh
      // resizeMethod="scale"
      name={member.displayName || member.userId}
      // onPress={onMemberAvatarClick}
      avatarURI={member.user?.avatarUrl ? cli.mxcUrlToHttp(member.user.avatarUrl) : undefined}
    />
  );

  let presenceState;
  let presenceLastActiveAgo;
  let presenceCurrentlyActive;
  let statusMessage;

  // if (member instanceof RoomMember && member.user) {
  //   presenceState = member.user.presence;
  //   presenceLastActiveAgo = member.user.lastActiveAgo;
  //   presenceCurrentlyActive = member.user.currentlyActive;
  //
  //   if (false /*SettingsStore.getValue('feature_custom_status')*/) {
  //     statusMessage = member.user._unstable_statusMessage;
  //   }
  // }

  const enablePresenceByHsUrl = true;
  let showPresence = true;
  if (enablePresenceByHsUrl && enablePresenceByHsUrl[cli.baseUrl] !== undefined) {
    showPresence = enablePresenceByHsUrl[cli.baseUrl];
  }

  let presenceLabel: JSX.Element | null = null;
  // FIXME
  if (false && showPresence) {
    presenceLabel = (
      <PresenceLabel
        activeAgo={presenceLastActiveAgo}
        currentlyActive={presenceCurrentlyActive}
        presenceState={presenceState}
      />
    );
  }

  let statusLabel: JSX.Element | null = null;
  if (statusMessage) {
    statusLabel = <Text>{statusMessage}</Text>;
  }

  let e2eIcon;
  if (e2eStatus) {
    // TODO: component
    // e2eIcon = <E2EIcon size={18} status={e2eStatus} isUser={true} />;
  }

  const displayName = member.name || member.displayname;
  return (
    <View style={ThemedStyles.style.alignCenter}>
      {avatarElement}

      <View style={[ThemedStyles.style.alignCenter, ThemedStyles.style.paddingTop]}>
        <View>
          <Text>
            {/**
             * TODO: e2eIcon
             * */}
            <Text style={[ThemedStyles.style.bold, ThemedStyles.style.fontXL]}>{displayName}</Text>
          </Text>
        </View>
        <Text style={[ThemedStyles.style.colorTertiaryText, ThemedStyles.style.fontS]}>
          {member.userId}
        </Text>
        <View>
          {presenceLabel}
          {statusLabel}
        </View>
      </View>
    </View>
  );
};

interface IProps {
  user: Member;
  groupId?: string;
  room?: Room;

  onClose(): void;
}

interface IPropsWithEncryptionPanel extends React.ComponentProps<any> {
  user: Member;
  groupId: void;
  room: Room;

  onClose(): void;
}

type Props =
  | IProps
  | (IPropsWithEncryptionPanel & {
      route: any; // UserInfoRouteProp;
      navigation: any; // UserInfoNavigationProp;
    });

// export type UserInfoRouteProp = RouteProp<
//   AppStackParamList & RootStackParamList,
//   'MessengerUserInfo'
// >;
// export type UserInfoNavigationProp = StackNavigationProp<
//   AppStackParamList & RootStackParamList,
//   'MessengerUserInfo'
// >;

const UserInfo: React.FC<{
  route: any; // UserInfoRouteProp;
  navigation: any; // UserInfoNavigationProp;
}> = ({
  route: {
    params: { user, room, groupId },
  },
}) => {
  const cli: any = matrix.getClient();

  // fetch latest room member if we have a room, so we don't show historical information, falling back to user
  const member = useMemo(() => (room ? room.getMember(user.userId) || user : user), [room, user]);
  const isRoomEncrypted = useIsEncrypted(cli, room);
  const devices = useDevices(user.userId);

  let e2eStatus;
  if (isRoomEncrypted && devices) {
    e2eStatus = getE2EStatus(cli, user.userId, devices);
  }

  let content;
  // switch (phase) {
  //   case RightPanelPhases.RoomMemberInfo:
  //   case RightPanelPhases.GroupMemberInfo:
  content = (
    <BasicUserInfo
      room={room}
      member={member}
      groupId={groupId as string}
      devices={devices!} // FIXME: I added ! mindlessly
      isRoomEncrypted={isRoomEncrypted!} // FIXME: I added ! mindlessly
    />
  );
  //     break;
  //   case RightPanelPhases.EncryptionPanel:
  //     classes.push('mx_UserInfo_smallAvatar');
  //     content = (
  //       <EncryptionPanel
  //         {...(props as React.ComponentProps<typeof EncryptionPanel>)}
  //         member={member}
  //         onClose={onClose}
  //         isRoomEncrypted={isRoomEncrypted}
  //       />
  //     );
  //     break;
  // }
  const header = <UserInfoHeader member={member} e2eStatus={e2eStatus} />;
  return (
    <RoomContext.Provider value={{ room }}>
      <Navbar title={user.displayName} />
      <ScrollView contentContainerStyle={ThemedStyles.style.paddingVertical4x}>
        {header}
        {content}
      </ScrollView>
    </RoomContext.Provider>
  );
};

export default UserInfo;
