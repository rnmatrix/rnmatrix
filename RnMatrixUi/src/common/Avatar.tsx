import Color from 'color';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity } from 'react-native';
import colors from '../styles/Colors';
import ThemedStyles from '../styles/ThemedStyles';
import { getNameColor } from '../utilities/get-name-color';

interface AvatarProps {
  size?: number;
  avatarURI?: any;
  style?: any;
  name?: any;
  wrapperStyle?: any;
  onPress?: () => void;
}

const Avatar = ({ size = 50, avatarURI, style, name, onPress }: AvatarProps) => {
  const theme = ThemedStyles.style;

  const shapeStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  const backgroundColor = getNameColor(name);
  const color = Color(backgroundColor);

  if (!avatarURI) {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        style={[
          shapeStyle,
          theme.centered,
          {
            backgroundColor,
          },
          style,
        ]}>
        {!!name && (
          <Text
            style={[
              styles.defaultAvatarLetter,
              {
                fontSize: size / 2,
                color: color.luminosity() > 0.7 ? colors.dark : colors.light,
              },
            ]}>
            {name?.charAt(0) === '@'
              ? name?.charAt(1)?.toUpperCase()
              : name?.charAt(0)?.toUpperCase()}
          </Text>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[style, { borderRadius: size / 2 }]}>
      <Image
        style={[shapeStyle, { backgroundColor }]}
        resizeMode={'cover'}
        source={{ uri: avatarURI }}
      />
    </TouchableOpacity>
  );
};

export default Avatar;

const styles = StyleSheet.create({
  defaultAvatarLetter: {
    fontWeight: 'bold',
  },
});
