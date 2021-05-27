import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import Switch from 'react-native-switch-pro';
import ThemedStyles from '../../../styles/ThemedStyles';
import i18n from '../../../utilities/i18n';

const t = (s) => i18n.t(`newRoom:details.${s}`);

export default function RoomDetailsForm({ onDetailsChange }) {
  const theme = ThemedStyles.style;
  const [isPrivate, setIsPrivate] = useState(true);
  const [roomName, setRoomName] = useState('');
  const [roomTopic, setRoomTopic] = useState('');

  useEffect(
    () =>
      onDetailsChange({
        visibility: isPrivate ? 'private' : 'public',
        name: roomName,
        room_topic: roomTopic,
      }),
    [isPrivate, roomName, roomTopic, onDetailsChange],
  );

  const labelStyle = [
    theme.fontL,
    theme.colorTertiaryText,
    theme.marginBottom2x,
  ];

  const toggleRoomPrivacy = useCallback(() => setIsPrivate(!isPrivate), [
    isPrivate,
  ]);

  const textInputStyle = useMemo(
    () => [
      theme.input,
      theme.padding2x,
      theme.marginBottom4x,
      theme.backgroundSecondary,
    ],
    [],
  );

  return (
    <View style={[theme.paddingTop4x, theme.paddingHorizontal4x]}>
      <Text style={labelStyle}>{t('roomTitle')}</Text>
      <TextInput
        value={roomName}
        onChangeText={setRoomName}
        placeholder={t('roomNameInputPlaceholder')}
        placeholderTextColor={ThemedStyles.getColor('tertiary_text')}
        style={textInputStyle}
      />

      <Text style={labelStyle}>{t('topicTitle')}</Text>
      <TextInput
        value={roomTopic}
        onChangeText={setRoomTopic}
        placeholder={t('topicInputPlaceholder')}
        placeholderTextColor={ThemedStyles.getColor('tertiary_text')}
        multiline
        numberOfLines={4}
        style={textInputStyle}
      />

      <View style={[theme.padding]}>
        <View style={styles.row}>
          <Text style={[theme.fontL]}>{t('privateTitle')}</Text>
          <Switch
            value={isPrivate}
            backgroundInactive={theme.backgroundSecondary.backgroundColor}
            onSyncPress={toggleRoomPrivacy}
          />
        </View>
        <Text style={[theme.colorSecondaryText, theme.fontM]}>
          {t('privateDescription')}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
});
