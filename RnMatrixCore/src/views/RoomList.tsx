import React, { useCallback } from 'react';
import { ActivityIndicator, FlatList, View } from 'react-native';
import { useMatrix, useRoomList } from '../hooks';
// import RoomInviteItem from './components/RoomInviteItem';
import RoomListItem from './components/RoomListItem';

export default function RoomList({ onRowPress, renderListItem = undefined }) {
  const { isReady, isSynced } = useMatrix();
  const { roomList } = useRoomList();

  const renderRow = ({ item }) => {
    // We define the snippet out here so that the memoized RoomListItem will
    // update when it's supposed to (it doesn't with only room as the prop)
    let snippet = undefined;
    try {
      snippet = item.timeline[item.timeline.length - 1];
    } catch {}
    return <RoomListItem key={item.id} room={item} snippet={snippet} onPress={onRowPress} />;
  };

  // const renderInviteRow = ({ item }) => {
  //   return <RoomInviteItem key={item.id} room={item} />;
  // };

  if (!isReady || !isSynced) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // const InviteList = () => (
  //   <>
  //     {inviteList.map((item) =>
  //       renderInvite ? renderInvite({ item }) : renderInviteRow({ item })
  //     )}
  //   </>
  // );

  return (
    <FlatList
      data={roomList}
      renderItem={renderListItem ? renderListItem : renderRow}
      keyExtractor={(item) => item.id}
      // ListHeaderComponent={InviteList}
    />
  );
}
