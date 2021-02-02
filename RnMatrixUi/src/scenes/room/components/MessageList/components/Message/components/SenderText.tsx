import { useObservableState } from 'observable-hooks';
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import ThemedStyles from '../../../../../../../styles/ThemedStyles';

export function SenderText({ isMe, sender }) {
  const theme = ThemedStyles.style;
  const name = useObservableState<any>(sender.name$);

  if (isMe) return null;

  return (
    <Text
      textBreakStrategy={'highQuality'}
      style={[
        styles.senderText,
        theme.colorLink,
        {
          ...(isMe ? { textAlign: 'right' } : {}),
        },
      ]}>
      {name}
    </Text>
  );
}

const styles = StyleSheet.create({
  senderText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
    maxWidth: '110%',
  },
});
