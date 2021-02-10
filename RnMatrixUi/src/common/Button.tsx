import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import colors from '../styles/Colors';
import ThemedStyles from '../styles/ThemedStyles';

interface OurButtonProps extends TouchableOpacityProps {
  //
}

export default function Button(props) {
  const { label, children, style, disabled, type, icon, ...otherProps } = props;

  const textStyle = useMemo(() => {
    if (disabled) {
      return ThemedStyles.style.colorTertiaryText;
    }

    if (type) {
      switch (type) {
        case 'danger':
        default:
          return { color: colors.danger };
      }
    }

    return { color: colors.primary };
  }, [disabled, type, ThemedStyles]);

  return (
    <TouchableOpacity
      {...otherProps}
      disabled={disabled}
      style={[ThemedStyles.style.paddingVertical, ThemedStyles.style.rowJustifyStart, style]}>
      {icon}
      {children ? (
        children
      ) : label ? (
        <Text style={[textStyle, ThemedStyles.style.fontL]}>{label}</Text>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    //
  },
});
