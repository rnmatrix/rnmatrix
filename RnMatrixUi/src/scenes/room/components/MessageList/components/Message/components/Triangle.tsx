import React from 'react';
import { View } from 'react-native';
import ThemedStyles from '../../../../../../../styles/ThemedStyles';

type TriangleProps = {
  color?: string;
  isMe?: boolean;
}

const Triangle = ({ isMe, color }: TriangleProps) => {
  const theme = ThemedStyles.style;

  const meStyle = {
    left: -8,
  };
  const nonMeStyle = {
    right: -8,
  };

  return (
    <View
      style={{
        width: 5,
        height: 10,
        position: 'absolute',
        bottom: 0,
        backgroundColor: color
          ? color
          : isMe
          ? theme.backgroundLink.backgroundColor
          : theme.backgroundPrimary.backgroundColor,
        // borderBottomEndRadius: 2,
        transform: [
          {
            scaleX: isMe ? -1 : 1,
          },
        ],
        left: -5,
      }}>
      <View
        style={{
          width: 5,
          height: 9,
          position: 'absolute',
          left: 0,
          top: 0,
          backgroundColor: theme.backgroundSecondary.backgroundColor,
          borderBottomEndRadius: 15,
        }}
      />
    </View>
  );
};

export default Triangle;
