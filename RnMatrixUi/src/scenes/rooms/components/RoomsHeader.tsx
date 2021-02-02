import React, { useCallback } from 'react';
import { Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import ThemedStyles from '../../../styles/ThemedStyles';
import SearchBar, { SearchBarProps } from '../../../common/SearchBar';
import useNavigation from '../../../hooks/useNavigation';

interface RoomsHeaderProps extends SearchBarProps {}

const RoomsHeader = (props: RoomsHeaderProps) => {
  const theme = ThemedStyles.style;
  const navigation = useNavigation();
  const onNewRoom = useCallback(() => navigation.navigate('MessengerNewRoom'), [
    navigation,
  ]);

  return (
    <View
      style={[
        theme.rowJustifyStart,
        theme.alignCenter,
        theme.borderBottomHair,
        theme.borderPrimary,
        theme.backgroundSecondary,
      ]}>
      <SearchBar
        {...props}
        placeholder={'Search Inbox'} // TODO: translate
      />
      <Pressable
        style={styles.addIconWrapper}
        hitSlop={50}
        onPress={onNewRoom}>
        <Icon
          name="add"
          size={30}
          color={ThemedStyles.getColor('primary_text')}
        />
      </Pressable>
    </View>
  );
};

export default RoomsHeader;

const styles = StyleSheet.create({
  addIconWrapper: {
    position: 'absolute',
    right: 16,
  },
});
