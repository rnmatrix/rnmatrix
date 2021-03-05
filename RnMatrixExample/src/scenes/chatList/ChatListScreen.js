import React from 'react';
import {SafeAreaView, Text} from 'react-native';
// import {RoomList} from '@rn-matrix/ui';
import { useIsFocused } from '@react-navigation/native';
import {RoomList} from '../../views/RoomList'

export default function ChatListScreen({navigation}) {

  const isFocused = useIsFocused()

  const onRowPress = (room) => {
    navigation.navigate('Chat', {roomId: room.roomId});
  };

  console.log('chat list', {isFocused})

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
      <RoomList onRowPress={onRowPress} isFocused={isFocused} />
    </SafeAreaView>
  );
}
