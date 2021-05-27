import React, { FC } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ThemedStyles from '../../../styles/ThemedStyles';

type HeaderProps = {
  rightIcon?: any;
  title: string;
  leftIcon?: any;
}

const Header: FC<HeaderProps> = ({ rightIcon, title, leftIcon }) => {
  const theme = ThemedStyles.style;

  return (
    <View
      style={[
        theme.rowJustifyCenter,
        theme.alignCenter,
        theme.paddingVertical5x,
        theme.borderBottomHair,
        theme.borderPrimary,
      ]}>
      {leftIcon}
      <Text style={[theme.textCenter, theme.bold, styles.headerTitleFontSize]}>
        {title}
      </Text>
      {rightIcon}
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  headerTitleFontSize: { fontSize: 20 },
});
