import React, { useEffect } from 'react';
import { ActivityIndicator, FlatList, View, Text } from 'react-native';
import { useMatrix, useRoomList } from '@rn-matrix/core';
import RoomInviteItem from './components/RoomInviteItem';
import RoomListItem from './components/RoomListItem';

interface RoomListProps {
  onRowPress?: Function;
  renderListItem?: Function;
  renderInvite?: Function;
  isFocused: boolean;
}

export default function RoomList({ onRowPress, renderListItem = undefined, renderInvite = undefined, isFocused }) {
  const { isReady, isSynced } = useMatrix();
  const { roomList, inviteList, updateLists, startListeners, removeListeners } = useRoomList();

  const handlePress = (item) => {
    removeListeners()
    onRowPress(item)
  }

  const renderRow = ({ item }) => {
    // We define the snippet out here so that the memoized RoomListItem will
    // update when it's supposed to (it doesn't with only room as the prop)
    let snippet = undefined;
    try {
      snippet = item.timeline[item.timeline.length - 1];
    } catch {}
    return <RoomListItem room={item} snippet={snippet} onPress={handlePress} />;
  };

  const renderInviteRow = ({ item }) => {
    return <RoomInviteItem room={item} updateLists={updateLists} />;
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

  useEffect(() => {
    console.log({isFocused})
    if (isFocused) {
      startListeners()
    } else {
      removeListeners()
    }
  }, [isFocused])

  return (
    <FlatList
      data={roomList}
      renderItem={renderListItem ? renderListItem : renderRow}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={InviteList}
    />
  );
}
