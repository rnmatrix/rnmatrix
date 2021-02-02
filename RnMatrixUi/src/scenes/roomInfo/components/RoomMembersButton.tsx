import React, { useCallback, useState } from 'react';
import MenuItem from '../../../common/MenuItem';
import { useEventEmitter } from '../../../hooks/useEventEmitter';
import useNavigation from '../../../hooks/useNavigation';
import throttle from '../../../utilities/throttle';

const t = (k) => k; // TODO: translate

// Hook to simplify watching Matrix Room joined member count
export const useRoomMemberCount = (room: any, throttleWait = 250) => {
  const [count, setCount] = useState<number>(
    room._matrixRoom.getJoinedMemberCount(),
  );
  useEventEmitter(
    room._matrixRoom.currentState,
    'RoomState.members',
    throttle(
      () => {
        setCount(room._matrixRoom.getJoinedMemberCount());
      },

      throttleWait,
      { leading: true, trailing: true },
    ),
  );
  return count;
};

const RoomMembersButton = ({ room }) => {
  const navigation = useNavigation();
  const membersCount = useRoomMemberCount(room);
  // const invitedMembers = useObservableState<any>(room.invitedMembers$);

  const onPress = useCallback(
    () => navigation.navigate('MessengerRoomMembersScreen', { room }),
    [navigation, room],
  );

  // if (!members || !invitedMembers) {
  //   return null;
  // }
  // console.log('room', room);
  // const membersCount = members.length;
  // const invitedMemberCount = invitedMembers.length;

  return (
    <MenuItem
      item={{
        title: t(`${membersCount} Members`),
        onPress,
      }}
    />
  );
};

export default RoomMembersButton;
