import { matrix } from '@rn-matrix/core';
import { useObservableState } from 'observable-hooks';
import React, { useCallback, useMemo } from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import useNavigation from '../../../../../../../../hooks/useNavigation';
import { BubbleWrapper } from '../BubbleWrapper';

export default function ImageMessage(props: any) {
  const {
    message,
    prevSame,
    nextSame,
    onPress,
    onLongPress,
    onSwipe,
    showReactions,
    showSender,
  } = props;
  const myUser = matrix.getMyUser();
  const content = useObservableState<any>(message.content$);
  const reactions = useObservableState<any>(message.reactions$);
  // const receipts = message.receipts$ ? useObservableState<any>(message.receipts$) : [];
  const status = useObservableState<any>(message.status$);
  const isMe = myUser.id === message.sender.id;

  const imageWrapperStyles = useMemo(
    () => ({
      marginTop: 2,
      marginBottom: nextSame ? 1 : 4,
    }),
    [nextSame],
  );

  const sharpBorderRadius = 5;
  const imageStyles = useMemo(
    () =>
      content && {
        width: content.thumb.width,
        height: content.thumb.height,
        backgroundColor: '#ccc',
        borderRadius: 20,
        ...(isMe
          ? {
              ...(prevSame ? { borderTopRightRadius: sharpBorderRadius } : {}),
              ...(nextSame
                ? { borderBottomRightRadius: sharpBorderRadius }
                : {}),
            }
          : {
              ...(prevSame ? { borderTopLeftRadius: sharpBorderRadius } : {}),
              ...(nextSame
                ? { borderBottomLeftRadius: sharpBorderRadius }
                : {}),
            }),
      },
    [content, isMe, nextSame, prevSame],
  );

  const _onLongPress = useCallback(() => onLongPress(message), [
    message,
    onLongPress,
  ]);

  const navigation = useNavigation();

  const imageThumbSource = useMemo(
    () =>
      content && {
        uri: content.thumb.url,
      },
    [content],
  );
  const imageFullSource = useMemo(
    () =>
      content && {
        uri: content.full.url,
      },
    [content],
  );

  const _onPress = useCallback(() => {
    const content = message.content$.getValue();
    // onPress(message);
    navigation.navigate('ViewImage', {
      entity: {
        urn: message.id,
        custom_data: [
          {
            width: content.full.width,
            height: content.full.height,
          },
        ],
      },
      source: imageFullSource,
    });
  }, [message, onPress, navigation, imageFullSource]);
  const _onSwipe = useCallback(() => onSwipe(message), [message, onSwipe]);

  const reactionsWrapperStyle = useMemo(
    () => ({ alignSelf: isMe ? 'flex-end' : 'flex-start' } as any),
    [isMe],
  );

  if (!content || !message || message.redacted$.getValue()) {
    return null;
  }

  return (
    <>
      <BubbleWrapper
        {...props}
        isMe={isMe}
        onSwipe={onSwipe ? _onSwipe : undefined}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={_onPress}
          // onLongPress={onLongPress ? _onLongPress : undefined}
          // delayLongPress={200}
          style={reactions ? reactionsWrapperStyle : undefined}>
          <View style={imageWrapperStyles}>
            {/**
             * TODO: render SmartImage
             * */}
            <Image source={imageThumbSource} style={imageStyles} />
          </View>
        </TouchableOpacity>
      </BubbleWrapper>
    </>
  );
}
