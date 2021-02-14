// import { RouteProp } from '@react-navigation/native';
// import { StackNavigationProp } from '@react-navigation/stack';
import { matrix } from '@rn-matrix/core';
// import { useObservableState } from 'observable-hooks';
import React, { useCallback, useMemo, useRef } from 'react';
import { TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
// import i18n from '../../utilities/i18n';
// import {
//   AppStackParamList,
//   RootStackParamList,
// } from '../../../../navigation/NavigationTypes';
import Navbar from '../../common/Navbar';
import ThemedStyles from '../../styles/ThemedStyles';
// import UserListItem from '../newRoom/components/MemberSelector/components/UserListItem';
import { NewRoomScreens } from '../newRoom/NewRoomScreen';
import { useRoomPermissions } from '../userInfo/UserInfo';
import MemberList from './components/MemberList';

// export type RoomMembersScreenRouteProp = RouteProp<
//   AppStackParamList & RootStackParamList,
//   'MessengerRoomMembersScreen'
// >;
// export type RoomMembersScreenNavigationProp = StackNavigationProp<
//   AppStackParamList & RootStackParamList,
//   'MessengerRoomMembersScreen'
// >;

interface RoomMembersScreenProps {
  route: any; // RoomMembersScreenRouteProp;
  navigation: any; // RoomMembersScreenNavigationProp;
}

/**
 * TODO: pagination, role management
 * */
const RoomMembersScreen = ({ route, navigation }: RoomMembersScreenProps) => {
  const { room } = route.params;
  const memberListRef = useRef<any>();
  const cli = useMemo(() => matrix.getClient(), []);
  const { canInvite } = useRoomPermissions(cli, room._matrixRoom, matrix.getMyUser()._matrixUser);
  // const theme = ThemedStyles.style;

  // const members: any = useObservableState(room.members$);
  // const invitedMembers: any = useObservableState(room.invitedMembers$);

  // const renderItem = useCallback(
  //   ({ item }) => {
  //     if (typeof item === 'string') {
  //       return (
  //         <View
  //           key={item}
  //           style={[
  //             theme.padding4x,
  //             theme.borderBottomHair,
  //             theme.borderPrimary,
  //           ]}>
  //           <Text style={[theme.fontXL, theme.colorSecondaryText]}>{item}</Text>
  //         </View>
  //       );
  //     }
  //
  //     let actionSheetRef;
  //
  //     return (
  //       <UserListItem
  //         key={item.id}
  //         item={item}
  //         icon={
  //           item.id !== matrix.getClient().credentials.userId && [
  //             <Icon
  //               name="ellipsis-vertical"
  //               size={25}
  //               color={ThemedStyles.getColor('secondary_text')}
  //               onPress={() => actionSheetRef.show()}
  //             />,
  //             <RoomMemberActionSheet // TODO: Does this hurt performance?
  //               // onBan={updateMembers}
  //               // onKick={updateMembers}
  //               room={room}
  //               roomMember={item}
  //               ref={(o) => (actionSheetRef = o)}
  //             />,
  //           ]
  //         }
  //       />
  //     );
  //   },
  //   [
  //     room,
  //     theme.borderBottomHair,
  //     theme.borderPrimary,
  //     theme.colorSecondaryText,
  //     theme.fontXL,
  //     theme.padding4x,
  //   ],
  // );

  const onAddMembers = useCallback(
    () =>
      // TODO: translate
      navigation.navigate('MessengerNewRoom', {
        title: 'Add Members',
        screen: NewRoomScreens.multiple,
        doneTitle: 'Invite',
        existingMembers: memberListRef.current.roomMembers().map((roomMember) => roomMember.userId),
        room,
      }),
    []
  );

  const addIconStyle = useMemo(
    () => ({
      right: 2,
      bottom: 1,
    }),
    []
  );

  return (
    <>
      <Navbar
        title={'Chat members'} // TODO: translate
        rightIcon={
          canInvite && (
            <TouchableOpacity activeOpacity={0.7} onPress={onAddMembers}>
              <Icon
                name="add"
                size={30}
                color={ThemedStyles.getColor('primary_text')}
                style={addIconStyle}
              />
            </TouchableOpacity>
          )
        }
      />

      <MemberList
        ref={(ref) => (memberListRef.current = ref)}
        roomId={room.id}
        navigation={navigation}
      />
    </>
  );
};

RoomMembersScreen.route = 'MessengerRoomMembersScreen';

export default RoomMembersScreen;
