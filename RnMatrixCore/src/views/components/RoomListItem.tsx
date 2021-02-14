import { Room } from 'matrix-js-sdk/src/models/room';
import React from 'react';
// import { useObservableState } from 'observable-hooks';
import { StyleSheet, TouchableHighlight, Image, View, Text } from 'react-native';
import { textForEvent } from '../../matrix-react/TextForEvent';
import rnm from '../../services/main';
// import moment from 'moment';
// import Icon from './Icon';

interface Props {
  room: Room;
  onPress: (room: Room) => void;
}

const avatarSize = 50;

const RoomListItem = React.memo(({ room, snippet, onPress }: Props) => {
  const name = room.name || room.getDefaultRoomName(rnm.getClient().getUserId());

  const avatar = room.getAvatarUrl(
    rnm.getClient().getHomeserverUrl(),
    avatarSize,
    avatarSize,
    'crop',
    false
  );

  const unreadCount = room.getUnreadNotificationCount('total');

  const handleOnPress = () => {
    onPress(room);
  };

  return (
    <TouchableHighlight underlayColor="#ddd" onPress={handleOnPress}>
      <View style={styles.rowWrapper}>
        {avatar ? (
          <Image source={{ uri: avatar }} style={styles.avatar} />
        ) : (
          <DefaultImage letter={name?.charAt(0)} />
        )}

        <View style={{ flex: 1, marginRight: 12 }}>
          <View style={styles.textWrapper}>
            <Text style={styles.title} numberOfLines={1}>
              {rnm.getClient().isRoomEncrypted(room) && <Text>🔒&nbsp;</Text>}
              {name}
            </Text>
            <Text style={{ color: '#444' }}>{new Date(snippet?.getTs()).toDateString()}</Text>
          </View>
          <View style={styles.textWrapper}>
            <Text style={styles.snippet} numberOfLines={2} ellipsizeMode="tail">
              {textForEvent(snippet)}
            </Text>
            {unreadCount > 0 && <UnreadIndicator unreadCount={unreadCount} />}
          </View>
        </View>
      </View>
    </TouchableHighlight>
  );
});
export default RoomListItem;

const DefaultImage = ({ letter }) => (
  <View
    style={[
      styles.avatar,
      { backgroundColor: '#666', justifyContent: 'center', alignItems: 'center' },
    ]}>
    <Text style={styles.defaultAvatarLetter}>{letter?.toUpperCase()}</Text>
  </View>
);

const UnreadIndicator = ({ unreadCount }) => (
  <View style={styles.unreadIndicator}>
    <Text style={{ color: '#fff', fontWeight: '600' }}>{unreadCount}</Text>
  </View>
);

const styles = StyleSheet.create({
  rowWrapper: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomColor: '#ccc',
    borderBottomWidth: 0.5,
    height: 85,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 50,
    marginHorizontal: 12,
    alignSelf: 'center',
    backgroundColor: '#666',
  },
  textWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 4,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#222',
    maxWidth: 200,
  },
  snippet: {
    maxWidth: 300,
    color: '#444',
  },
  defaultAvatarLetter: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ddd',
  },
  unreadIndicator: {
    backgroundColor: 'dodgerblue',
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 40,
    alignSelf: 'flex-start',
    // marginTop: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
