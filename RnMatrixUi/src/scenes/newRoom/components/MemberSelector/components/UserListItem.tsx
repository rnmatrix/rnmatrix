import { useDimensions } from '@react-native-community/hooks';
import userService from '@rn-matrix/core/src/services/user';
import React, { useCallback } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Avatar from '../../../../../common/Avatar';
import ThemedStyles from '../../../../../styles/ThemedStyles';

interface UserListItemProps {
  onSelectedChange?: (selected?: string) => void;
  user: any;
  selected?: boolean;
  hideId?: boolean;
  icon?: any;
  style?: any;
  onPress?: () => void;
}

const AVATAR_SIZE = 40;

const UserListItem = ({
  onSelectedChange,
  user,
  icon,
  style,
  onPress,
  hideId,
}: UserListItemProps) => {
  const theme = ThemedStyles.style;
  const name = user.name;
  const avatar = user?.avatarUrl;
  const { width } = useDimensions().window;
  const onToggle = useCallback(
    () => onSelectedChange && onSelectedChange(user.id),
    [onSelectedChange, user.id],
  );

  return (
    <TouchableOpacity
      key={user.id}
      onPress={onPress || (onSelectedChange && onToggle)}
      activeOpacity={onSelectedChange ? 0.7 : 1}
      style={[
        theme.paddingVertical2x,
        theme.paddingHorizontal4x,
        styles.container,
        theme.backgroundPrimary,
        theme.borderTopHair,
        theme.borderPrimary,
        style,
      ]}>
      <View style={styles.avatarWrapper}>
        <Avatar
          size={AVATAR_SIZE}
          name={name || user.id}
          avatarURI={userService.getAvatarUrl(avatar)}
        />
      </View>

      <View style={[{ maxWidth: width * 0.6 }, theme.marginLeft2x]}>
        {user.name && (
          <Text style={[theme.fontL, theme.fontSemibold]}>{user.name}</Text>
        )}
        {!hideId && <Text>{user.id}</Text>}
      </View>

      {icon && <View style={styles.iconWrapper}>{icon}</View>}
    </TouchableOpacity>
  );
};

export default UserListItem;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrapper: {
    position: 'relative',
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
  },
  iconWrapper: {
    position: 'absolute',
    right: 20,
  },
});
