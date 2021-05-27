import {createStackNavigator} from '@react-navigation/stack';

import rnm, {useMatrix} from '@rn-matrix/core';
import NewChatScreen from './scenes/newChat/NewChatScreen';
import ChatMenuScreen from './scenes/chatMenu/ChatMenuScreen';
// import {matrix} from '@rn-matrix/core';
import {ThemedStyles} from '@rn-matrix/ui';
import {
  AccessSecretStorageDialog,
  LoginScreen,
  NewRoomScreen,
  NewSessionReviewDialog,
  RolesScreen,
  RoomInfoScreen,
  RoomMembersScreen,
  RoomScreen,
  RoomsScreen,
  SetupEncryptionDialog,
  UserInfo,
  withNavigation,
} from '@rn-matrix/ui/scenes';
import {useObservableState} from 'observable-hooks';
import React, {useEffect, useState} from 'react';
import {ActivityIndicator, Pressable, Text, View} from 'react-native';
import ModalTransition from './ModalTransition';

// const debug = require('debug')('ditto:services:navigation:RootNavigator')

const Stack = createStackNavigator();

const withoutHeader = {
  headerShown: false,
};

const modalOptions = {
  headerShown: false,
  cardStyle: {backgroundColor: 'transparent'},
  // gestureEnabled: false,
  ...ModalTransition,
  gestureResponseDistance: {vertical: 240},
  gestureEnabled: true,
  cardOverlayEnabled: true,
};

export default function AppNavigator() {
  const {isLoaded, isLoggedIn, isReady} = useMatrix()

  const [loadingView, setLoadingView] = useState(false);

  console.log(
    'auth loaded',
    isLoaded,
    'logged in',
    isLoggedIn,
    'matrix ready ',
    isReady,
  );

  useEffect(() => {
    if (isLoaded && isLoggedIn && !isReady) {
      setTimeout(() => setLoadingView(true), 10000);
    }
  }, [isLoaded, isLoggedIn, isReady]);

  if (!isLoaded || (isLoggedIn && !isReady)) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" />
        {loadingView && (
          <>
            <Text style={{textAlign: 'center', maxWidth: 250, marginTop: 24}}>
              Logged in: {isLoggedIn ? 'YES\n' : 'NO\n'}
              Matrix ready: {isReady ? 'YES\n\n\n' : 'NO\n\n\n'}
              This seems to be taking a while... you can try logging out if you
              want.
            </Text>
            <Pressable
              onPress={() => {
                setLoadingView(false);
                rnm.logout();
              }}
              style={({pressed}) => ({
                backgroundColor: 'dodgerblue',
                marginTop: 24,
                borderRadius: 8,
                padding: 12,
                opacity: pressed ? 0.5 : 1,
              })}>
              <Text style={{color: '#fff', fontWeight: 'bold'}}>LOGOUT</Text>
            </Pressable>
          </>
        )}
      </View>
    );
  } else if (isLoggedIn) {
    return (
      <>
        <Stack.Navigator>
          <Stack.Screen
            name={RoomsScreen.route}
            component={withNavigation(RoomsScreen)}
            options={{
              title: '',
              headerLeft: () => (
                <Pressable
                  onPress={matrix.logout}
                  style={({pressed}) => [
                    {
                      marginLeft: 6,
                      padding: 12,
                      borderRadius: 8,
                    },
                    ThemedStyles.style.backgroundSecondary,
                  ]}>
                  <Text style={{fontWeight: 'bold', color: 'darkred'}}>
                    LOGOUT
                  </Text>
                </Pressable>
              ),
            }}
          />
          <Stack.Screen
            name={RolesScreen.route}
            component={withNavigation(RolesScreen)}
            options={withoutHeader}
          />
          <Stack.Screen
            name={RoomInfoScreen.route}
            component={withNavigation(RoomInfoScreen)}
            options={withoutHeader}
          />
          <Stack.Screen
            name={RoomMembersScreen.route}
            component={withNavigation(RoomMembersScreen)}
            options={withoutHeader}
          />
          <Stack.Screen
            name={RoomScreen.route}
            component={withNavigation(RoomScreen)}
            options={withoutHeader}
          />
          <Stack.Screen
            name={UserInfo.route}
            component={withNavigation(UserInfo)}
            options={withoutHeader}
          />

          <Stack.Screen
            name={NewRoomScreen.route}
            component={withNavigation(NewRoomScreen)}
            options={modalOptions}
          />
          <Stack.Screen
            name={NewSessionReviewDialog.route}
            component={withNavigation(NewSessionReviewDialog)}
            options={modalOptions}
          />
          <Stack.Screen
            name={SetupEncryptionDialog.route}
            component={withNavigation(SetupEncryptionDialog)}
            options={modalOptions}
          />
          <Stack.Screen
            name={AccessSecretStorageDialog.route}
            component={withNavigation(AccessSecretStorageDialog)}
            options={modalOptions}
          />
        </Stack.Navigator>
      </>
    );
  } else {
    return (
      <Stack.Navigator headerMode="none">
        {/* <Stack.Screen name='Landing' component={LandingScreen} /> */}
        <Stack.Screen
          name={LoginScreen.route}
          component={withNavigation(LoginScreen)}
          options={withoutHeader}
        />
      </Stack.Navigator>
    );
  }
}
