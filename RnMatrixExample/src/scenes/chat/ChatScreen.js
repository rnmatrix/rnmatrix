import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Pressable,
  StatusBar,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import ActionSheet from '../../components/ActionSheet';
import {useHeaderHeight} from '@react-navigation/stack';
import EmojiButtons from './components/EmojiButtons';

import rnm from '@rn-matrix/core';
import {MessageList} from '@rn-matrix/ui';

export default function ChatScreen({navigation, route}) {
  const {roomId} = route.params;
  if (!roomId) navigation.goBack();

  const room = rnm.getClient().getRoom(roomId);

  const [actionSheetVisible, setActionSheetVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);

  const handleLongMessagePress = (msg) => {
    setSelectedMessage(msg);
    setActionSheetVisible(true);
  };

  const renderTypingIndicator = (typing) => {
    return typing.list.length !== 0 ? (
      <Text style={{marginLeft: 60, fontStyle: 'italic'}}>{typing.string}</Text>
    ) : null;
  };

  useEffect(() => {
    rnm.markAsRead(room)
  }, [])

  return (
    <>
      <MessageList
        room={room}
        onLongPress={handleLongMessagePress}
        renderTypingIndicator={renderTypingIndicator}
      />
      <ActionSheet
        visible={actionSheetVisible}
        gestureEnabled={false}
        innerScrollEnabled={false}
        style={{minHeight: 100, padding: 24, paddingBottom: 48}}
        onClose={() => setActionSheetVisible(false)}>
        <EmojiButtons
          message={selectedMessage}
          setActionSheetVisible={setActionSheetVisible}
          setSelectedMessage={setSelectedMessage}
        />
        <Pressable
          // onPress={editMessage}
          style={({pressed}) => ({
            backgroundColor: pressed ? 'lightgray' : '#fff',
            padding: 12,
            borderRadius: 8,
          })}>
          <Text style={{color: 'dodgerblue', fontWeight: 'bold', fontSize: 16}}>
            Edit Message
          </Text>
        </Pressable>
      </ActionSheet>
    </>
  );
}
