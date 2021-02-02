import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import ThemedStyles from '../../../styles/ThemedStyles';

const emojis = ['👍', '❤️', '🎉', '😂', '😢'];

export default function EmojiButtons({ message, setActionSheetVisible, setSelectedMessage }) {
  const theme = ThemedStyles.style;

  return (
    <View style={styles.container}>
      {emojis.map((e) => (
        <EmojiButton
          key={e}
          onPress={() => {
            message.toggleReaction(e);
            setActionSheetVisible(false);
            setSelectedMessage(null);
          }}>
          <Text style={theme.fontXXL}>{e}</Text>
        </EmojiButton>
      ))}
    </View>
  );
}

const EmojiButton: React.FC<any> = ({ children, onPress }) => {
  const theme = ThemedStyles.style;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        theme.backgroundSecondary,
        {
          borderRadius: 80,
          padding: 12,
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: 12,
          opacity: pressed ? 0.5 : 1,
        },
      ]}>
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
});
