import React from 'react';
import { TouchableOpacity, View, Image } from 'react-native';
import Reactions from './Reactions';
import rnm from '@rn-matrix/core'

const avatarSize = 40

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
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginBottom: !prevSame ? 12 : 0 }}>
      {!prevSame ? <Image source={{uri: avatar}} style={{ backgroundColor: '#bbb', width: avatarSize, height: avatarSize, borderRadius: 80, marginRight: 6 }} /> : <View style={{ width: avatarSize, marginRight: 6}} />}

      <View>
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
        <Reactions room={room} event={event} isMe={isMe} />

      </View>
    </View>
  );
}
