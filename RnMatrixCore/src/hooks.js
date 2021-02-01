import React, { useState, useEffect } from 'react';
import { BehaviorSubject } from 'rxjs';
import {matrix} from '@rn-matrix/core'

export function useRoom(room) {

  const roomView = {
    timeline: new BehaviorSubject([])
  }

//   this.context.on("Room", this.onRoom);
//   this.context.on("Room.timeline", this.onRoomTimeline);
//   this.context.on("Room.name", this.onRoomName);
//   this.context.on("Room.accountData", this.onRoomAccountData);
//   this.context.on("RoomState.events", this.onRoomStateEvents);
//   this.context.on("RoomState.members", this.onRoomStateMember);
//   this.context.on("Room.myMembership", this.onMyMembership);
//   this.context.on("accountData", this.onAccountData);
//   this.context.on("crypto.keyBackupStatus", this.onKeyBackupStatus);
//   this.context.on("deviceVerificationChanged", this.onDeviceVerificationChanged);
//   this.context.on("userTrustStatusChanged", this.onUserVerificationChanged);
//   this.context.on("crossSigning.keysChanged", this.onCrossSigningKeysChanged);
//   this.context.on("Event.decrypted", this.onEventDecrypted);
//   this.context.on("event", this.onEvent);

  useEffect(() => {
    // startup listeners for this room 
    console.log('start listener')
    const client = matrix.getClient()

    client.on('Room', onRoom)
    client.on('Room.timeline', onRoomTimeline)
    client.on('Room.localEchoUpdated', onLocalEchoUpdated );

    return () => {
      console.log('remove listener for this room', {client})
      if (client) {
        client.removeListener('Room.timeline', onRoomTimeline)
      }
    }
  }, [])

  const onRoom = () => {
    console.log('on ROOM')
  }

  const onRoomTimeline = (event, matrixRoom) => {
    console.log('event', {event, room, matrixRoom})
    if (room.id !== matrixRoom.roomId) return;
    console.log('THIS ROOM')

    console.log({event})
  }

  const onLocalEchoUpdated = (event, room, oldEventId, oldStatus) => {
    console.log('on local echo')
  }

  return roomView
}