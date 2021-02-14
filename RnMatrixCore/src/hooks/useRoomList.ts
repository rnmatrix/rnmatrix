import { Room } from "matrix-js-sdk/src/models/room";
import { RoomMember } from "matrix-js-sdk/src/models/room-member";
import { useEffect, useState } from "react";
import matrix from "../services/matrix";
import MatrixEvent from "../types/MatrixEvent";

export default function useRoomList() {
  const [roomList, setRoomList] = useState([])

  useEffect(() => {
    const rooms = matrix.getClient().getVisibleRooms()
    setRoomList(sortRoomList(rooms))
  }, [])

  useEffect(() => {
    startListeners();
    return () => {
      removeListeners();
    };
  }, [roomList]);

  const startListeners = () => {
    removeListeners();
    matrix.getClient().on('Room', onRoom);
    matrix.getClient().on('Room.timeline', onRoomTimeline);
    matrix.getClient().on('RoomMember.typing', onTyping);
  };

  const removeListeners = () => {
    matrix.getClient().removeListener('Room', onRoom);
    matrix.getClient().removeListener('Room.timeline', onRoomTimeline);
    matrix.getClient().removeListener('RoomMember.typing', onTyping);
  };

  const sortRoomList = (list) => {
    return list.sort((b, a) => a.timeline[a.timeline.length - 1].getTs() - b.timeline[b.timeline.length - 1].getTs())
  }

  const onRoom = (room: Room) => {
    console.log('onRoom')
    const newRoomList = [...roomList]
    const foundRoomIndex = roomList.find(r => r.roomId === room.roomId)
    if (foundRoomIndex >= 0) {
      newRoomList[foundRoomIndex] = room
    } else {
      newRoomList.push(room)
    }
    setRoomList(sortRoomList(newRoomList))
  }
  const onRoomTimeline = (event: MatrixEvent, room: Room) => {
    console.log('onRoomTimeline')
    const newRoomList = [...roomList]
    const foundRoomIndex = roomList.findIndex(r => r.roomId === room.roomId)
    if (foundRoomIndex >= 0) {
      newRoomList[foundRoomIndex] = room
    } else {
      newRoomList.push(room)
    }
    setRoomList(sortRoomList(newRoomList))
  }
  
  const onTyping = (event: MatrixEvent, member: RoomMember) => {
    console.log('onTyping')
  }

  return {
    roomList
  }
}