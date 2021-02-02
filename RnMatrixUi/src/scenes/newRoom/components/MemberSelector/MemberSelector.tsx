import User from '@rn-matrix/core/src/classes/User';
import userService from '@rn-matrix/core/src/services/user';
import { matrix } from '@rn-matrix/core';
import debounce from 'lodash/debounce';
import { useObservableState } from 'observable-hooks';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import Checkbox from '../../../../common/Checkbox';
import ErrorBoundary from '../../../../common/ErrorBoundary';
import i18n from '../../../../utilities/i18n';
import ThemedStyles from '../../../../styles/ThemedStyles';
import SearchBar from '../../../../common/SearchBar';
import UserListItem from './components/UserListItem';
import MembersBar from './components/MembersBar';

interface ChatSelectorProps {
  selectedMembers?: any[];
  updateSelectedMembers?: (selectedMembers: any[]) => void;
  onMemberPress: (selectedMember: any) => void;
  showCheckbox?: boolean;
  /**
   * Show rooms on initial screen instead of members
   * */
  includeRooms?: boolean;
  /**
   * Exclude these user ids from the list
   * */
  excludeMembers?: string[];
}

const t = (s) => i18n.t(`newRoom:userSearch.${s}`);

/**
 * A component used to select room members
 * */
const MemberSelector = ({
  selectedMembers = [],
  updateSelectedMembers = () => {},
  onMemberPress,
  showCheckbox,
  includeRooms,
  excludeMembers,
}: ChatSelectorProps) => {
  /**
   * Properties
   * */
  const theme = ThemedStyles.style;
  const [searchTerm, setSearchTerm] = useState('');
  const [searching, setSearching] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>();
  const [items, setItems] = useState([]);
  const searchField = useRef<any>();
  const keyExtractor = ({ id }) => id;

  /**
   * Methods
   * */
  const isSelected = useCallback(
    (id) => selectedMembers.find((user) => user.id === id),
    [selectedMembers],
  );

  const searchMembers = useCallback(
    debounce(async (_searchTerm) => {
      setSearching(true);
      const userList = await userService.searchUsers(_searchTerm);
      setSearching(false);
      setItems(
        userList.map(
          (u) =>
            new User(u.id, {
              avatarUrl: u.avatar,
              displayName: u.name,
            }),
        ),
      );
    }, 500),
    [],
  );

  const validate = useCallback(
    (userId) => {
      if (selectedMembers.length >= 10 && searchField.current.state.text) {
        setError(t('usersExcessiveNotice'));
        return false;
      } else if (
        (userId === '' && selectedMembers.length) ||
        /^@\w+([.-]?\w+)*:\w+([.-]?\w+)*(.\w{2,3})+$/.test(userId.trim())
      ) {
        setError(undefined);
        updateSelectedMembers([...selectedMembers, userId]);
      } else {
        if (searchField.current.state.text.length > 0) {
          setError(t('userInvalidNotice'));
        }
        return false;
      }
    },
    [selectedMembers, updateSelectedMembers],
  );

  const onChangeText = useCallback((text) => setSearchTerm(text), []);

  const onSubmitEditingLocal = useCallback(
    (userId) => {
      return validate(userId);
    },
    [validate],
  );

  const renderItem = useCallback(
    ({ item, index }) => (
      <UserListItem
        key={item.id}
        // TODO: I don't like this :(
        user={{
          id: item.id,
          name: item.name$.getValue(),
          avatarUrl: item.avatar$.getValue(),
        }}
        hideId={item.type === 'room'}
        onSelectedChange={() => onMemberPress(item)}
        style={index === 0 && styles.borderTopTransparent}
        icon={showCheckbox && <Checkbox value={isSelected(item.id)} />}
      />
    ),
    [isSelected, onMemberPress, showCheckbox],
  );

  // TODO: any is not good. Be more specific.
  const rooms = useObservableState<any>(matrix.getRooms$());

  /**
   * Lifecycle
   * */
  useEffect(() => {
    // TODO: explain
    if (searchTerm === '') {
      if (includeRooms) {
        if (rooms) {
          // TODO: this is stupid please do sth about it
          setItems(
            rooms.map((room) => ({
              id: room.id,
              name$: room.name$,
              avatar$: room.avatar$,
              type: 'room',
            })),
          );
        }
      } else {
        /**
         * We need to transform the userService to simple
         * objects because the prototype is lost between components
         * */
        const knownUsers = userService.getKnownUsers();
        setItems(
          knownUsers.map(
            (u) =>
              new User(u.id, {
                avatarUrl: u.avatar,
                displayName: u.name,
              }),
          ),
        );
      }
    } else {
      searchMembers(searchTerm);
    }
  }, [searchTerm, rooms, includeRooms]);

  return (
    <ErrorBoundary message={'ERRPr'}>
      <FlatList
        ListHeaderComponent={
          <>
            <MembersBar
              members={selectedMembers}
              onMemberPress={onMemberPress}
            />

            <SearchBar
              onChangeText={onChangeText}
              placeholder={'Search Minds'} // TODO: translate
              textInputProps={{
                // TODO: performance
                // onSubmitEditing: onSubmitEditingLocal,
                placeholder: t('usersInputPlaceholder'),
                keyboardType: 'default',
                underlineColorAndroid: 'transparent',
                selectTextOnFocus: true,
              }}
              loading={searching}
              textInputStyle={[
                theme.padding4x,
                theme.borderPrimary,
                theme.borderTopHair,
                theme.borderBottomHair,
              ]}
            />
          </>
        }
        data={
          // TODO: move this out of here
          excludeMembers
            ? items.filter(
                (item: any) => !excludeMembers.find((userId) => userId === item.id),
              )
            : items
        }
        ListFooterComponent={<View style={styles.spacing} />}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        keyboardDismissMode={'on-drag'}
      />
    </ErrorBoundary>
  );
};

export default MemberSelector;

const styles = StyleSheet.create({
  spacing: { height: 200 },
  borderTopTransparent: { borderTopColor: 'transparent' },
});
