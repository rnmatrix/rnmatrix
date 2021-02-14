import { matrix } from '@rn-matrix/core';
import React, { useCallback, useState } from 'react';
import useNavigation from '../../../hooks/useNavigation';
import RoomScreen from '../../room/RoomScreen';
import RoomListItem from '../components/RoomListItem';

const useTextMessageSearch = () => {
  const navigation = useNavigation();

  const [searchResults, setSearchResults] = useState<any>({});
  const [searchResultsLoading, setSearchResultsLoading] = useState<any>(false);
  // const onSearchTermChange = useCallback(async (value) => {
  //   if (!value) return;
  //   setSearchResultsLoading(true);
  //   const result = await matrix.getClient().searchMessageText({
  //     query: value,
  //   });
  //   setSearchResults(result.search_categories.room_events);
  //   setSearchResultsLoading(false);
  // }, []);
  /**
   * TODO: this is temporary and only for MVP. This should support
   * remote and local search in rooms and messages. Just like Element
   * */
  const onSearchTermChange = useCallback(async (value) => {
    if (!value) return setSearchResults({});
    const rooms = matrix.getRooms$()?.getValue();
    // Filter rooms based on their name
    const matchedRooms = rooms.filter((room) =>
      room._matrixRoom.name.toLowerCase().includes(value.toLowerCase()),
    );
    setSearchResults({
      results: matchedRooms,
      count: matchedRooms.length,
    });
  }, []);
  const onSearchResultPress = useCallback(
    (room) => {
      navigation.navigate(RoomScreen.route, { room });
    },
    [navigation],
  );
  const renderSearchResult = useCallback(
    ({ item: room }) => {
      return (
        <RoomListItem
          highlights={searchResults.highlights}
          // body={`${result.user_id.split(':')[0]}: ${result.content.body}`}
          key={room.id}
          room={room}
          onPress={onSearchResultPress}
          showUnreadStatus={false}
        />
      );
    },
    [onSearchResultPress, searchResults.highlights],
  );

  return {
    searchResultsLoading,
    renderSearchResult,
    onSearchTermChange,
    searchResults,
  };
};

export default useTextMessageSearch;
