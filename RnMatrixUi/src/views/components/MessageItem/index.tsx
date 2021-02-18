import React from 'react';
import { Text } from 'react-native';
import EventMessage from './EventMessage';
import MessageWrapper from './MessageWrapper';
import TextMessage from './TextMessage';
import ImageMessage from './ImageMessage';
import rnm, {EventTypes, MatrixEvent} from '@rn-matrix/core'

type Props = {
  item: MatrixEvent;
  room: any;
  shouldUpdate: boolean;
  onPress: Function;
  onLongPress: Function;
};

export default function MessageItem({
  item: event,
  room,
  shouldUpdate,
  onPress,
  onLongPress,
}: Props) {
  const content = event.getContent();
  if (!content || event.isRedacted()) return null;

  const isMe = rnm.getClient().getUserId() === event.getSender();

  const renderMessageType = () => {
    const messageProps = { event, isMe };
    switch (event.getContent().msgtype) {
      case 'm.text':
        return <TextMessage {...messageProps} />;
      case 'm.image':
        return <ImageMessage {...messageProps} />;
      default:
        return <Text>msgtype {event.getContent().msgtype}</Text>;
    }
  };

  const roomMessageProps = {
    event,
    room,
    isMe,
    onPress,
    onLongPress,
  };

  switch (event.getType()) {
    case EventTypes.roomRoles:
    case EventTypes.roomHistoryVisibility:
    case EventTypes.roomPowerLevels:
    case EventTypes.roomMember:
    case EventTypes.roomName:
    case EventTypes.roomCreate:
    case EventTypes.roomJoinRules:
    case EventTypes.roomGuestAccess:
      return <EventMessage event={event} />;
    case EventTypes.roomMessage:
      return <MessageWrapper {...roomMessageProps}>{renderMessageType()}</MessageWrapper>;
    case EventTypes.reaction:
    case EventTypes.roomRedaction:
      return null;
    default:
      return <Text>{event.getType()}</Text>;
  }
}
