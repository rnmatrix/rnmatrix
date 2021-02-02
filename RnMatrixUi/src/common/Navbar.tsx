import { useDimensions } from '@react-native-community/hooks';
import React, { useCallback, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Entypo';
import ThemedStyles from '../styles/ThemedStyles';
import useNavigation from '../hooks/useNavigation';

interface NavbarProps {
  title?: string;
  titleElement?: JSX.Element;
  rightIcon?: any;
  style?: any;
}

const Navbar = ({ title, titleElement, rightIcon, style }: NavbarProps) => {
  const theme = ThemedStyles.style;
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { width } = useDimensions().window;
  const onBackPress = useCallback(() => navigation.goBack(), [navigation]);

  return (
    <View
      style={[
        theme.rowJustifySpaceBetween,
        theme.paddingHorizontal2x,
        theme.paddingVertical4x,
        theme.borderBottomHair,
        theme.borderPrimary,
        theme.backgroundPrimary,
        theme.alignCenter,
        useMemo(
          () => ({
            paddingTop: theme.paddingVertical4x.paddingVertical + insets.top,
          }),
          [insets.top, theme.paddingVertical4x.paddingVertical],
        ),
        styles.container,
        style,
      ]}>
      <Pressable onPress={onBackPress} hitSlop={50}>
        <Icon
          name="chevron-thin-left"
          size={25}
          color={ThemedStyles.getColor('secondary_text')}
        />
      </Pressable>
      {titleElement || (
        <Text
          numberOfLines={1}
          textBreakStrategy={'highQuality'}
          style={[
            styles.title,
            theme.bold,
            theme.textCenter,
            useMemo(() => ({ width: width * 0.7 }), [width]),
          ]}>
          {title}
        </Text>
      )}
      <View style={styles.rightIconContainer}>{rightIcon}</View>
    </View>
  );
};

export default Navbar;

const styles = StyleSheet.create({
  container: {
    // height: 90,
  },
  title: { fontSize: 22 },
  rightIconContainer: {
    width: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
