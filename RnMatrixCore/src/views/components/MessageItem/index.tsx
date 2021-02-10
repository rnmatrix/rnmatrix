import React from 'react';
import { Text } from 'react-native';
import EventTypes from '../../../types/EventTypes';
import MatrixEvent from '../../../types/MatrixEvent';
import EventMessage from './EventMessage';
import MessageWrapper from './MessageWrapper';
import TextMessage from './TextMessage';
import { matrix } from '../../../../index';
import ImageMessage from './ImageMessage';

type Props = {
  item: MatrixEvent;
};

export default function MessageItem({ item: event, room }: Props) {
  const content = event.getContent();
  if (!content || event.isRedacted()) return null;

  const isMe = matrix.getClient().getUserId() === event.getSender();

  const renderMessageType = () => {
    const messageProps = { event, isMe };
    switch (event.getContent().msgtype) {
      case 'm.text':
        return <TextMessage {...messageProps} />;
      case 'm.file':
        return <ImageMessage {...messageProps} />;
      default:
        return <Text>msgtype {event.getContent().msgtype}</Text>;
    }
  };

  const roomMessageProps = {
    event,
    room,
    isMe,
  };

  switch (event.getType()) {
    case EventTypes.roomRoles:
    case EventTypes.roomHistoryVisibility:
    case EventTypes.roomPowerLevels:
    case EventTypes.roomMember:
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
