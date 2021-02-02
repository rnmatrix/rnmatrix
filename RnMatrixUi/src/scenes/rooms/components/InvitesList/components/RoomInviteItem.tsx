import { matrix } from '@rn-matrix/core';
import { useObservableState } from 'observable-hooks';
import React from 'react';
import { StyleSheet, Text, TouchableHighlight, View } from 'react-native';
import Avatar from '../../../../../common/Avatar';
import ThemedStyles from '../../../../../styles/ThemedStyles';
import Icon from '../../../../../common/Icon';

const avatarSize = 50;

export default function RoomInviteItem({ room }) {
  const name = useObservableState<any>(room.name$);
  const theme = ThemedStyles.style;

  const joinRoom = () => {
    matrix.joinRoom(room.id);
  };

  const rejectInvite = () => {
    matrix.leaveRoom(room.id);
  };

  return (
    <TouchableHighlight underlayColor="#ddd">
      <View
        style={[
          styles.rowWrapper,
          theme.paddingVertical3x,
          theme.borderTopHair,
          theme.borderPrimary,
        ]}>
        <Avatar
          name={name || room.id}
          avatarURI={room.getAvatarUrl(avatarSize)}
          style={styles.avatar}
        />
        <View style={{ flex: 1, marginRight: 12, justifyContent: 'center' }}>
          <View style={styles.textWrapper}>
            <Text
              style={[styles.title, theme.colorPrimaryText]}
              numberOfLines={1}>
              {name}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <ResponseButton onPress={rejectInvite} />
              <ResponseButton accept onPress={joinRoom} />
            </View>
          </View>
        </View>
      </View>
    </TouchableHighlight>
  );
}

const ResponseButton = ({ accept = false, onPress }) => (
  <TouchableHighlight
    onPress={onPress}
    style={{ borderRadius: 30, marginRight: accept ? 0 : 12 }}
    underlayColor="#222">
    <View
      style={{
        width: 40,
        height: 40,
        backgroundColor: accept ? 'darkseagreen' : 'indianred',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 30,
      }}>
      <Icon
        name={accept ? 'check' : 'close'}
        size={accept ? 28 : 22}
        color={'#fff'}
      />
    </View>
  </TouchableHighlight>
);

const styles = StyleSheet.create({
  rowWrapper: {
    flexDirection: 'row',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 40,
    marginHorizontal: 16,
    alignSelf: 'center',
  },
  textWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 18,
    maxWidth: 200,
  },
  subtitle: {
    maxWidth: 200,
  },
});
