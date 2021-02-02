/*
Copyright 2019 New Vector Ltd

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

// import { RouteProp } from '@react-navigation/native';
// import { StackNavigationProp } from '@react-navigation/stack';
import { matrix } from '@rn-matrix/core';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import Button from '../../common/Button';
import Navbar from '../../common/Navbar';
// import {
//   AppStackParamList,
//   RootStackParamList,
// } from '../../../../navigation/NavigationTypes';
import ThemedStyles from '../../styles/ThemedStyles';
import PowerSelector from './components/PowerSelector';

// TODO: translate
const _td = (s) => s;
// TODO: translate
const _t = (s, obj?) => {
  if (!obj) return s;

  let count = 0

  return s.replace(/(\{\{)(.*?)(\}\})/gm, (substring: string) => {
    const value = Object.values(obj)[count];
    count++;
    return value;
  });
};

const plEventsToLabels = {
  // These will be translated for us later.
  'm.room.avatar': _td('Change room avatar'),
  'm.room.name': _td('Change room name'),
  'm.room.canonical_alias': _td('Change main address for the room'),
  'm.room.history_visibility': _td('Change history visibility'),
  'm.room.power_levels': _td('Change permissions'),
  'm.room.topic': _td('Change topic'),
  'm.room.tombstone': _td('Upgrade the room'),
  'm.room.encryption': _td('Enable room encryption'),

  // TODO: Enable support for m.widget event type (https://github.com/vector-im/element-web/issues/13111)
  'im.vector.modular.widgets': _td('Modify widgets'),
};

const plEventsToShow = {
  // If an event is listed here, it will be shown in the PL settings. Defaults will be calculated.
  'm.room.avatar': { isState: true },
  'm.room.name': { isState: true },
  'm.room.canonical_alias': { isState: true },
  'm.room.history_visibility': { isState: true },
  'm.room.power_levels': { isState: true },
  'm.room.topic': { isState: true },
  'm.room.tombstone': { isState: true },
  'm.room.encryption': { isState: true },

  // TODO: Enable support for m.widget event type (https://github.com/vector-im/element-web/issues/13111)
  'im.vector.modular.widgets': { isState: true },
};

// parse a string as an integer; if the input is undefined, or cannot be parsed
// as an integer, return a default.
function parseIntWithDefault(val, def) {
  const res = parseInt(val);
  return isNaN(res) ? def : res;
}

type BannedUserProps = {
  canUnban?: boolean;
  member: any; // js-sdk RoomMember
  by: string;
  reason?: string;
};

export class BannedUser extends React.Component<BannedUserProps> {
  _onUnbanClick = (e) => {
    matrix
      .getClient()
      .unban(this.props.member.roomId, this.props.member.userId)
      .catch((err) => {
        // TODO: error
        // const ErrorDialog = sdk.getComponent("dialogs.ErrorDialog");
        // console.error("Failed to unban: " + err);
        // Modal.createTrackedDialog('Failed to unban', '', ErrorDialog, {
        //     title: _t('Error'),
        //     description: _t('Failed to unban'),
        // });
      });
  };

  render() {
    let unbanButton;

    if (this.props.canUnban) {
      unbanButton = <Button text={_t('Unban')} onPress={this._onUnbanClick} />;
    }

    const userId =
      this.props.member.name === this.props.member.userId
        ? null
        : this.props.member.userId;

    return (
      <View>
        {unbanButton}
        <Text>
          <Text style={{ fontWeight: 'bold' }}>{this.props.member.name}</Text>{' '}
          {userId}
          {this.props.reason
            ? ' ' + _t('Reason') + ': ' + this.props.reason
            : ''}
        </Text>
      </View>
    );
  }
}

// export type RolesScreenRouteProp = RouteProp<
//   AppStackParamList & RootStackParamList,
//   'MessengerRolesScreen'
// >;
// export type RolesScreenNavigationProp = StackNavigationProp<
//   AppStackParamList & RootStackParamList,
//   'MessengerRolesScreen'
// >;

type RolesScreenProps = {
  route: any; // RolesScreenRouteProp;
  navigation: any; // RolesScreenNavigationProp;
};

export default class RolesScreen extends React.Component<RolesScreenProps> {
  componentDidMount(): void {
    matrix.getClient().on('RoomState.members', this._onRoomMembership);
  }

  componentWillUnmount(): void {
    const client = matrix.getClient();
    if (client) {
      client.removeListener('RoomState.members', this._onRoomMembership);
    }
  }

  _onRoomMembership = (event, state, member) => {
    if (state.roomId !== this.props.route.params.roomId) return;
    this.forceUpdate();
  };

  _populateDefaultPlEvents(eventsSection, stateLevel, eventsLevel) {
    for (const desiredEvent of Object.keys(plEventsToShow)) {
      if (!(desiredEvent in eventsSection)) {
        eventsSection[desiredEvent] = plEventsToShow[desiredEvent].isState
          ? stateLevel
          : eventsLevel;
      }
    }
  }

  _onPowerLevelsChanged = (value, powerLevelKey) => {
    const client = matrix.getClient();
    const room = client.getRoom(this.props.route.params.roomId);
    const plEvent = room.currentState.getStateEvents('m.room.power_levels', '');
    let plContent = plEvent ? plEvent.getContent() || {} : {};

    // Clone the power levels just in case
    plContent = Object.assign({}, plContent);

    const eventsLevelPrefix = 'event_levels_';

    value = parseInt(value);

    if (powerLevelKey.startsWith(eventsLevelPrefix)) {
      // deep copy "events" object, Object.assign itself won't deep copy
      plContent['events'] = Object.assign({}, plContent['events'] || {});
      plContent['events'][
        powerLevelKey.slice(eventsLevelPrefix.length)
      ] = value;
    } else {
      const keyPath = powerLevelKey.split('.');
      let parentObj;
      let currentObj = plContent;
      for (const key of keyPath) {
        if (!currentObj[key]) {
          currentObj[key] = {};
        }
        parentObj = currentObj;
        currentObj = currentObj[key];
      }
      parentObj[keyPath[keyPath.length - 1]] = value;
    }

    client
      .sendStateEvent(
        this.props.route.params.roomId,
        'm.room.power_levels',
        plContent,
      )
      .catch((e) => {
        console.error(e);

        // TODO: error
        // const ErrorDialog = sdk.getComponent('dialogs.ErrorDialog');
        // Modal.createTrackedDialog(
        //   'Power level requirement change failed',
        //   '',
        //   ErrorDialog,
        //   {
        //     title: _t('Error changing power level requirement'),
        //     description: _t(
        //       "An error occurred changing the room's power level requirements. Ensure you have sufficient " +
        //         'permissions and try again.',
        //     ),
        //   },
        // );
      });
  };

  _onUserPowerLevelChanged = (value, powerLevelKey) => {
    const client = matrix.getClient();
    const room = client.getRoom(this.props.route.params.roomId);
    const plEvent = room.currentState.getStateEvents('m.room.power_levels', '');
    let plContent = plEvent ? plEvent.getContent() || {} : {};

    // Clone the power levels just in case
    plContent = Object.assign({}, plContent);

    // powerLevelKey should be a user ID
    if (!plContent['users']) plContent['users'] = {};
    plContent['users'][powerLevelKey] = value;

    client
      .sendStateEvent(
        this.props.route.params.roomId,
        'm.room.power_levels',
        plContent,
      )
      .catch((e) => {
        console.error(e);

        // TODO: error
        // const ErrorDialog = sdk.getComponent('dialogs.ErrorDialog');
        // Modal.createTrackedDialog(
        //   'Power level change failed',
        //   '',
        //   ErrorDialog,
        //   {
        //     title: _t('Error changing power level'),
        //     description: _t(
        //       "An error occurred changing the user's power level. Ensure you have sufficient " +
        //         'permissions and try again.',
        //     ),
        //   },
        // );
      });
  };

  render() {
    const theme = ThemedStyles.style;
    const client = matrix.getClient();
    const room = client.getRoom(this.props.route.params.roomId);
    const plEvent = room.currentState.getStateEvents('m.room.power_levels', '');
    const plContent = plEvent ? plEvent.getContent() || {} : {};
    const canChangeLevels = room.currentState.mayClientSendStateEvent(
      'm.room.power_levels',
      client,
    );

    const powerLevelDescriptors = {
      users_default: {
        desc: _t('Default role'),
        defaultValue: 0,
      },
      events_default: {
        desc: _t('Send messages'),
        defaultValue: 0,
      },
      invite: {
        desc: _t('Invite users'),
        defaultValue: 50,
      },
      state_default: {
        desc: _t('Change settings'),
        defaultValue: 50,
      },
      kick: {
        desc: _t('Kick users'),
        defaultValue: 50,
      },
      ban: {
        desc: _t('Ban users'),
        defaultValue: 50,
      },
      redact: {
        desc: _t('Remove messages sent by others'),
        defaultValue: 50,
      },
      'notifications.room': {
        desc: _t('Notify everyone'),
        defaultValue: 50,
      },
    };

    const eventsLevels = plContent.events || {};
    const userLevels = plContent.users || {};
    const banLevel = parseIntWithDefault(
      plContent.ban,
      powerLevelDescriptors.ban.defaultValue,
    );
    const defaultUserLevel = parseIntWithDefault(
      plContent.users_default,
      powerLevelDescriptors.users_default.defaultValue,
    );

    let currentUserLevel = userLevels[client.getUserId()];
    if (currentUserLevel === undefined) {
      currentUserLevel = defaultUserLevel;
    }

    this._populateDefaultPlEvents(
      eventsLevels,
      parseIntWithDefault(
        plContent.state_default,
        powerLevelDescriptors.state_default.defaultValue,
      ),
      parseIntWithDefault(
        plContent.events_default,
        powerLevelDescriptors.events_default.defaultValue,
      ),
    );

    const titleStyle = [
      theme.padding2x,
      theme.paddingHorizontal4x,
      theme.fontL,
    ];
    const subTitleStyle = [
      theme.paddingBottom2x,
      theme.paddingHorizontal4x,
      theme.colorTertiaryText,
      theme.fontS,
    ];

    let privilegedUsersSection = (
      <Text style={titleStyle}>
        {_t('No users have specific privileges in this room')}
      </Text>
    );
    let mutedUsersSection;
    if (Object.keys(userLevels).length) {
      const privilegedUsers: JSX.Element[] = [];
      const mutedUsers: JSX.Element[] = [];

      Object.keys(userLevels).forEach((user) => {
        const canChange =
          userLevels[user] < currentUserLevel && canChangeLevels;
        if (userLevels[user] > defaultUserLevel) {
          // privileged
          privilegedUsers.push(
            <PowerSelector
              value={userLevels[user]}
              disabled={!canChange}
              label={user}
              key={user}
              powerLevelKey={user} // Will be sent as the second parameter to `onChange`
              onChange={this._onUserPowerLevelChanged}
            />,
          );
        } else if (userLevels[user] < defaultUserLevel) {
          // muted
          mutedUsers.push(
            <PowerSelector
              value={userLevels[user]}
              disabled={!canChange}
              label={user}
              key={user}
              powerLevelKey={user} // Will be sent as the second parameter to `onChange`
              onChange={this._onUserPowerLevelChanged}
            />,
          );
        }
      });

      // comparator for sorting PL users lexicographically on PL descending, MXID ascending. (case-insensitive)
      const comparator = (a, b) => {
        const plDiff = userLevels[b.key] - userLevels[a.key];
        return plDiff !== 0
          ? plDiff
          : a.key.toLocaleLowerCase().localeCompare(b.key.toLocaleLowerCase());
      };

      privilegedUsers.sort(comparator);
      mutedUsers.sort(comparator);

      if (privilegedUsers.length) {
        privilegedUsersSection = (
          <View /*className="mx_SettingsTab_section mx_SettingsTab_subsectionText"*/
          >
            <View /*className="mx_SettingsTab_subheading"*/>
              <Text style={titleStyle}>{_t('Privileged Users')}</Text>
            </View>
            {privilegedUsers}
          </View>
        );
      }
      if (mutedUsers.length) {
        mutedUsersSection = (
          <View /*className="mx_SettingsTab_section mx_SettingsTab_subsectionText"*/
          >
            <Text style={titleStyle} /*className="mx_SettingsTab_subheading"*/>
              {_t('Muted Users')}
            </Text>
            {mutedUsers}
          </View>
        );
      }
    }

    const banned = room.getMembersWithMembership('ban');
    let bannedUsersSection;
    if (banned.length) {
      const canBanUsers = currentUserLevel >= banLevel;
      bannedUsersSection = (
        <View /*className="mx_SettingsTab_section mx_SettingsTab_subsectionText"*/
        >
          <Text style={titleStyle} /*className="mx_SettingsTab_subheading"*/>
            {_t('Banned users')}
          </Text>
          <View>
            {banned.map((member) => {
              const banEvent = member.events.member.getContent();
              const sender = room.getMember(member.events.member.getSender());
              let bannedBy = member.events.member.getSender(); // start by falling back to mxid
              if (sender) bannedBy = sender.name;
              return (
                <BannedUser
                  key={member.userId}
                  canUnban={canBanUsers}
                  member={member}
                  reason={banEvent.reason}
                  by={bannedBy}
                />
              );
            })}
          </View>
        </View>
      );
    }

    const powerSelectors = Object.keys(powerLevelDescriptors).map(
      (key, index) => {
        const descriptor = powerLevelDescriptors[key];

        const keyPath = key.split('.');
        let currentObj = plContent;
        for (const prop of keyPath) {
          if (currentObj === undefined) {
            break;
          }
          currentObj = currentObj[prop];
        }

        const value = parseIntWithDefault(currentObj, descriptor.defaultValue);
        return (
          <PowerSelector
            key={descriptor.desc}
            label={descriptor.desc}
            value={value}
            usersDefault={defaultUserLevel}
            disabled={!canChangeLevels || currentUserLevel < value}
            powerLevelKey={key} // Will be sent as the second parameter to `onChange`
            onChange={this._onPowerLevelsChanged}
          />
        );
      },
    );

    // hide the power level selector for enabling E2EE if it the room is already encrypted
    if (client.isRoomEncrypted(this.props.route.params.roomId)) {
      delete eventsLevels['m.room.encryption'];
    }

    const eventPowerSelectors = Object.keys(eventsLevels).map(
      (eventType, i) => {
        let label = plEventsToLabels[eventType];
        if (label) {
          label = _t(label);
        } else {
          label = _t('Send {{eventType}}s events', { eventType });
        }
        return (
          <View key={eventType}>
            <PowerSelector
              label={label}
              value={eventsLevels[eventType]}
              usersDefault={defaultUserLevel}
              disabled={
                !canChangeLevels || currentUserLevel < eventsLevels[eventType]
              }
              powerLevelKey={'event_levels_' + eventType}
              onChange={this._onPowerLevelsChanged}
            />
          </View>
        );
      },
    );

    return (
      <>
        <Navbar title="Roles and Responsibilities" />

        <ScrollView
          contentContainerStyle={{
            paddingBottom: 299,
            paddingTop: 16,
          }} /*className="mx_SettingsTab mx_RolesScreen"*/
        >
          {privilegedUsersSection}
          {mutedUsersSection}
          {bannedUsersSection}
          <Text style={titleStyle} /*className="mx_SettingsTab_subheading"*/>
            {_t('Permissions')}
          </Text>
          <Text style={subTitleStyle}>
            {_t(
              'Select the roles required to change various parts of the room',
            )}
          </Text>
          {powerSelectors}
          {eventPowerSelectors}
        </ScrollView>
      </>
    );
  }
}
