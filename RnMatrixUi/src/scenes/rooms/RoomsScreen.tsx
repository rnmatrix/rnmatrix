import rnm, { useMatrix, useRoomList, matrix } from '@rn-matrix/core';
import DMRoomMap from '@rn-matrix/core/src/react-sdk-utils/DMRoomMap';
import { useObservableState } from 'observable-hooks';
import React, { useCallback, useEffect } from 'react';
import { SafeAreaView } from 'react-native';
import ToastContainer from '../../components/ToastContainer';
import ThemedStyles from '../../styles/ThemedStyles';
import Navigation from '../../utilities/navigation';
import RoomList from './components/RoomList';
// import RoomListItem from './components/RoomListItem';
import RoomsHeader from './components/RoomsHeader';
import useTextMessageSearch from './hooks/useTextMessageSearch';

import RoomListItem from '../../common/RoomListItem'
export default function RoomsScreen({ navigation }) {
  const theme = ThemedStyles.style;
  const {
    onSearchTermChange,
    searchResults,
    renderSearchResult,
    searchResultsLoading,
  } = useTextMessageSearch();

  const { isReady, isSynced } = useMatrix();
  const { roomList, inviteList, updateLists } = useRoomList();

  useEffect(() => {
    if (Navigation.setInstance) {
      Navigation.setInstance(navigation);
    }
  }, []);

  // const rooms = useObservableState<any[]>(matrix.getRooms$());
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

  if (!isReady || !isSynced) return null

  return (
    <>
      <SafeAreaView style={[theme.flexContainer, theme.backgroundPrimary]}>
        <RoomList
          data={searchResults.count > 0 ? searchResults.results : roomList}
          inviteList={inviteList}
          listHeader={
            <RoomsHeader loading={searchResultsLoading} onChangeText={onSearchTermChange} />
          }
          renderRow={searchResults.count > 0 ? renderSearchResult : renderRoomListItem}
        />
      </SafeAreaView>

      <ToastContainer />
    </>
  );
}

RoomsScreen.route = "RoomsScreen"
