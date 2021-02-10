import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import Reactions from './Reactions';

export default function MessageWrapper({ room, event, isMe, children }) {


  return (
    <>
      <TouchableOpacity
        onPress={() => {}}
        style={{
          flexDirection: `row${isMe ? '-reverse' : ''}`,
          alignItems: 'center',
          marginVertical: 2,
        }}>
        {children}
      </TouchableOpacity>
        <Reactions room={room} event={event} />
    </>
  );
}
