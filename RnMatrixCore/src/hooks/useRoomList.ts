import { Room } from 'matrix-js-sdk/src/models/room';
import { RoomMember } from 'matrix-js-sdk/src/models/room-member';
import { useEffect, useState } from 'react';
import matrix from '../services/matrix';
import MatrixEvent from '../types/MatrixEvent';

export default function useRoomList() {
  const [roomList, setRoomList] = useState([]);
  const [inviteList, setInviteList] = useState([]);

  useEffect(() => {
    updateLists()
  }, []);

  const startListeners = () => {
    console.log('start')
    removeListeners();
    matrix.getClient().on('Room', onRoom);
    matrix.getClient().on('Room.timeline', onRoomTimeline);
    matrix.getClient().on('RoomMember.typing', onTyping);
    matrix.getClient().on('Room.myMembership', updateLists);
  };

  const removeListeners = () => {
    matrix.getClient().removeListener('Room', onRoom);
    matrix.getClient().removeListener('Room.timeline', onRoomTimeline);
    matrix.getClient().removeListener('RoomMember.typing', onTyping);
    matrix.getClient().removeListener('Room.myMembership', updateLists);
  };

  const updateLists = () => {
    const rooms = matrix.getClient().getVisibleRooms();
    const invites = matrix.getClient().getRooms().filter(r => r.getMyMembership() === 'invite');
    setRoomList(sortRoomList(rooms));
    setInviteList(invites)
  }

  const sortRoomList = (list) => {
    return list
      .filter((r) => r.getMyMembership() === 'join')
      .sort(
        (b, a) =>
          a.timeline[a.timeline.length - 1].getTs() - b.timeline[b.timeline.length - 1].getTs()
      );
  };

  const onRoom = (room: Room) => {
    console.log('onRoom', room);
    if (room.getMyMembership() === 'join') {
      updateRoom(room)
    } else if (room.getMyMembership() === 'invite') {
      const newInviteList = [...inviteList];
      const foundInviteIndex = inviteList.find((r) => r.roomId === room.roomId);
      if (foundInviteIndex >= 0) {
        newInviteList[foundInviteIndex] = room;
      } else {
        newInviteList.push(room);
      }
      setInviteList(newInviteList);
    }
  };
  const onRoomTimeline = (event: MatrixEvent, room: Room) => {
    console.log('onRoomTimeline', event, room);
    if (room.getMyMembership() === 'join') {
      updateRoom(room)
    } else if (room.getMyMembership() === 'leave') {
      const newRoomList = [...roomList];
      const foundRoomIndex = roomList.findIndex((r) => r.roomId === room.roomId);
      if (foundRoomIndex >= 0) {
        delete newRoomList[foundRoomIndex];
      }
      setRoomList(sortRoomList(newRoomList))
    }
  };

  const updateRoom = room => {
    const newRoomList = [...roomList];
    const foundRoomIndex = roomList.findIndex((r) => r.roomId === room.roomId);
    if (foundRoomIndex >= 0) {
      newRoomList[foundRoomIndex] = room;
    } else {
      newRoomList.push(room);
    }
    setRoomList(sortRoomList(newRoomList));
  }

  const onTyping = (event: MatrixEvent, member: RoomMember) => {
    console.log('onTyping');
  };

  return {
    roomList,
    inviteList,
    updateLists,
    startListeners,
    removeListeners
  };
}
