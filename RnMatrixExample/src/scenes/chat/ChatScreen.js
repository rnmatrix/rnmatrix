import React, {useState} from 'react';
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
import {MessageList} from '@rn-matrix/ui'

export default function ChatScreen({navigation, route}) {
  const {roomId} = route.params;
  if (!roomId) navigation.goBack();

  const room = rnm.getClient().getRoom(roomId)

  const [actionSheetVisible, setActionSheetVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);

  const handleLongMessagePress = (msg) => {
    setSelectedMessage(msg)
    setActionSheetVisible(true)
  }

  return (
    <>
      <MessageList room={room} onLongPress={handleLongMessagePress}  />
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

  // const headerHeight = useHeaderHeight();

  // const [actionSheetVisible, setActionSheetVisible] = useState(false);
  // const [selectedMessage, setSelectedMessage] = useState(null);
  // const [isEditing, setIsEditing] = useState(false);
  // const [isReplying, setIsReplying] = useState(false);

  // const onLongPress = (message) => {
  //   setSelectedMessage(message);
  //   setActionSheetVisible(true);
  // };

  // const onSwipe = (message) => {
  //   setSelectedMessage(message);
  //   setIsReplying(true);
  // };

  // const onEndEdit = () => {
  //   setIsEditing(null);
  //   setSelectedMessage(null);
  // };

  // const onCancelReply = () => {
  //   setIsReplying(null);
  //   setSelectedMessage(null);
  // };

  // const editMessage = () => {
  //   setActionSheetVisible(false);
  //   setIsEditing(true);
  // };

  // return (
  //   <>
  //     <View style={{flex: 1, backgroundColor: '#fff'}}>
  //       <MessageList
  //         room={room}
  //         keyboardOffset={headerHeight + StatusBar.currentHeight}
  //         enableComposer
  //         enableReplies
  //         showReactions
  //         selectedMessage={selectedMessage}
  //         isEditing={isEditing}
  //         isReplying={isReplying}
  //         onSwipe={onSwipe}
  //         onLongPress={onLongPress}
  //         onEndEdit={onEndEdit}
  //         onCancelReply={onCancelReply}
  //         // myBubbleStyle={(pressed) => ({
  //         //   backgroundColor: pressed ? 'darkred' : 'red',
  //         // })}
  //         // otherBubbleStyle={(pressed) => ({
  //         //   backgroundColor: 'yellow',
  //         // })}
  //         // accentColor="orange"
  //         // textColor="green"
  //       />
  //     </View>
  //     <ActionSheet
  //       visible={actionSheetVisible}
  //       gestureEnabled={false}
  //       innerScrollEnabled={false}
  //       style={{minHeight: 100, padding: 24, paddingBottom: 48}}
  //       onClose={() => setActionSheetVisible(false)}>
  //       <EmojiButtons
  //         message={selectedMessage}
  //         setActionSheetVisible={setActionSheetVisible}
  //         setSelectedMessage={setSelectedMessage}
  //       />
  //       <Pressable
  //         onPress={editMessage}
  //         style={({pressed}) => ({
  //           backgroundColor: pressed ? 'lightgray' : '#fff',
  //           padding: 12,
  //           borderRadius: 8,
  //         })}>
  //         <Text style={{color: 'dodgerblue', fontWeight: 'bold', fontSize: 16}}>
  //           Edit Message
  //         </Text>
  //       </Pressable>
  //     </ActionSheet>
  //   </>
  // );
}
