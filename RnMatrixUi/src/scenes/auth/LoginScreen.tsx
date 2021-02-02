import { matrix } from '@rn-matrix/core';
import React, { useCallback } from 'react';
import { SafeAreaView, ScrollView } from 'react-native';
import LoginForm from '../../components/LoginForm';

export default function LoginScreen() {
  const onLogin = useCallback(
    async ({ username, password, homeserver, initCrypto }) =>
      matrix.loginWithPassword(username, password, homeserver, initCrypto),
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
