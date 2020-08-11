import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { screens } from './App';
import { MessageList, matrix } from '..';

export default function ChatScreen({ goToScreen, currentRoom }) {
  const [selectedMessage, setSelectedMessage] = useState(null);

  const handleLongPress = message => {
    // console.log('message', message);
    // matrix.deleteMessage(message);
  };

  const handlePress = message => {
    setSelectedMessage(message);
  };

  const handleSwipe = message => {
    setSelectedMessage(message);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header goToScreen={goToScreen} />
      <MessageList
        room={currentRoom}
        enableComposer
        // enableReplies
        onCancelReply={() => setSelectedMessage(null)}
        selectedMessage={selectedMessage}
        onPress={handlePress}
        onLongPress={handleLongPress}
        // onSwipe={handleSwipe}
        keyboardOffset={50}
      />
    </SafeAreaView>
  );
}

const Header = ({ goToScreen }) => (
  <View
    style={{
      height: 50,
      backgroundColor: '#ddd',
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      zIndex: 1,
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
    }}>
    <TouchableOpacity onPress={() => goToScreen(screens.ROOM_LIST)} style={{ padding: 12 }}>
      <Text>{'<'} Go Back</Text>
    </TouchableOpacity>
    <Text style={{ fontWeight: 'bold', fontSize: 20 }}>Room Name</Text>
    <TouchableOpacity disabled style={{ padding: 12 }}>
      <Text style={{ opacity: 0 }}>{'<'} Back</Text>
    </TouchableOpacity>
  </View>
);
