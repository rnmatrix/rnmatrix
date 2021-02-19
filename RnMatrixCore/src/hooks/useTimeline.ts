import { EventTimeline } from 'matrix-js-sdk/src/models/event-timeline';
import { RoomMember } from 'matrix-js-sdk/src/models/room-member';
import { useState, useEffect } from 'react';
import matrix from '../../index';
import { _getCurrentReadReceipt, _indexForEventId } from '../matrix-react/ReadReceipts';
import * as WhoIsTyping from '../matrix-react/WhoIsTyping';
import MatrixEvent from '../types/MatrixEvent';

export default function useTimeline(room) {
  const [timeline, setTimeline] = useState<EventTimeline>([]);
  const [updates, setUpdates] = useState<string[]>([])
  const [usersTyping, setUsersTyping] = useState<{ list: RoomMember[]; string: string }>({
    list: [],
    string: '',
  });
  const [atStart, setAtStart] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

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
    sendReadReceipt()
    initMessages();
  }, []);

  useEffect(() => {
    startListeners();
    return () => {
      removeListeners();
    };
  }, [timeline]);

  const initMessages = async () => {
    await fetchPreviousMessages();
    getMessages()
  };

  const getMessages = () => {
    const messageList = [];
    const roomEvents = room.getLiveTimeline().getEvents();
    for (const roomEvent of roomEvents) {
      messageList.unshift(roomEvent);
    }
    setTimeline(messageList);
  }

  console.log({timeline})

  const startListeners = () => {
    removeListeners();
    matrix.getClient().on('Room.timeline', onRoomTimeline);
    matrix.getClient().on('Room.localEchoUpdated', onLocalEchoUpdated);
    matrix.getClient().on('RoomMember.typing', onTyping);
  };

  const removeListeners = () => {
    matrix.getClient().removeListener('Room.timeline', onRoomTimeline);
    matrix.getClient().removeListener('Room.localEchoUpdated', onLocalEchoUpdated);
    matrix.getClient().removeListener('RoomMember.typing', onTyping);
  };

  const onRoomTimeline = (event: MatrixEvent, matrixRoom) => {
    // console.log('onRoomTimeline', { event, matrixRoom });
    if (room.id !== matrixRoom.roomId || isLoading) return;
    // console.log({ timeline });
    const newTimeline = [...timeline]
    const newUpdates = []

    // set updated date on reacted event, so it will update in timeline
    if (event.getType() === 'm.reaction' && !event.isRedacted()) {
      const relatesToId = event.getAssociatedId()
      newUpdates.push(relatesToId)
    }

    setUpdates(newUpdates)
    setTimeline([event, ...newTimeline]);
  };

  const onLocalEchoUpdated = (event, room, oldEventId, oldStatus) => {
    console.log('onLocalEcho', { event, oldEventId, oldStatus });
  };

  const onTyping = () => {
    const membersTyping = WhoIsTyping.usersTypingApartFromMeAndIgnored(room);
    setUsersTyping({
      list: membersTyping,
      string: WhoIsTyping.whoIsTypingString(membersTyping, 3),
    });
  };

  const fetchPreviousMessages = async () => {
    if (atStart) return;
    setIsLoading(true);
    const start = !room.getLiveTimeline().getPaginationToken(EventTimeline.BACKWARDS);
    if (start) {
      setAtStart(start);
      return;
    }
    try {
      await matrix
      .getClient()
      .paginateEventTimeline(room.getLiveTimeline(), { backwards: true });
    } catch (e) {
      console.log('Problem fetching previous messages...', {matrixClient: matrix.getClient()._clientOpts})
      console.warn(e)
    }
  
    setIsLoading(false);
    getMessages()
  };

  const sendReadReceipt = async () => {
    const tl = room.getLiveTimeline()
    const latestMessage = tl.getEvents()[tl.getEvents().length - 1];
    const readState = getReadState();
    if (readState === 'unread') {
      const matrixEvent = room.findEventById(latestMessage);
      await matrix.getClient().sendReadReceipt(matrixEvent);
    }
  }

  const getReadState = () => {
    const latestMessage = timeline.getEvents()[timeline.getEvents().length - 1];

    if (!room.hasUserReadEvent(matrix.getClient().getUserId(), latestMessage)) {
      return 'unread';
    }

    for (const member of room.getJoinedMembers()) {
      if (!room.hasUserReadEvent(member.userId, latestMessage)) {
        return 'readByMe';
      }
    }

    return 'readByAll';
  }

  

  return {
    timeline,
    updates,
    usersTyping,
    fetchPreviousMessages,
  };
}
