/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */
import React, {useEffect, useState} from 'react';
import {SafeAreaView, Text} from 'react-native';
import {matrix} from 'rn-matrix';
// import ChatScreen from './ChatScreen';
// import RoomListScreen from './RoomListScreen';

// const debug = require('debug');
// debug.enable('rnm:*');

export const screens = {
  TOKEN: 0,
  ROOM_LIST: 1,
  CHAT: 2,
};

export default function App() {
  return (
    <SafeAreaView>
      <Text>helloooo world</Text>
    </SafeAreaView>
  );
}

// export default function App() {
//   const [currentScreen, setCurrentScreen] = useState(screens.ROOM_LIST);
//   const [currentRoom, setCurrentRoom] = useState(null);

//   // const renderScreen = () => {
//   //   switch (currentScreen) {
//   //     case screens.ROOM_LIST:
//   //       return (
//   //         <RoomListScreen
//   //           goToScreen={setCurrentScreen}
//   //           setCurrentRoom={setCurrentRoom}
//   //         />
//   //       );
//   //     case screens.CHAT:
//   //       return (
//   //         <ChatScreen goToScreen={setCurrentScreen} currentRoom={currentRoom} />
//   //       );
//   //     default:
//   //       null;
//   //   }
//   // };

//   useEffect(() => {
//     // matrix.createClient(
//     //   'https://matrix.ditto.chat',
//     //   accessToken,
//     //   '@test:ditto.chat',
//     // );
//     // matrix.start();
//   }, []);

//   // return (
//   //   <SafeAreaView>
//   //     <Text>hey world</Text>
//   //   </SafeAreaView>
//   // );

//   // return <SafeAreaView style={{flex: 1}}>{renderScreen()}</SafeAreaView>;
// }

// const accessToken =
//   'MDAxOGxvY2F0aW9uIGRpdHRvLmNoYXQKMDAxM2lkZW50aWZpZXIga2V5CjAwMTBjaWQgZ2VuID0gMQowMDIzY2lkIHVzZXJfaWQgPSBAdGVzdDpkaXR0by5jaGF0CjAwMTZjaWQgdHlwZSA9IGFjY2VzcwowMDIxY2lkIG5vbmNlID0gSEl0aSpubj1NbkJaX0BSVQowMDJmc2lnbmF0dXJlIBLMQ-pOXq0WPOtTk8wTyFPqOvwK0Sub2iue4ZLS1jiRCg';