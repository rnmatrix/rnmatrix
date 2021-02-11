import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import Reactions from './Reactions';

export default function MessageWrapper({ room, event, isMe, onPress, onLongPress, children }) {
  return (
    <>
      <Reactions room={room} event={event} isMe={isMe} />

      <TouchableOpacity
        onPress={onPress}
        onLongPress={onLongPress}
        style={{
          flexDirection: `row${isMe ? '-reverse' : ''}`,
          alignItems: 'center',
          marginVertical: 2,
        }}>
        {children}
      </TouchableOpacity>
    </>
  );
}
