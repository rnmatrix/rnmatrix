import React from 'react';

import Message from '../../classes/Message';
import messages from '../../services/message';
import EventMessage from './messageTypes/EventMessage';
import NoticeMessage from './messageTypes/NoticeMessage';
import { View, Text, ActivityIndicator } from 'react-native';
import ImageMessage from './messageTypes/ImageMessage';
import TextMessage from './messageTypes/TextMessage';
import { TypingAnimation } from 'react-native-typing-animation';

// const debug = require('debug')('ditto:scenes:chat:message:MessageItem')

function isSameSender(messageA, messageB) {
  if (
    !messageA ||
    !messageB ||
    !Message.isBubbleMessage(messageA) ||
    !Message.isBubbleMessage(messageB) ||
    messageA.sender.id !== messageB.sender.id
  ) {
    return false;
  }
  return true;
}

export default function MessageItem({
  roomId,
  messageId,
  prevMessageId,
  nextMessageId,
  ...otherProps
}) {
  if (messageId === 'loading') {
    return <ActivityIndicator />;
  }
  if (messageId === 'typing') {
    return (
      <View style={{ marginLeft: 24, marginTop: 10, marginBottom: 30 }}>
        <TypingAnimation dotColor="#ccc" dotAmplitude={2} dotRadius={4} dotMargin={8} />
      </View>
    );
  }

  const message = messages.getMessageById(messageId, roomId);
  const prevMessage =
    prevMessageId && prevMessageId !== 'loading'
      ? messages.getMessageById(prevMessageId, roomId)
      : null;
  const nextMessage =
    nextMessageId && nextMessageId !== 'typing'
      ? messages.getMessageById(nextMessageId, roomId)
      : null;
  const prevSame = isSameSender(message, prevMessage);
  const nextSame = isSameSender(message, nextMessage);
  const props = { ...otherProps, message, prevSame, nextSame };

  if (Message.isTextMessage(message.type)) {
    return <TextMessage {...props} />;
  }
  if (Message.isImageMessage(message.type)) {
    return <ImageMessage {...props} />;
  }
  if (Message.isNoticeMessage(message.type)) {
    return <NoticeMessage {...props} />;
  }
  return <EventMessage {...props} />;
}

export function BubbleWrapper({ children, isMe, status }) {
  return (
    <View
      style={{
        marginHorizontal: 13,
        flexDirection: isMe ? 'row-reverse' : 'row',
      }}>
      {children}
    </View>
  );
}

export function SenderText({ isMe, children }) {
  return (
    <Text
      style={{
        fontSize: 14,
        fontWeight: '400',
        marginHorizontal: 22,
        marginTop: 8,
        opacity: 0.6,
        ...(isMe ? { textAlign: 'right' } : {}),
      }}>
      {children}
    </Text>
  );
}
