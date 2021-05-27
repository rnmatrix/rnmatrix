import React from 'react';
import { TouchableOpacity, View, Image, StyleSheet, Text } from 'react-native';
import Reactions from '../Reactions';
import rnm from '@rn-matrix/core';

const avatarSize = 40;

export default function MessageWrapper({
  room,
  event,
  isMe,
  onPress,
  onLongPress,
  nextSame,
  prevSame,
  children,
}) {
  const avatar = event.sender.getAvatarUrl(
    rnm.getClient().getHomeserverUrl(),
    avatarSize,
    avatarSize,
    'crop',
    false
  );

  return (
    <View
      style={{
        marginBottom: !prevSame ? 12 : 0,
        alignSelf: isMe ? 'flex-end' : 'flex-start',
        maxWidth: '85%',
      }}>
      {/* User name */}
      {!nextSame && !isMe && (
        <Text style={{ marginLeft: avatarSize + 6 + 12, fontWeight: 'bold' }}>
          {event.sender.name}
        </Text>
      )}

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-end',
          justifyContent: isMe ? 'flex-end' : 'flex-start',
        }}>
        {/* Avatar  */}
        {!isMe &&
          (!prevSame ? (
            <Avatar avatar={avatar} name={event.sender.name} />
          ) : (
            <View style={{ width: avatarSize, marginRight: 6 }} />
          ))}

        {/* Message bubble  */}
        <TouchableOpacity
          onPress={onPress}
          onLongPress={onLongPress}
          style={{
            flexDirection: `row${isMe ? '-reverse' : ''}`,
            alignItems: 'center',
            marginVertical: 2,
          }}>
          {children}
        </TouchableOpacity>
      </View>

      {/* Reactions  */}
      <View style={{ marginLeft: avatarSize + 6, marginTop: 3 }}>
        <Reactions room={room} event={event} isMe={isMe} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: '#bbb',
    width: avatarSize,
    height: avatarSize,
    borderRadius: 80,
    marginRight: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const Avatar = React.memo(({ avatar, name }) =>
  avatar ? (
    <Image source={{ uri: avatar }} style={styles.avatar} />
  ) : (
    <View style={styles.avatar}>
      <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 20 }}>{name.charAt(0)}</Text>
    </View>
  )
);
