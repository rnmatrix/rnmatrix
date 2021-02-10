import React, { useState, useRef } from 'react';
import {
  FlatList,
  FlatListProps,
  KeyboardAvoidingView,
  View,
  Platform,
  SafeAreaView,
  Text,
  TouchableOpacity,
} from 'react-native';
// import Composer from './Composer';
// import { colors } from '../constants';
import { useTimeline } from '../../index';
// import { Room } from 'matrix-js-sdk/src/models/room';
// import Icon from './components/Icon';
import MessageItem from './components/MessageItem';

type Props = {
  room: any;
  keyboardOffset?: number;
  showReactions?: boolean;
  enableComposer?: boolean;
  isEditing?: Boolean;
  isReplying?: Boolean;
  onEndEdit?: Function;
  enableReplies?: Boolean;
  onCancelReply?: Function;
  // selectedMessage?: Message,
  onPress?: Function | null;
  onLongPress?: Function | null;
  onSwipe?: Function | null;
  renderTypingIndicator?: Function | null;
  renderMessage?: Function | null;
  renderLoader?: Function | null;
  renderScrollToBottom?: Function | null;
  flatListProps?: FlatListProps;
};

export default function MessageList({
  room,
  flatListProps,
  keyboardOffset = 0,
  showReactions = true,
  enableComposer = false,
  isEditing = false,
  isReplying = false,
  onEndEdit = undefined,
  enableReplies = false,
  onCancelReply = undefined,
  onPress = undefined,
  onLongPress = undefined,
  onSwipe = undefined,
  renderTypingIndicator = undefined,
  renderMessage = undefined,
  renderLoader = undefined,
  renderScrollToBottom = undefined,
}: Props) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { timeline, usersTyping, fetchPreviousMessages } = useTimeline(room);

  const listRef = useRef();

  /**
   * If this is being called repeatedly at the top of a room, you need to check if
   * the room pagination token is "at start". Like so:
   *
   * const start = !this._matrixRoom.getLiveTimeline().getPaginationToken(EventTimeline.BACKWARDS);
   */
  const handleEndReached = async () => {
    console.log('handle end reached');
    if (!isLoading) {
      setIsLoading(true);
      await fetchPreviousMessages();
      setIsLoading(false);
    }
  };

  const renderMessageItem = ({ item, index }) => {
    return <MessageItem item={item} room={room} />
    // const content = item.getContent();
    // console.log({key: typeof item.getId()})
    // if (!content) return null;
    // return <Text style={{ height: 50 }}>{content?.body}</Text>;
    // return (
    //   <MessageItem
    //     roomId={room.id}
    //     messageId={messageId}
    //     prevMessageId={messageList[index + 1] ? messageList[index + 1] : null}
    //     nextMessageId={messageList[index - 1] ? messageList[index - 1] : null}
    //     onPress={onPress}
    //     onLongPress={onLongPress}
    //     onSwipe={onSwipe}
    //     renderTypingIndicator={renderTypingIndicator}
    //     showReactions={showReactions}
    //     styles={styles}
    //     myBubbleStyle={myBubbleStyle}
    //     otherBubbleStyle={otherBubbleStyle}
    //     accentColor={accentColor}
    //   />
    // );
  };

  const messageItem = (args) => (renderMessage ? renderMessage(args) : renderMessageItem(args));
  const typingIndicator = () => (renderTypingIndicator ? renderTypingIndicator(usersTyping) : null);
  const loader = () => (renderLoader ? renderLoader(isLoading) : null);

  return (
    <Wrapper offset={keyboardOffset}>
      <FlatList
        ref={listRef}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        inverted
        data={timeline}
        renderItem={messageItem}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.25}
        keyExtractor={(item) => item.getId()}
        ListHeaderComponent={typingIndicator}
        ListFooterComponent={loader}
        style={{ paddingTop: 6, paddingHorizontal: 12 }}
        {...flatListProps}
      />
      {/* {renderScrollToBottom ? (
        renderScrollToBottom()
      ) : (
        <View style={{ position: 'absolute', bottom: 50, right: 50 }}>
          <TouchableOpacity
            onPress={() => listRef.current.scrollToIndex({ index: 0 })}
            style={{ backgroundColor: 'red', borderRadius: 80, padding: 20 }}>
            <Text>V</Text>
          </TouchableOpacity>
        </View>
      )} */}

      {/* {enableComposer && (
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
      )} */}
    </Wrapper>
  );
}

const Wrapper = ({ offset, children }) => {
  const style = {
    flex: 1,
    position: 'relative',
  };
  return Platform.OS === 'ios' ? (
    <SafeAreaView style={style}>
      <KeyboardAvoidingView style={style} behavior="padding" keyboardVerticalOffset={offset}>
        {children}
      </KeyboardAvoidingView>
    </SafeAreaView>
  ) : (
    <View style={style}>{children}</View>
  );
};
