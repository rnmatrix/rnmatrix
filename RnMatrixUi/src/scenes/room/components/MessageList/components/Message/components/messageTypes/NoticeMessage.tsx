import { useObservableState } from 'observable-hooks';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Html from '../Html';

export default function NoticeMessage({ message }) {
  const content = useObservableState<any>(message.content$);
  const senderName = useObservableState<any>(message.sender.name$);

  return (
    <View style={styles.wrapper}>
      <Text>{senderName}</Text>
      <View style={styles.bubble}>
        <Html html={content?.html} {...htmlProps} />
      </View>
    </View>
  );
}

const baseFontStyle = {
  color: '#222',
  fontSize: 13,
  letterSpacing: 0.3,
  fontWeight: '400',
  textAlign: 'center',
};

const tagsStyles = {
  blockquote: {
    borderLeftColor: 'crimson',
    borderLeftWidth: 3,
    paddingLeft: 10,
    marginVertical: 10,
    opacity: 0.8,
  },
};

const htmlProps = {
  baseFontStyle,
  tagsStyles,
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  bubble: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
    marginTop: 4,
    maxWidth: 300,
    backgroundColor: '#ddd',
  },
});
