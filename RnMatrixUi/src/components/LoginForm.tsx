import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput } from 'react-native';

export default function LoginForm({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [homeserver, setHomeserver] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUsernameChange = (text) => {
    // if (text.charAt(0) === '@') {
    //   const domain = `https://matrix.${text.slice(text.lastIndexOf(':') + 1)}`;
    //   setHomeserver(domain);
    // }
    setUsername(text);
  };

  const _onLogin = useCallback(async () => {
    setError(null);
    setLoading(true);
    const result = await onLogin({
      username,
      password,
      homeserver,
      initCrypto: true,
    });
    setLoading(false);

    if (result.error) {
      console.log('Error logging in: ', result);
      setError(result.message);
    }
  }, [onLogin, username, password, homeserver]);

  return (
    <>
      <Text style={styles.label}>Username or MXID</Text>
      <TextInput
        autoFocus
        autoCapitalize="none"
        autoCorrect={false}
        style={styles.input}
        placeholder="Username or MXID"
        value={username}
        onChangeText={handleUsernameChange}
      />
      <Text style={styles.label}>Password</Text>
      <TextInput
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
      />
      <Text style={styles.label}>Homeserver (defaults to matrix.org)</Text>
      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        style={styles.input}
        placeholder="e.g. matrix.org"
        value={homeserver}
        onChangeText={setHomeserver}
        onSubmitEditing={_onLogin}
      />
      {error && (
        <Text
          style={{
            marginTop: 24,
            color: 'red',
            textAlign: 'center',
            width: '70%',
          }}>
          {error}
        </Text>
      )}
      <Pressable
        onPress={_onLogin}
        disabled={loading}
        style={({ pressed }) => [
          styles.input,
          styles.button,
          { opacity: pressed || loading ? 0.5 : 1 },
        ]}>
        <Text style={styles.buttonText}>{loading ? 'LOADING...' : 'LOGIN'}</Text>
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.8,
    color: 'dodgerblue',
    marginTop: 24,
    alignSelf: 'flex-start',
    marginLeft: 24,
    marginBottom: 6,
  },
  input: {
    marginHorizontal: 24,
    height: 60,
    paddingHorizontal: 18,
    width: '90%',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'dodgerblue',
    fontSize: 16,
  },
  button: {
    marginTop: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'dodgerblue',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
