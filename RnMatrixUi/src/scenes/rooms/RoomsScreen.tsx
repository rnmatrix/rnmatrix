import { matrix } from '@rn-matrix/core';
import DMRoomMap from '@rn-matrix/core/src/react-sdk-utils/DMRoomMap';
import { useObservableState } from 'observable-hooks';
import React, { useCallback, useEffect } from 'react';
import { SafeAreaView } from 'react-native';
import ThemedStyles from '../../styles/ThemedStyles';
import RoomList from './components/RoomList';
import RoomListItem from './components/RoomListItem';
import RoomsHeader from './components/RoomsHeader';
import useTextMessageSearch from './hooks/useTextMessageSearch';

export default function RoomsScreen({ navigation }) {
  const theme = ThemedStyles.style;
  const {
    onSearchTermChange,
    searchResults,
    renderSearchResult,
    searchResultsLoading,
  } = useTextMessageSearch();

  const rooms = useObservableState<any[]>(matrix.getRooms$());
  const onRoomPress = useCallback((room) => navigation.navigate('MessengerRoom', { room }), [
    navigation,
  ]);
  const renderRoomListItem = useCallback(
    ({ item }) => {
      return <RoomListItem key={item.id} room={item} onPress={onRoomPress} />;
    },
    [onRoomPress]
  );

  // FIXME: this shouldnt be here
  useEffect(() => {
    DMRoomMap.makeShared().start();
  }, []);

  return (
    <SafeAreaView style={[theme.flexContainer, theme.backgroundPrimary]}>
      <RoomList
        data={searchResults.count > 0 ? searchResults.results : rooms}
        listHeader={
          <RoomsHeader loading={searchResultsLoading} onChangeText={onSearchTermChange} />
        }
        renderRow={searchResults.count > 0 ? renderSearchResult : renderRoomListItem}
      />
    </SafeAreaView>
  );
}
