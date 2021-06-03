import React, { useCallback } from 'react';
import { Pressable, StyleSheet } from 'react-native';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ThemedStyles from '../styles/ThemedStyles';

interface CheckboxProps {
  value?: boolean;
  size?: number;
  onChange?: (value: boolean) => void;
  style?: any;
}

const Checkbox = ({ value, onChange, size = 26, style }: CheckboxProps) => {
  const theme = ThemedStyles.style;

  const onPress = useCallback(() => onChange && onChange(!value), []);

  return (
    <Pressable
      onPress={onPress}
      pointerEvents={onChange ? 'auto' : 'none'}
      style={[
        theme.centered,
        {
          width: size,
          height: size,
          borderRadius: size,
          borderWidth: 1,
        },
        value ? theme.borderLink : theme.borderPrimary,
        style,
      ]}>
      {/* {value && <Icon name="check" size={20} color={theme.colorPrimaryText.color} />} */}
    </Pressable>
  );
};

export default Checkbox;
