import React from 'react';
import { Text, View } from 'react-native';
import { textForEvent } from '@rn-matrix/core/src/matrix-react/TextForEvent';

export default function EventMessage({ event }) {
  const message = textForEvent(event)
  return event && message.length > 0 ? (
    <View
      style={{
        maxWidth: '75%',
        alignSelf: 'center',
        paddingVertical: 8,
        paddingHorizontal: 18,
        backgroundColor: '#888',
        borderRadius: 24,
        marginVertical: 10,
      }}>
      <Text style={{ textAlign: 'center', fontWeight: '600', color: '#fff' }}>
        {message}
      </Text>
    </View>
  ) : null;
}
