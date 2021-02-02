import { matrix } from '@rn-matrix/core';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Avatar from '../../../../../../../common/Avatar';
import ThemedStyles from '../../../../../../../styles/ThemedStyles';

export default function ReadReceipts({ receipts, isMe = false }) {
  const theme = ThemedStyles.style;
  const user = matrix.getMyUser();
  return (
    <View
      style={[
        styles.wrapper,
        theme.margin,
        { justifyContent: isMe ? 'flex-end' : 'flex-start' },
      ]}>
      {receipts
        .slice(0, 5)
        .filter((r) => r.userId !== user.id)
        .map((r) => (
          <Avatar
            name={r.name}
            avatarURI={r.avatar}
            size={20}
            style={theme.marginLeft}
          />
        ))}

      {receipts.length > 5 && (
        <Text style={isMeStyle(isMe)}>+{receipts.length - 5}</Text>
      )}
    </View>
  );
}

const isMeStyle = (isMe) => ({
  marginRight: isMe ? 4 : 0,
  marginLeft: isMe ? 0 : 4,
});

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    flexWrap: 'wrap',
  },
});
