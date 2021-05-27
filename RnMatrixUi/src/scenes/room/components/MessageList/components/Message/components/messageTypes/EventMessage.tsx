import { useObservableState } from 'observable-hooks';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ThemedStyles from '../../../../../../../../styles/ThemedStyles';

export default function EventMessage({ message }) {
  const content = useObservableState<any>(message.content$);
  const theme = ThemedStyles.style;
  const colorStyle = useMemo(() => ({
    color: theme.colorTertiaryText.color
  }), [theme.colorTertiaryText.color])

  return (
    <Text
      style={[
        colorStyle,
        theme.marginVertical,
        styles.text,
      ]}>
      {content?.text}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 12,
    alignSelf: 'center',
    marginHorizontal: 24,
    textAlign: 'center',
  },
});
