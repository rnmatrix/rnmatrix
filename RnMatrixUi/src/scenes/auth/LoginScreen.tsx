import rnm, { matrix } from '@rn-matrix/core';
import React, { useCallback } from 'react';
import { Platform, SafeAreaView, ScrollView } from 'react-native';
import LoginForm from '../../components/LoginForm';
import Config from '../../Config';
import ThemedStyles from '../../styles/ThemedStyles';

export default function LoginScreen() {
  const onLogin = useCallback(
    async ({ username, password, homeserver, initCrypto }) => 
    rnm.loginWithPassword(
        username,
        password,
        homeserver,
        initCrypto,
        `${Config.brand} ${Platform.select({
          ios: '(iOS)',
          android: '(Android)',
        })}`
      ),
    []
  );

  return (
    <SafeAreaView style={[ThemedStyles.style.flexContainer, ThemedStyles.style.backgroundPrimary]}>
      <ScrollView
        contentContainerStyle={{ flex: 1, alignItems: 'center' }}
        keyboardShouldPersistTaps="handled">
        <LoginForm onLogin={onLogin} />
      </ScrollView>
    </SafeAreaView>
  );
}

LoginScreen.route = 'LoginScreen';
