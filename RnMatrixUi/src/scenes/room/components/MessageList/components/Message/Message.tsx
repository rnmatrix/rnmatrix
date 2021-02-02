import { matrix, Message as MessageClass } from '@rn-matrix/core';
import { useObservableState } from 'observable-hooks';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { TypingAnimation } from 'react-native-typing-animation';
import Spinner from '../../../../../../common/Spinner';
import EventMessage from './components/messageTypes/EventMessage';
import FileMessage from './components/messageTypes/FileMessage';
import ImageMessage from './components/messageTypes/ImageMessage';
// import MindsActivityMessage from './components/messageTypes/MindsActivityMessage';
import NoticeMessage from './components/messageTypes/NoticeMessage';
import TextMessage from './components/messageTypes/TextMessage';
// import urlRegex from 'url-regex';

// const lastItem = (thePath) => thePath.substring(thePath.lastIndexOf('/') + 1);

function isSameSender(messageA, messageB) {
  if (!messageA || !messageB) return false;

  if (!MessageClass.isBubbleMessage(messageA) || !MessageClass.isBubbleMessage(messageB))
    return false;

  return messageA.sender.id === messageB.sender.id;
}

export default function Message({
  roomId,
  messageId,
  prevMessageId,
  nextMessageId,
  showSender,
  customMessageRenderers,
  ...otherProps
}) {
  if (messageId === 'loading') {
    return (
      <View style={styles.loadingContainer}>
        <Spinner size={'large'} />
      </View>
    );
  }

  if (messageId === 'typing') {
    if (otherProps.renderTypingIndicator) {
      return otherProps.renderTypingIndicator();
    }
    return (
      <View style={styles.typingContainer}>
        <TypingAnimation dotColor="#ccc" dotAmplitude={2} dotRadius={4} dotMargin={8} />
      </View>
    );
  }

  const message = matrix.getMessageById(messageId, roomId);

  const messageType = useObservableState<any>(message.type$);
  if (!message.type$) {
    return null;
  }

  const prevMessage =
    prevMessageId && prevMessageId !== 'loading'
      ? matrix.getMessageById(prevMessageId, roomId)
      : null;
  const nextMessage =
    nextMessageId && nextMessageId !== 'typing'
      ? matrix.getMessageById(nextMessageId, roomId)
      : null;
  const prevSame = isSameSender(message, prevMessage);
  const nextSame = isSameSender(message, nextMessage);
  const props = { ...otherProps, message, prevSame, nextSame, showSender };

  if (message.redacted$.getValue()) {
    return <EventMessage {...props} />;
  }

  if (customMessageRenderers) {
    customMessageRenderers.forEach((customMessageRenderer) => {
      if (customMessageRenderer.checkCondition(message)) {
        return customMessageRenderer.render(message);
      }
    });
  }

  if (MessageClass.isTextMessage(messageType)) {
    // // TODO: This is messy, please make it Ronaldo
    // const messageText = message.content$.getValue()?.text;
    // // if it was a quote do not embed activity
    // if (messageText[0] === '>') {
    //   return <TextMessage {...props} />;
    // }
    //
    // const messageUrls = messageText.match(urlRegex());
    // const mindsUrl = messageUrls?.find((url) => url.includes('https://www.minds.com/newsfeed/'));
    // if (mindsUrl) {
    //   return <MindsActivityMessage {...props} mindsUrl={mindsUrl} guid={lastItem(mindsUrl)} />;
    // }

    // @ts-ignore
    return <TextMessage {...props} />;
  }

  if (MessageClass.isImageMessage(messageType)) {
    return <ImageMessage {...props} />;
  }
  // if (MessageClass.isVideoMessage(messageType)) {
  //   return <VideoMessage {...props} />;
  // }
  if (MessageClass.isVideoMessage(messageType) || MessageClass.isFileMessage(messageType)) {
    return <FileMessage {...props} />;
  }
  if (MessageClass.isNoticeMessage(messageType)) {
    return <NoticeMessage {...props} />;
  }

  return <EventMessage {...props} />;
}

const styles = StyleSheet.create({
  typingContainer: { marginLeft: 24, marginTop: 10, marginBottom: 30 },
  loadingContainer: { padding: 8 },
});
