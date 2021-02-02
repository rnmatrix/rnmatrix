import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ThemedStyles from '../../../../../styles/ThemedStyles';

interface TimestampProps {
  date: any;
}

export default function Timestamp({ date }: TimestampProps) {
  if (!date) return null;

  const theme = ThemedStyles.style;

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.dateContainer,
          theme.backgroundPrimary,
          theme.borderPrimary,
          theme.borderHair,
        ]}>
        <Text style={[styles.dateText, theme.colorPrimaryText]}>{date}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  dateContainer: {
    borderRadius: 100,
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  dateText: {},
});
