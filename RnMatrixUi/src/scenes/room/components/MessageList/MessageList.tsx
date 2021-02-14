import { Chat, matrix, Message as MessageClass } from '@rn-matrix/core';
import groupBy from 'lodash/groupBy';
import moment from 'moment';
import { useObservableState } from 'observable-hooks';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatListProps,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  SectionList,
  SectionListRenderItem,
  SectionListRenderItemInfo,
  View,
} from 'react-native';
import ThemedStyles from '../../../../styles/ThemedStyles';
import { isIos } from '../../../../utilities/misc';
import Composer from './components/Composer/Composer';
import Message from './components/Message/Message';
import Timestamp from './components/Timestamp';
import { colors } from './constants';

type Props = {
  room: Chat;
  keyboardOffset?: number;
  showReactions?: boolean;
  enableComposer?: boolean;
  isEditing?: boolean;
  isReplying?: boolean;
  onEndEdit?: () => void;
  enableReplies?: boolean;
  onCancelReply?: () => void;
  selectedMessage?: MessageClass;
  onPress?: Function | null;
  onLongPress?: Function | null;
  onSwipe?: Function | null;
  renderTypingIndicator?: Function | null;
  flatListProps?: FlatListProps<any>;
  composerStyle?: any;
  myBubbleStyle?: any;
  otherBubbleStyle?: any;
  myTextColor?: any;
  otherTextColor?: any;
  accentColor?: any;
  textColor?: any;
  customMessageRenderers?: (message: any, props: any) => JSX.Element[];
};

export default function MessageList({
  room,
  keyboardOffset = 0,
  showReactions = false,
  enableComposer = false,
  isEditing = false,
  isReplying = false,
  onEndEdit,
  enableReplies = false,
  onCancelReply = () => {},
  selectedMessage,
  onPress,
  onLongPress,
  onSwipe,
  renderTypingIndicator,
  flatListProps,
  composerStyle = {},
  myBubbleStyle = () => {},
  otherBubbleStyle = () => {},
  myTextColor = colors.white,
  otherTextColor = colors.gray400,
  accentColor = 'dodgerblue',
  textColor = colors.gray500,
  customMessageRenderers,
}: Props) {
  const theme = ThemedStyles.style;
  const [isLoading, setIsLoading] = useState(false);
  const messageList = useObservableState<any>(room.messages$);
  const typing = useObservableState<any>(room.typing$);
  const atStart = useObservableState<any>(room.atStart$);
  // const [timeline, setTimeline] = useState(messageList);

  const styles = {
    myTextColor,
    otherTextColor,
    accentColor,
    textColor,
  };

  const handleEndReached = useCallback(async () => {
    if (!atStart && !isLoading) {
      setIsLoading(true);
      await room.fetchPreviousMessages();
      setIsLoading(false);
    }
  }, []);

  const renderMessage: SectionListRenderItem<any> = useCallback(
    ({ item: messageId, index }: SectionListRenderItemInfo<any>) => (
      <Message
        roomId={room.id}
        messageId={messageId}
        prevMessageId={messageList[index + 1] ? messageList[index + 1] : null}
        nextMessageId={messageList[index - 1] ? messageList[index - 1] : null}
        onPress={onPress}
        onLongPress={onLongPress}
        onSwipe={onSwipe}
        renderTypingIndicator={renderTypingIndicator}
        showReactions={showReactions}
        styles={styles}
        myBubbleStyle={myBubbleStyle}
        otherBubbleStyle={otherBubbleStyle}
        accentColor={accentColor}
        customMessageRenderers={customMessageRenderers}
        showSender={room._matrixRoom.getInvitedAndJoinedMemberCount() > 1} // FIXME
      />
    ),
    [messageList, renderTypingIndicator, room, customMessageRenderers]
  );

  useEffect(() => {
    // mark as read
    room.sendReadReceipt();
    room.fetchPreviousMessages();
  }, [room]);

  const sections = useMemo(() => {
    const timelineGrouped = messageList
      ? groupBy(messageList, function (a) {
          return moment(matrix.getMessageById(a, room.id).timestamp).format('YYYY/MM/DD');
        })
      : {};

    const timeline = Object.keys(timelineGrouped).map((key, index) => ({
      title: key,
      data: timelineGrouped[key],
    }));

    /**
     *
     * */
    if (typing && typing.length > 0) {
      timeline[0]?.data.unshift('typing');
    }

    /**
     * Todo handle loading from both sides
     * */
    if (isLoading) {
      timeline[timeline.length - 1]?.data.push('loading');
    }

    return timeline;
  }, [messageList, room, typing, isLoading]);

  const [currentDate, setCurrentDate] = useState();

  const updateStickyDate = useCallback(({ viewableItems, changed }) => {
    if (viewableItems && viewableItems.length) {
      const lastItem = viewableItems.pop();
      if (lastItem && lastItem.section && lastItem.section.title === currentDate) {
        setCurrentDate(undefined);
      } else if (lastItem && lastItem.section) {
        setCurrentDate(lastItem.section.title);
      } else setCurrentDate(undefined);
    } else setCurrentDate(undefined);
  }, []);
  //
  // const renderStickyDate = useCallback(
  //   () =>
  //     currentDate ? (
  //       <View style={componentStyles.stickyDate}>
  //         <Timestamp date={currentDate} />
  //       </View>
  //     ) : null,
  //   [currentDate],
  // );

  // console.log('currentDate', currentDate);
  const renderSectionHeader = useCallback(
    ({ section }) =>
      sections[0] && sections[0].title === section.title ? null : (
        <Timestamp date={section.title} />
      ),
    [sections]
  );

  const keyExtractor = useCallback((item) => item, []);

  return (
    <Wrapper offset={keyboardOffset}>
      <SectionList
        keyboardDismissMode={isIos() ? 'interactive' : 'on-drag'}
        keyboardShouldPersistTaps="handled"
        inverted
        // stickySectionHeadersEnabled
        // invertStickyHeaders
        sections={sections}
        renderSectionHeader={renderSectionHeader}
        onViewableItemsChanged={updateStickyDate}
        onEndReached={handleEndReached}
        // @ts-ignore
        renderItem={renderMessage}
        onEndReachedThreshold={0.5}
        keyExtractor={keyExtractor}
        ListHeaderComponent={<View style={{ height: 12 }} />}
        style={useMemo(() => [theme.paddingHorizontal, theme.backgroundSecondary], [])}
      />

      {/*{currentDate && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
          <Timestamp date={currentDate} />
        </View>
      )}*/}

      {enableComposer && (
        <Composer
          room={room}
          isEditing={isEditing}
          isReplying={isReplying}
          selectedMessage={selectedMessage}
          onEndEdit={onEndEdit}
          onCancelReply={onCancelReply}
          enableReplies={enableReplies}
          composerStyle={composerStyle}
          accentColor={accentColor}
        />
      )}
    </Wrapper>
  );
}

const Wrapper: React.FC<any> = ({ offset, children }) => {
  const style = {
    flex: 1,
  };
  return (
    <SafeAreaView style={style}>
      <KeyboardAvoidingView
        style={style}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={offset}>
        {children}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// const componentStyles = StyleSheet.create({
//   typingContainer: { marginLeft: 12, marginTop: 10, marginBottom: 20 },
//   stickyDate: {
//     position: 'absolute',
//     top: 0,
//     right: 0,
//     left: 0,
//     height: 100,
//     backgroundColor: '#f9c2ff',
//     borderRadius: 10,
//     marginBottom: 10,
//   },
//   stickyDateText: {
//     color: '#000',
//     padding: 5,
//   },
// });
