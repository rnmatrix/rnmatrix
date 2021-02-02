import { matrix } from '@rn-matrix/core';
import { useObservableState } from 'observable-hooks';
import React, { useCallback } from 'react';
import { View } from 'react-native';
import Video from 'react-native-video';
import { BubbleWrapper } from '../BubbleWrapper';
import { SenderText } from '../SenderText';

export default function VideoMessage({
  message,
  prevSame,
  // nextSame,
  // onPress,
  // onLongPress,
  onSwipe,
  showReactions,
}) {
  const myUser = matrix.getMyUser();
  const content = useObservableState<any>(message.content$);
  // const senderName = useObservableState<any>(message.sender.name$);
  // const receipts = message.receipts$
  //   ? useObservableState<any>(message.receipts$)
  //   : [];
  const status = useObservableState<any>(message.status$);
  const isMe = myUser.id === message.sender.id;

  // const _onLongPress = useCallback(() => onLongPress(message), [
  //   message,
  //   onLongPress,
  // ]);
  // const _onPress = useCallback(() => onPress(message), [message, onPress]);
  const _onSwipe = useCallback(() => onSwipe(message), [message, onSwipe]);

  const { width, height } = content.thumb;
  if (!content) {
    return null;
  }

  return (
    <>
      <BubbleWrapper
        isMe={isMe}
        status={status}
        onSwipe={onSwipe ? _onSwipe : null}
        message={message}
        showReactions={showReactions}>
        <View style={{ borderRadius: 20, overflow: 'hidden' }}>
          <Video
            controls
            source={{ uri: content.url, type: content.type }}
            style={{
              width,
              height,
              backgroundColor: '#ddd',
            }}
            onError={(e) =>
              console.log(
                'Error rendering video\nContent: ',
                content,
                '\nError: ',
                e,
              )
            }
            fullscreen
            pictureInPicture
          />
        </View>
      </BubbleWrapper>

      {!prevSame && <SenderText isMe={isMe} sender={message.sender} />}
    </>
  );
}
