import { useDimensions } from '@react-native-community/hooks';
// import { RouteProp } from '@react-navigation/native';
// import { StackNavigationProp } from '@react-navigation/stack';
import { matrix } from '@rn-matrix/core';
import chatService from '@rn-matrix/core/src/services/chat';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Spinner from '../../common/Spinner';
import ThemedStyles from '../../styles/ThemedStyles';
// import {
//   AppStackParamList,
//   RootStackParamList,
// } from '../../../../navigation/NavigationTypes';
import i18n from '../../utilities/i18n';
import Header from './components/Header';
import MemberSelector from './components/MemberSelector/MemberSelector';
import RoomDetailsForm from './components/RoomDetailsForm';
import ShareToRoomForm from './components/ShareToRoomForm';

const IS_IOS = Platform.OS === 'ios';

// TODO: translate
const t = (s) => i18n.t(`newRoom:${s}`);

// export type NewRoomScreenScreenRouteProp = RouteProp<
//   RootStackParamList & AppStackParamList,
//   'MessengerNewRoom'
// >;
// export type NewRoomScreenScreenNavigationProp = StackNavigationProp<
//   RootStackParamList & AppStackParamList,
//   'MessengerNewRoom'
// >;

interface NewRoomScreenSheetProps {
  route: any; // NewRoomScreenScreenRouteProp;
  navigation: any; // NewRoomScreenScreenNavigationProp;
}

export enum NewRoomScreens {
  /**
   * The screen that allows selecting a single member
   * */
  single,
  /**
   * The screen that allows selecting multiple members
   * */
  multiple,
  /**
   * The screen in which the user
   * enters details of the new room
   * to be created (name, topic, privacy, etc.)
   * */
  details,
  /**
   * The screen that is used to send a
   * link to some chat or user
   * */
  sendTo,
  /**
   * The screen that the user enters a message to
   * be sent along with a link. The second step of {NewRoomScreens.sendTo}
   * */
  shareToRoom,
}

/**
 * The screen used to add members
 * to a new room or remove them from
 * an existing one
 * */
const NewRoomScreen = ({ navigation, route }: NewRoomScreenSheetProps) => {
  /**
   * Properties
   * */
  const theme = ThemedStyles.style;
  const insets = useSafeAreaInsets();
  const room = route.params?.room;
  /**
   * If this screen was used to add new
   * members to an existing room
   * */
  const addingMember = Boolean(room);
  const [title, setTitle] = useState(route.params?.title || t('title'));
  const [doneTitle, setDoneTitle] = useState(route.params?.doneTitle || 'Group Chat');
  const [activeScreen, setActiveScreen] = useState<NewRoomScreens>(
    route.params?.screen || NewRoomScreens.single
  );
  const [selectedMembers, setSelectedMembers] = useState<any[]>([]);
  const chatDetailsRef = useRef<any>({});
  const {
    window: { width },
  } = useDimensions();
  const fullWidth = useMemo(() => ({ width }), [width]);
  const shareToRoomRef = useRef<any>();
  const scrollViewRef = useRef<ScrollView>();

  // The spacing above the card
  const cleanTop = { marginTop: insets.top + (IS_IOS ? 100 : 90) };
  // const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  /**
   * Set screen to group chat
   * */
  const goToGroupChat = useCallback(() => {
    setTitle('Group Chat'); // TODO: translate
    setDoneTitle(i18n.t('next'));
    setActiveScreen(NewRoomScreens.multiple);
  }, []);

  /**
   * Set screen to private chat
   * */
  const goToPrivateChat = useCallback(() => {
    setTitle(t('title')); // TODO: translate
    setDoneTitle('Group Chat');
    setActiveScreen(NewRoomScreens.single);
  }, []);

  /**
   * Set screen to chat details
   * */
  const goToChatDetails = useCallback(() => {
    setTitle(t('details.title'));
    setDoneTitle(i18n.t('create'));
    setActiveScreen(NewRoomScreens.details);
  }, []);

  /**
   * Set screen to chat details
   * */
  const goToShareToRoom = useCallback(() => {
    setTitle(i18n.t('sendTo'));
    setDoneTitle(i18n.t('share'));
    setActiveScreen(NewRoomScreens.shareToRoom);
  }, []);

  /**
   * Set screen to chat details
   * */
  const goToSendTo = useCallback(() => {
    setTitle(i18n.t('sendTo'));
    setDoneTitle(i18n.t('next'));
    setActiveScreen(NewRoomScreens.sendTo);
  }, []);

  /**
   * Update selected users
   * */
  const updateSelectedMembers = useCallback(
    (_selectedMembers) => setSelectedMembers(_selectedMembers.filter(Boolean)),
    []
  );

  /**
   * Invite selected members to room and navigate back
   * */
  const inviteNewMembers = useCallback(async () => {
    const client = matrix.getClient();
    // FIXME: can we batch requests here please?
    setLoading(true);
    try {
      await Promise.all(selectedMembers.map(async (user) => client.invite(room.id, user.id)));
      navigation.goBack();
    } catch (e) {
      console.error(e);
      // TODO: show something to the user
    } finally {
      setLoading(false);
    }
  }, [navigation, room, selectedMembers]);

  /**
   * Add user to selectedMembers if it doesn't exist
   * and remove if it does
   * */
  const toggleMember = useCallback(
    (selectedMember: any) => {
      updateSelectedMembers(
        selectedMembers.find((user) => user.id === selectedMember.id)
          ? selectedMembers.filter((user) => user.id !== selectedMember.id)
          : [...selectedMembers, selectedMember]
      );
    },
    [selectedMembers, updateSelectedMembers]
  );

  /**
   * Create a room and navigate to it, or find that room with
   * the given members and return it
   * @param {string} selectedMemberIds
   * */
    // TODO: maybe we should move these functions out of this component
  const createOrFindRoom = useCallback(
    async (selectedMemberIds?: string[]) => {
      const invites = selectedMemberIds || selectedMembers.map((user) => user.id);

      if (invites.length === 0) {
        return;
      }

      /**
       * If a room with the target member existed,
       * return that instead of creating a new one
       * */
      const directChat = await findRoom(invites);
      if (directChat) {
        return directChat;
      }

      setLoading(true);
      const r = await matrix.createRoom({
        ...chatDetailsRef.current,
        invite: invites,
      });
      setLoading(false);
      if (r.error) {
        // TODO
        // return showNotification("Could't create the room", 'danger');
        return;
      }

      return r;
    },
    [navigation, selectedMembers, title, chatDetailsRef.current]
    );

  /**
   * Find a room with the given user ids
   *
   * TODO: also look for group chats
   * */
  const findRoom = useCallback(
    async (selectedMemberIds: string[]) => {
      /**
       * If a room with the target member existed,
       * navigate there instead of creating a new one
       * */
      if (selectedMemberIds.length === 1) {
        const directChat = matrix.getDirectChat(selectedMemberIds[0]);
        if (directChat) {
          return directChat;
        }
      }

      return null;
    },
    [navigation, selectedMembers, title, chatDetailsRef.current]
  );

  /**
   * Called when room detail changes
   * */
  const onDetailsChange = useCallback((details) => {
    chatDetailsRef.current = details;
  }, []);

  /**
   * Called when user presses header rightIcon
   * */
  const onDone = useCallback(async () => {
    /**
     * If this screen was used to add new
     * members to an existing room
     * */
    if (addingMember) {
      return inviteNewMembers();
    }

    switch (activeScreen) {
      case NewRoomScreens.single:
        return goToGroupChat();
      case NewRoomScreens.multiple:
        const r = await findRoom(selectedMembers.map((m) => m.id));

        if (r) {
          // FIXME: use a function and dont repeat this
          return navigation.navigate('MessengerRoom', {
            roomId: r.id,
          });
        }
        goToChatDetails();
        return scrollViewRef.current?.scrollToEnd();
      case NewRoomScreens.sendTo:
        goToShareToRoom();
        return scrollViewRef.current?.scrollToEnd();
      case NewRoomScreens.shareToRoom:
        // TODO: share to the rooms
        // FIXME: NOT HERE!
        if (shareToRoomRef.current) {
          const message = shareToRoomRef.current.getMessage();

          const selectedRooms = selectedMembers.filter((member) => member.id[0] === '!');
          const selectedUsers = selectedMembers.filter((member) => member.id[0] === '@');

          // TODO: loading?
          await Promise.all(
            selectedRooms.map((selectedRoom) => {
              const room = chatService.getChatById(selectedRoom.id);
              return room.sendMessage(`${message} ${route.params?.url}`, 'm.text');
            })
          );
          /**
           * Send each selected user the message separately.
           * TODO: should this send the message to the users in a group?
           * TODO: maybe this should look for an existing group with the selected items
           * if all the items the user had selected are users
           * */
          await Promise.all(
            selectedUsers.map(async (selectedUser) => {
              const room = await createOrFindRoom([selectedUser.id]);

              return room.sendMessage(`${message} ${route.params?.url}`, 'm.text');
            })
          );
          return navigation.goBack();
        }
        return null;
      case NewRoomScreens.details:
        return createOrFindRoom()
          .then((r) =>
            navigation.navigate('MessengerRoom', {
              roomId: r.id,
            })
          )
          .catch((e) => {
            console.log(e);
          });
      default:
    }
  }, [
    activeScreen,
    inviteNewMembers,
    selectedMembers,
    addingMember,
    goToChatDetails,
    goToGroupChat,
    createOrFindRoom,
  ]);

  /**
   * Called when user presses header leftIcon
   * */
  const onBack = useCallback(() => {
    if (addingMember) {
      return navigation.goBack();
    }

    switch (activeScreen) {
      case NewRoomScreens.multiple:
        return goToPrivateChat();
      case NewRoomScreens.details:
        goToGroupChat();
        return scrollViewRef.current?.scrollTo({ x: 0 });
      case NewRoomScreens.shareToRoom:
        goToSendTo();
        return scrollViewRef.current?.scrollTo({ x: 0 });
      default:
        return navigation.goBack();
    }
  }, [activeScreen, addingMember]);

  const handleSingleScreenMemberPress = useCallback(
    (member) =>
      createOrFindRoom([member.id]).then((r) =>
        navigation.navigate('MessengerRoom', {
          roomId: r.id,
        })
      ),
    []
  );

  const handleMultiScreenMemberPress = useCallback(
    (selectedMember) => selectedMember && toggleMember(selectedMember),
    [toggleMember]
  );

  return (
    <View style={[cleanTop, styles.container, theme.backgroundPrimary]}>
      <Header
        leftIcon={
          <Pressable style={styles.headerLeftIconWrapper} hitSlop={50} onPress={onBack}>
            <Text style={[theme.fontL, theme.bold]}>
              {activeScreen === NewRoomScreens.single ? 'Close' : 'Back'}
            </Text>
          </Pressable>
        }
        title={title}
        rightIcon={
          loading ? (
            <View style={styles.headerRightIconWrapper}>
              <Spinner size={'small'} />
            </View>
          ) : (
            <Pressable style={styles.headerRightIconWrapper} hitSlop={50} onPress={onDone}>
              <Text style={[theme.fontL, theme.bold]}>{doneTitle}</Text>
            </Pressable>
          )
        }
      />
      {/**
       * This ScrollView is used to horizontally animate between pages
       * */}
      <ScrollView
        ref={(ref) => (scrollViewRef.current = ref!)}
        horizontal
        style={fullWidth}
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}>
        <View style={fullWidth}>
          {activeScreen === NewRoomScreens.single ? (
            <MemberSelector onMemberPress={handleSingleScreenMemberPress} />
          ) : (
            <MemberSelector
              excludeMembers={route.params?.existingMembers}
              onMemberPress={handleMultiScreenMemberPress}
              includeRooms={activeScreen === NewRoomScreens.sendTo}
              selectedMembers={selectedMembers}
              updateSelectedMembers={updateSelectedMembers}
              showCheckbox
            />
          )}
        </View>
        <View style={fullWidth}>
          {activeScreen === NewRoomScreens.sendTo || activeScreen === NewRoomScreens.shareToRoom ? (
            <ShareToRoomForm
              ref={(ref) => (shareToRoomRef.current = ref)}
              selectedMembers={selectedMembers}
              onDetailsChange={onDetailsChange}
            />
          ) : (
            <RoomDetailsForm onDetailsChange={onDetailsChange} />
          )}
        </View>
      </ScrollView>
    </View>
  );
};

NewRoomScreen.route = 'MessengerNewRoom';

export default NewRoomScreen;

const styles = StyleSheet.create({
  headerRightIconWrapper: { position: 'absolute', right: 20 },
  headerLeftIconWrapper: { position: 'absolute', left: 20 },
  container: {
    flex: 1,
    borderTopRightRadius: 15,
    borderTopLeftRadius: 15,
    overflow: 'hidden',
  },
});
