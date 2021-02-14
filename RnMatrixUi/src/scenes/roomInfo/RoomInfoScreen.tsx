// import { RouteProp } from '@react-navigation/native';
// import { StackNavigationProp } from '@react-navigation/stack';
import { matrix } from '@rn-matrix/core';
import { useObservableState } from 'observable-hooks';
import React, { useMemo } from 'react';
import { ScrollView, View } from 'react-native';
import MenuItem from '../../common/MenuItem';
import Navbar from '../../common/Navbar';
// import { AppStackParamList } from '../../../../navigation/NavigationTypes';
import ThemedStyles from '../../styles/ThemedStyles';
import { useRoomPermissions } from '../userInfo/UserInfo';
import LeaveRoomButton from './components/LeaveRoomButton';
import RoomAvatar from '../../common/RoomAvatar';
import RoomMembersButton from './components/RoomMembersButton';
import RoomName from './components/RoomName';

// export type RoomInfoScreenRouteProp = RouteProp<
//   AppStackParamList,
//   'MessengerRoomInfoScreen'
// >;
// export type RoomInfoScreenNavigationProp = StackNavigationProp<
//   AppStackParamList,
//   'MessengerRoomInfoScreen'
// >;

interface RoomInfoScreenProps {
  room: any;
  route: any; // RoomInfoScreenRouteProp;
  navigation: any; // RoomInfoScreenNavigationProp;
}

const RoomInfoScreen = ({ route, navigation }: RoomInfoScreenProps) => {
  const { room } = route.params;
  const theme = ThemedStyles.style;
  const name = useObservableState<string>(room.name$);
  const cli = useMemo(() => matrix.getClient(), []);
  const { canEdit } = useRoomPermissions(cli, room._matrixRoom, matrix.getMyUser()._matrixUser);

  return (
    <>
      <Navbar title={name} />
      <ScrollView style={[theme.flexContainer]} keyboardDismissMode={'on-drag'}>
        <View style={theme.padding4x}>
          <RoomAvatar canEdit={canEdit} room={room} />
          {!!name && <RoomName canEdit={canEdit} room={room} name={name} />}
        </View>

        <RoomMembersButton room={room} />

        <MenuItem
          item={{
            title: 'Roles and Permissions', // TODO: translate
            onPress: () => navigation.navigate('MessengerRolesScreen', { roomId: room.id }),
          }}
        />

        <View style={theme.marginVertical2x} />

        <LeaveRoomButton room={room} />
      </ScrollView>
    </>
  );
};

RoomInfoScreen.route = 'MessengerRoomInfoScreen';

export default RoomInfoScreen;
