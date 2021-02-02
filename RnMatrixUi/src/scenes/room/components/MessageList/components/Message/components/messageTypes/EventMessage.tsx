import { useObservableState } from 'observable-hooks';
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import ThemedStyles from '../../../../../../../../styles/ThemedStyles';
import Color from 'color';

export default function EventMessage({ message }) {
  const content = useObservableState<any>(message.content$);
  const theme = ThemedStyles.style;
  return (
    <Text
      style={[
        { color: Color(theme.colorTertiaryText.color).lighten(0.1).hex() },
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
