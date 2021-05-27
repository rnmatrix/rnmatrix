import { matrix, Message } from '@rn-matrix/core';
import Color from 'color';
// @ts-ignore
import { EventStatus } from '@rn-matrix/core/src/types/event';
import { useObservableState } from 'observable-hooks';
import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableHighlight, View } from 'react-native';
import FileViewer from 'react-native-file-viewer';
import RNFS from 'react-native-fs';
import Spinner from '../../../../../../../../common/Spinner';
import ThemedStyles from '../../../../../../../../styles/ThemedStyles';
import Icon from '../../../../../../../../common/Icon';
import { colors } from '../../../../constants';
import { BubbleWrapper } from '../BubbleWrapper';
import Triangle from '../Triangle';

export default function FileMessage(props: any) {
  const {
    message,
    prevSame,
    nextSame,
    onPress,
    onLongPress,
    onSwipe,
    myBubbleStyle,
    otherBubbleStyle,
    showReactions,
    showSender,
  } = props;
  const theme = ThemedStyles.style;
  const myUser = matrix.getMyUser();
  const content = useObservableState<any>(message.content$);
  const status = useObservableState<any>(message.status$);
  const reactions = useObservableState<any>(message.reactions$);
  const isMe = myUser?.id === message.sender.id;
  const [openingFile, setOpeningFile] = useState(false);

  const touchableHighlightStyle = useMemo(
    () => ({ alignSelf: isMe ? 'flex-end' : 'flex-start' }),
    [isMe],
  );

  const openFileTextStyle = useMemo(
    () => ({ color: isMe ? colors.white : ThemedStyles.getColor('icon') }),
    [isMe],
  );

  const _onLongPress = useCallback(() => onLongPress(message), [
    onLongPress,
    message,
  ]);
  const _onPress = useCallback(() => onPress(message), [onPress, message]);
  const _onSwipe = useCallback(() => onSwipe(message), [onSwipe, message]);

  const openFile = useCallback(() => {
    if (!content) {
      return;
    }

    setOpeningFile(true);

    const name = Message.isVideoMessage(message.type$.getValue())
      ? content.raw.body
      : content.name;

    // IMPORTANT: A file extension is always required on iOS.
    // You might encounter issues if the file extension isn't included
    // or if the extension doesn't match the mime type of the file.
    const localFile = `${RNFS.DocumentDirectoryPath}/${name}`;

    const options = {
      fromUrl: content.url,
      toFile: localFile,
    };
    RNFS.downloadFile(options)
      .promise.then(() => {
        FileViewer.open(localFile, { showOpenWithDialog: true });
      })
      .then(() => {
        // success
        setOpeningFile(false);
      })
      .catch(() => {
        // error
        setOpeningFile(false);
      });
  }, [content, message.type$]);

  const getDefaultBackgroundColor = useCallback((me, pressed) => {
    return me
      ? pressed
        ? Color(ThemedStyles.getColor('link')).darken(0.1).hex()
        : ThemedStyles.getColor('link')
      : pressed
      ? Color(ThemedStyles.getColor('primary_background')).darken(0.1).hex()
      : ThemedStyles.getColor('primary_background');
  }, []);

  const downloadIconBackgroundColor = useCallback(
    (me, pressed) => {
      return me
        ? Color(
            myBubbleStyle(pressed)?.backgroundColor ||
              getDefaultBackgroundColor(me, pressed),
          )
            .darken(0.2)
            .hex()
        : Color(
            otherBubbleStyle(pressed)?.backgroundColor ||
              getDefaultBackgroundColor(me, pressed),
          )
            .darken(0.2)
            .hex();
    },
    [getDefaultBackgroundColor, myBubbleStyle, otherBubbleStyle],
  );

  const downloadIcon = useMemo(
    () => (
      <TouchableHighlight
        onPress={openFile}
        underlayColor={downloadIconBackgroundColor(isMe, true)}
        style={[
          styles.downloadIcon,
          { backgroundColor: downloadIconBackgroundColor(isMe, false) },
        ]}>
        {openingFile ? (
          <Spinner color="#fff" />
        ) : (
          <Icon
            name="file"
            color={isMe ? colors.white : ThemedStyles.getColor('icon')}
            size={32}
          />
        )}
      </TouchableHighlight>
    ),
    [downloadIconBackgroundColor, isMe, openFile, openingFile],
  );

  if (!content) {
    return null;
  }

  return (
    <>
      <BubbleWrapper
        {...props}
        isMe={isMe}
        onSwipe={onSwipe ? _onSwipe : undefined}>
        <View style={viewStyle(prevSame)}>
          <TouchableHighlight
            {...props}
            underlayColor={downloadIconBackgroundColor(isMe, false)}
            onPress={onPress ? _onPress : undefined}
            onLongPress={onLongPress ? _onLongPress : undefined}
            delayLongPress={200}
            style={[
              bubbleStyles(isMe, prevSame, nextSame),
              { backgroundColor: getDefaultBackgroundColor(isMe, false) },
              reactions ? touchableHighlightStyle : null,
              isMe ? myBubbleStyle() : otherBubbleStyle(),
            ]}>
            <View style={styles.flexEnd}>
              <View style={theme.rowJustifyStart}>
                {downloadIcon}
                <Text
                  onPress={openFile}
                  style={[styles.fileText, openFileTextStyle]}>
                  {content.name || content.raw.body || 'Uploading...'}
                </Text>
              </View>
              {isMe && status === EventStatus.SENDING && (
                <View style={styles.sendingContainer}>
                  <Icon
                    name={'check'}
                    size={16}
                    color="rgba(255, 255, 255, 0.5)"
                  />
                </View>
              )}
            </View>
          </TouchableHighlight>
        </View>
      </BubbleWrapper>
    </>
  );
}

const sharpBorderRadius = 5;
const bubbleStyles = (isMe, prevSame, nextSame) => ({
  paddingHorizontal: 14,
  paddingVertical: 8,
  borderRadius: 18,
  ...(isMe
    ? {
        ...(prevSame ? { borderTopRightRadius: sharpBorderRadius } : {}),
        ...(nextSame ? { borderBottomRightRadius: sharpBorderRadius } : {}),
      }
    : {
        ...(prevSame ? { borderTopLeftRadius: sharpBorderRadius } : {}),
        ...(nextSame ? { borderBottomLeftRadius: sharpBorderRadius } : {}),
      }),
});

const viewStyle = (prevSame) => ({
  marginTop: prevSame ? 2 : 4,
  // marginTop: nextSame ? 1 : 4,
  maxWidth: '100%',
});

const styles = StyleSheet.create({
  sendingContainer: { marginLeft: 12, marginRight: -6 },
  flexEnd: { alignItems: 'flex-end' },
  downloadIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    borderRadius: 60,
    width: 60,
    height: 60,
  },
  fileText: {
    alignSelf: 'center',
    textDecorationLine: 'underline',
    marginLeft: 12,
    maxWidth: 200,
    fontSize: 18,
    flexDirection: 'column',
  },
});
