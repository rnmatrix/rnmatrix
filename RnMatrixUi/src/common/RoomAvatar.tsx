import userService from '@rn-matrix/core/src/services/user';
import { useObservableState } from 'observable-hooks';
import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ProgressPie from 'react-native-progress/Pie';
import Avatar from './Avatar';
import SmallCircleButton from './SmallCircleButton';
// TODO: add image picker service
// import imagePickerService, {
//   CustomImage,
// } from '../../../../../common/services/image-picker.service';
import colors from '../styles/Colors';
import Color from 'color';
import { matrix } from '@rn-matrix/core';
import ThemedStyles from '../styles/ThemedStyles';
import { getNameColor } from '../utilities/get-name-color';
import { useRoomMemberCount } from '../scenes/roomInfo/components/RoomMembersButton';

const MembersStackedAvatar = ({ members, membersCount, roomName, size }) => {
  const backgroundColor = getNameColor(roomName);
  const color = Color(backgroundColor);
  const myUserId = matrix.getMyUser().id;

  // TODO: put the most relevant user on top. matrix-react-sdk has implemented this neatly.
  const reducedMembers = members.filter((a, b) => a.id !== myUserId).slice(0, 4);

  let avatarSize = size;
  switch (reducedMembers.length) {
    case 1:
      avatarSize = size;
      break;
    case 2:
      avatarSize = size * 0.9;
      break;
    case 3:
      avatarSize = size * 0.85;
      break;
    case 4:
      avatarSize = size * 0.8;
      break;
    default:
  }
  const STACKED_AVATAR_PADDING = avatarSize * 0.18;

  let membersCountText = `+${membersCount - 3}`;
  if (membersCount > 102) {
    membersCountText = `+99`;
  }

  return (
    <View
      style={[
        {
          width: avatarSize + (reducedMembers.length - 1) * STACKED_AVATAR_PADDING,
          height: avatarSize,
          right: (reducedMembers.length - 1) * 1,
        },
      ]}>
      {reducedMembers.map((member, index) =>
        // If its the last item
        {
          const top = index % 2 === 0 ? 0 : STACKED_AVATAR_PADDING * 2;

          return members.length > 4 && index === reducedMembers.length - 1 ? (
            <View
              style={[
                {
                  position: 'absolute',
                  left: STACKED_AVATAR_PADDING * 1.3 * index,
                  width: avatarSize,
                  height: avatarSize,
                  top,
                  borderRadius: avatarSize / 2,
                  backgroundColor,
                },
                ThemedStyles.style.borderPrimary,
                ThemedStyles.style.alignCenter,
                ThemedStyles.style.justifyCenter,
                ThemedStyles.style.borderHair,
              ]}>
              <Text
                style={[
                  {
                    color: color.luminosity() > 0.7 ? colors.dark : colors.light,
                    fontSize: avatarSize / 2.5,
                  },
                ]}>
                {membersCountText}
              </Text>
            </View>
          ) : (
            <Avatar
              name={member.name$.getValue() || member.id}
              avatarURI={userService.getAvatarUrl(member.avatar$.getValue())}
              size={avatarSize}
              style={[
                {
                  position: 'absolute',
                  left: STACKED_AVATAR_PADDING * 1.3 * index,
                  top,
                },
                ThemedStyles.style.borderPrimary,
                ThemedStyles.style.borderHair,
              ]}
            />
          );
        }
      )}
    </View>
  );
};

const DEFAULT_AVATAR_SIZE = 120;

type RoomAvatarProps = {
  room: any;
  style?: any;
  canEdit?: boolean;
  size?: number;
};

const RoomAvatar = ({ room, canEdit, style, size = DEFAULT_AVATAR_SIZE }: RoomAvatarProps) => {
  const theme = ThemedStyles.style;
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const name = useObservableState(room.name$);
  const membersCount = useRoomMemberCount(room);
  const uploadAvatar = useCallback(async () => {
    // TODO: add image picker service
    // try {
    //   setError('');
    //   const response = await imagePickerService.show(
    //     '',
    //     'photo',
    //     true,
    //     1024,
    //     1024,
    //   );
    //   let file: CustomImage;
    //
    //   if (response !== false && !Array.isArray(response)) {
    //     file = response;
    //   } else {
    //     return false;
    //   }
    //   setUploading(true);
    //   await room.setAvatar(file, {
    //     progressHandler: ({ loaded, total }) => {
    //       if (total && loaded) {
    //         setProgress(total / loaded);
    //       }
    //     },
    //   });
    //   setUploading(false);
    //   setProgress(0);
    // } catch (e) {
    //   console.log(e);
    //
    //   setError(e);
    //   setProgress(0);
    //   setUploading(false);
    // }
  }, [room]);

  const avatarURI = useMemo(() => room.getAvatarUrl(size), [size, room]);
  const roomMembers = useMemo(() => room.getMembers(), [room]);

  return (
    <View style={[theme.centered, ThemedStyles.style.marginHorizontal2x, style]}>
      {avatarURI || roomMembers.length <= 2 ? (
        <Avatar name={name || room.name$.getValue()} size={size} avatarURI={avatarURI} />
      ) : (
        <MembersStackedAvatar
          roomName={name || room.name$.getValue()}
          members={room.getMembers()}
          membersCount={membersCount}
          size={size}
        />
      )}
      {canEdit && (
        <SmallCircleButton name="camera" style={styles.avatarSmallButton} onPress={uploadAvatar} />
      )}
      {uploading ? (
        <View style={[styles.tapOverlayView, styles.wrappedAvatarOverlayView]}>
          <ProgressPie progress={progress} size={36} />
        </View>
      ) : null}
    </View>
  );
};

export default RoomAvatar;

const styles = StyleSheet.create({
  avatarSmallButton: {
    position: 'absolute',
    top: -10,
    right: -10,
  },
  tapOverlayView: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: '#000',
    opacity: 0.65,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wrappedAvatarOverlayView: {
    borderRadius: 55,
  },
});
