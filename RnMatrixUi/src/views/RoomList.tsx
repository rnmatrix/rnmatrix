import React, { useCallback } from 'react';
import { ActivityIndicator, FlatList, View, Text } from 'react-native';
import { useMatrix, useRoomList } from '@rn-matrix/core';
import RoomInviteItem from './components/RoomInviteItem';
import RoomListItem from './components/RoomListItem';

export default function RoomList({ onRowPress, renderListItem = undefined, renderInvite = undefined }) {
  const { isReady, isSynced } = useMatrix();
  const { roomList, inviteList, updateLists } = useRoomList();

  const renderRow = ({ item }) => {
    // We define the snippet out here so that the memoized RoomListItem will
    // update when it's supposed to (it doesn't with only room as the prop)
    let snippet = undefined;
    try {
      snippet = item.timeline[item.timeline.length - 1];
    } catch {}
    return <RoomListItem key={item.id} room={item} snippet={snippet} onPress={onRowPress} />;
  };

  const renderInviteRow = ({ item }) => {
    return <RoomInviteItem key={item.id} room={item} updateLists={updateLists} />;
  };

  if (!isReady || !isSynced) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const InviteList = () => (
    <>
      {inviteList.map((item) =>
        renderInvite ? renderInvite({ item }) : renderInviteRow({ item })
      )}
    </>
  );

  return (
    <FlatList
      data={roomList}
      renderItem={renderListItem ? renderListItem : renderRow}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={InviteList}
    />
  );
}
