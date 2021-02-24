import Color from 'color';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, TouchableOpacityProps, View } from 'react-native';
import colors from '../styles/Colors';
import ThemedStyles from '../styles/ThemedStyles';

interface OurButtonProps extends TouchableOpacityProps {
  //
}

export default function Button(props) {
  const { label, children, style, disabled, type, icon, raised, ...otherProps } = props;

  const textStyle = useMemo(() => {
    if (disabled) {
      return ThemedStyles.style.colorTertiaryText;
    }

    if (type) {
      switch (type) {
        case 'success':
          return { color: ThemedStyles.getColor('green') };
        case 'danger':
          return { color: colors.danger };
        default:
          return { color: ThemedStyles.getColor('link') };
      }
    }

    return { color: colors.primary };
  }, [disabled, type, ThemedStyles]);

  const containerStyle = useMemo(() => {
    const commonStyles = [
      ThemedStyles.style.paddingVertical,
      ThemedStyles.style.rowJustifyStart,
      {
        borderRadius: 10,
      },
      style,
    ];

    if (!raised) return commonStyles;

    const raisedStyle = {
      paddingHorizontal: 16,
      paddingVertical: 16,
    };

    switch (type) {
      case 'success':
        return [
          ...commonStyles,
          ThemedStyles.style.justifyCenter,
          {
            ...raisedStyle,
            backgroundColor: Color(ThemedStyles.style.backgroundSuccess.backgroundColor)
              .lighten(ThemedStyles.theme ? 1 : 0.8)
              .darken(ThemedStyles.theme ? 0.8 : 0)
              .hex(),
          },
        ];
      case 'danger':
        return [
          ...commonStyles,
          ThemedStyles.style.justifyCenter,
          {
            ...raisedStyle,
            backgroundColor: Color(ThemedStyles.style.backgroundDanger.backgroundColor)
              .lighten(ThemedStyles.theme ? 1 : 0.8)
              .darken(ThemedStyles.theme ? 0.8 : 0)
              .hex(),
          },
        ];
      default:
        return [
          ...commonStyles,
          ThemedStyles.style.justifyCenter,
          {
            ...raisedStyle,
            backgroundColor: Color(ThemedStyles.style.backgroundLink.backgroundColor)
              .lighten(ThemedStyles.theme ? 1 : 0.8)
              .darken(ThemedStyles.theme ? 0.8 : 0)
              .hex(),
          },
        ];
    }
  }, [raised, style, ThemedStyles]);

  return (
    <TouchableOpacity {...otherProps} disabled={disabled} style={containerStyle}>
      {icon && <View style={ThemedStyles.style.marginRight}>{icon}</View>}
      {children ? (
        children
      ) : label ? (
        <Text style={[textStyle, ThemedStyles.style.fontL, ThemedStyles.style.textCenter]}>
          {label}
        </Text>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    //
  },
});
