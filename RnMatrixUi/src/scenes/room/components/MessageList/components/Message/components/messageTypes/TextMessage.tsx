import { matrix } from '@rn-matrix/core';
import Color from 'color';
// @ts-ignore
import { useObservableState } from 'observable-hooks';
import React, { useCallback, useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ThemedStyles from '../../../../../../../../styles/ThemedStyles';
import { isEmoji } from '../../../../../../../../utilities/emojis';
import { isIos } from '../../../../../../../../utilities/misc';
import { BubbleWrapper } from '../BubbleWrapper';
import Html from '../Html';
import { SenderText } from '../SenderText';
import TimeAndStatus from '../TimeAndStatus';
import Triangle from '../Triangle';


export default function TextMessage({
  message,
  prevSame,
  nextSame,
  onPress,
  onLongPress,
  myUser,
  onSwipe,
  showReactions,
  myBubbleStyle,
  otherBubbleStyle,
  accentColor,
  showSender,
  withoutBubbleWrapper,
  wrapperStyle,
  style,
  hideContent,
  timeStyle,
}) {
  const content = useObservableState<any>(message.content$);
  const status = useObservableState<any>(message.status$);
  const isMe = myUser?.id === message.sender.id;

  //----------------------------------------
  // Methods
  //----------------------------------------
  const _onSwipe = useCallback(() => onSwipe(message), []);

  const _onLongPress = useCallback(() => onLongPress(message), []);
  const _onPress = useCallback(() => onPress(message), []);
  const reactions = useObservableState<any>(message.reactions$);
  const props = { prevSame, nextSame };

  const touchableHighlightStyle = useMemo(
    () => ({ alignSelf: isMe ? 'flex-end' : 'flex-start' }),
    [isMe],
  );

  const getDefaultBackgroundColor = (me, pressed) => {
    return me
      ? pressed
        ? Color(ThemedStyles.getColor('link')).darken(0.1).hex()
        : ThemedStyles.getColor('link')
      : pressed
      ? Color(ThemedStyles.getColor('primary_background')).darken(0.1).hex()
      : ThemedStyles.getColor('primary_background');
  };

  if (!content?.html) {
    return null;
  }

  const textMessageContent = (
    <View style={[viewStyle(prevSame), styles.rowFlexEnd, wrapperStyle]}>
      {isEmoji(content?.text) ? (
        <Emoji
          style={[!isIos() ? styles.notoColorEmoji : {}, style]}
          {...props}>
          {content.text}
        </Emoji>
      ) : (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={onPress && _onPress}
          onLongPress={onLongPress && _onLongPress}
          delayLongPress={150}
          style={[
            bubbleStyles(isMe, prevSame, nextSame),
            { backgroundColor: getDefaultBackgroundColor(isMe, false) },
            reactions ? touchableHighlightStyle : null,
            isMe ? myBubbleStyle() : otherBubbleStyle(),
            style,
          ]}
          {...props}>
          <View
            style={[
              styles.htmlWrapper,
              isMe ? { justifyContent: 'flex-end' } : null,
            ]}>
            {!prevSame && !isMe && showSender && (
              <SenderText isMe={isMe} sender={message.sender} />
            )}

            {hideContent ? null : (
              <Html
                html={content?.html}
                isMe={isMe}
                accentColor={accentColor}
              />
            )}

            <TimeAndStatus
              timestamp={message.timestamp}
              status={status}
              isMe={isMe}
              timeStyle={timeStyle}
            />
          </View>
        </TouchableOpacity>
      )}
    </View>
  );

  if (withoutBubbleWrapper) {
    return textMessageContent;
  }

  return (
    <BubbleWrapper
      isMe={isMe}
      status={status}
      onSwipe={onSwipe ? _onSwipe : null}
      message={message}
      showSender={showSender}
      nextSame={nextSame}
      prevSame={prevSame}
      showReactions={showReactions}>
      {textMessageContent}
      {!nextSame && !isEmoji(content?.text) && <Triangle isMe={isMe} />}
    </BubbleWrapper>
  );
}

const Emoji = ({ style, children }) => (
  <Text style={[styles.emojiText, style]}>{children}</Text>
);

const sharpBorderRadius = 0;
const bubbleStyles = (isMe, prevSame, nextSame) => ({
  // paddingRight: isMe ? 0 : 16,
  paddingRight: 12,
  paddingLeft: 12,
  paddingVertical: 8,
  borderRadius: 10,
  minWidth: 65,
  ...(isMe
    ? {
        ...(prevSame ? { borderTopRightRadius: sharpBorderRadius } : null),
        ...{ borderBottomRightRadius: sharpBorderRadius },
      }
    : {
        ...(prevSame ? { borderTopLeftRadius: sharpBorderRadius } : null),
        ...{ borderBottomLeftRadius: sharpBorderRadius },
      }),
});

const viewStyle = (prevSame) => ({
  marginTop: prevSame ? 2 : 4,
  // marginBottom: nextSame ? 1 : 4,
  maxWidth: '85%',
});

const styles = StyleSheet.create({
  rowFlexEnd: { flexDirection: 'row', alignItems: 'flex-end' },
  notoColorEmoji: { fontFamily: 'NotoColorEmoji' },
  emojiText: {
    fontSize: 45,
    // marginHorizontal: 8,
    marginBottom: -4,
    marginTop: isIos() ? 4 : -6,
  },
  htmlWrapper: {
    flexWrap: 'wrap',
    paddingBottom: 10,
  },
});
