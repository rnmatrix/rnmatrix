// @ts-ignore
import { EventStatus } from 'matrix-js-sdk';
import moment from 'moment';
import React, { useCallback, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ThemedStyles from '../../../../../../../styles/ThemedStyles';
import Icon from '../../../../../../../common/Icon';
import Color from 'color';

interface TimeAndStatusProps {
  isMe: boolean;
  status: EventStatus;
  timestamp: number;
  timeStyle: any;
}

export default function TimeAndStatus({
  isMe,
  status,
  timestamp,
  timeStyle,
}: TimeAndStatusProps) {
  const theme = ThemedStyles.style;
  const date = useMemo(() => moment(timestamp).format('HH:mm'), [timestamp]);

  return (
    <View style={[styles.timeContainer, isMe ? styles.meTime : null]}>
      <Text
        style={[
          theme.fontXS,
          ThemedStyles.getColor('black'),
          isMe ? styles.colorLightAlpha : styles.date,
          timeStyle,
        ]}>
        {date}
      </Text>
      {isMe && status === EventStatus.SENT && (
        <View style={styles.sendingContainer}>
          <Icon name={'check'} size={12} color="rgba(255, 255, 255, 0.5)" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sendingContainer: {
    top: 1,
  },
  timeContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: -4,
    right: -5,
  },
  date: {
    opacity: 0.3,
  },
  meTime: {
    right: -5,
  },
  colorLightAlpha: { color: 'rgba(255, 255, 255, 0.5)' },
  avatarWrapper: {
    position: 'absolute',
    left: 0,
    top: 4,
  },
});
