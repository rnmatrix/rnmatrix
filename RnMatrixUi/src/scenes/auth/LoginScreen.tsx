import { matrix } from '@rn-matrix/core';
import React, { useCallback } from 'react';
import { Platform, SafeAreaView, ScrollView } from 'react-native';
import LoginForm from '../../components/LoginForm';

export default function LoginScreen() {
  const onLogin = useCallback(
    async ({ username, password, homeserver, initCrypto }) =>
      matrix.loginWithPassword(
        username,
        password,
        homeserver,
        initCrypto,
        `Minds ${Platform.select({
          ios: '(iOS)',
          android: '(Android)',
        })}`
      ),
    []
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ flex: 1, alignItems: 'center' }}
        keyboardShouldPersistTaps="handled">
        <LoginForm onLogin={onLogin} />
      </ScrollView>
    </SafeAreaView>
  );
}
