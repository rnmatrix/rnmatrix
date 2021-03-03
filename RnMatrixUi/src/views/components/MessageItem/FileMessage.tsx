import React from 'react';
import { Text, TouchableOpacity, Linking } from 'react-native';
import rnm from '@rn-matrix/core'

export default function FileMessage({ event, isMe }) {
  const message = 'File';

  const openFile = () => {
    const link = rnm.getHttpUrl(event.getContent().url)
    Linking.canOpenURL(link).then(() => {
      Linking.openURL(link);
    });
  }

  return event && message.length > 0 ? (
    <TouchableOpacity
    onPress={openFile}
      style={{
        paddingVertical: 12,
        paddingHorizontal: 22,
        borderRadius: 24,
        backgroundColor: '#ddd',
      }}>
      <Text style={{ fontWeight: '600', color: 'dodgerblue' }}>
        Open {`"${event.getContent()?.body}"` || 'file'}
      </Text>
    </TouchableOpacity>
  ) : null;
}
