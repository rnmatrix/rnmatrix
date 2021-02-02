import { useDimensions } from '@react-native-community/hooks';
import { matrix } from '@rn-matrix/core';
import chatService from '@rn-matrix/core/src/services/chat';
import { useObservableState } from 'observable-hooks';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Navbar from '../../common/Navbar';
import ThemedStyles from '../../styles/ThemedStyles';
import { useHeaderHeight } from '../../hooks/useHeaderHeight';
import RoomAvatar from '../roomInfo/components/RoomAvatar';
import { useRoomMemberCount } from '../roomInfo/components/RoomMembersButton';
import ActionSheet from './components/ActionSheet';
import EmojiButtons from './components/EmojiButtons';
import MessageList from './components/MessageList/MessageList';
import RoomContext from './RoomContext';

export default function RoomScreen({ route, navigation }) {
  const [room, setRoom] = useState(
    route.params.room || chatService.getChatById(route.params.roomId),
  );

  const headerHeight = useHeaderHeight();
  const theme = ThemedStyles.style;
  const [actionSheetVisible, setActionSheetVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const name = useObservableState<string>(room.name$);
  const membersCount = useRoomMemberCount(room);
  const { width } = useDimensions().window;

  useEffect(() => {
    setRoom(route.params.room || chatService.getChatById(route.params.roomId));
  }, [route.params.roomId, route.params.room]);

  const onLongPress = useCallback((message) => {
    setSelectedMessage(message);
    setActionSheetVisible(true);
  }, []);

  const onSwipe = useCallback((message) => {
    setSelectedMessage(message);
    setIsReplying(true);
  }, []);

  const onEndEdit = useCallback(() => {
    setIsEditing(false);
    setSelectedMessage(null);
  }, []);

  const onCancelReply = useCallback(() => {
    setIsReplying(false);
    setSelectedMessage(null);
  }, []);

  const editMessage = useCallback(() => {
    setActionSheetVisible(false);
    setIsEditing(true);
  }, []);

  const onRoomInfoPress = useCallback(
    () => navigation.navigate('MessengerRoomInfoScreen', { room }),
    [navigation, room],
  );

  return (
    <RoomContext.Provider value={{ room: room._matrixRoom }}>
      <Navbar
        style={{
          paddingBottom: 15,
          paddingTop: 15,
        }}
        titleElement={
          <View
            style={[
              theme.rowJustifyStart,
              theme.flexContainer,
              theme.alignCenter,
            ]}>
            <RoomAvatar
              size={40}
              room={room}
              style={membersCount > 2 ? { top: -4 } : null}
            />
            <Text
              numberOfLines={1}
              textBreakStrategy={'highQuality'}
              style={[theme.fontXXL, theme.bold, { width: width * 0.65 }]}>
              {name}
            </Text>
          </View>
        }
        rightIcon={
          <Pressable hitSlop={50} onPress={onRoomInfoPress}>
            <Icon
              name="ellipsis-vertical"
              size={25}
              color={ThemedStyles.getColor('secondary_text')}
            />
          </Pressable>
        }
      />

      <View style={[theme.flexContainer, theme.backgroundSecondary]}>
        <MessageList
          room={room}
          keyboardOffset={headerHeight + StatusBar.currentHeight!}
          enableComposer
          enableReplies
          showReactions
          selectedMessage={selectedMessage}
          isEditing={isEditing}
          isReplying={isReplying}
          onSwipe={onSwipe}
          onLongPress={onLongPress}
          onEndEdit={onEndEdit}
          onCancelReply={onCancelReply}
        />
      </View>
      {/**
       * TODO: move this out of here
       * */}
      <ActionSheet
        visible={actionSheetVisible}
        gestureEnabled={false}
        innerScrollEnabled={false}
        // TODO: performance
        onClose={() => setActionSheetVisible(false)}>
        {Boolean(selectedMessage) && (
          <>
            <EmojiButtons
              message={selectedMessage}
              setActionSheetVisible={setActionSheetVisible}
              setSelectedMessage={setSelectedMessage}
            />
            {/**
             * TODO: no logic in render
             * */}
            {selectedMessage!.sender?.id === matrix.getMyUser().id && (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={editMessage}
                style={[styles.editMessageWrapper, theme.backgroundSecondary]}>
                {/**
                 * TODO: translate
                 * */}
                <Text style={styles.editMessage}>Edit Message</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </ActionSheet>
    </RoomContext.Provider>
  );
}

const styles = StyleSheet.create({
  editMessage: { color: 'dodgerblue', fontWeight: 'bold', fontSize: 16 },
  editMessageWrapper: {
    padding: 12,
    borderRadius: 8,
  },
});
