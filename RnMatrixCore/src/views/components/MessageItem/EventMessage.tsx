import React from 'react';
import { Text, View } from 'react-native';
import { textForEvent } from '../../../matrix-react/TextForEvent';

export default function EventMessage({ event }) {
  return event ? (
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
        {textForEvent(event)}
      </Text>
    </View>
  ) : null;
}
