import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import Spinner from '../../../common/Spinner';
import ThemedStyles from '../../../styles/ThemedStyles';
import debounce from '../../../utilities/debounce';

const t = (k) => k; // TODO: translate

const RoomName = ({ room, name: _name, canEdit }) => {
  const theme = ThemedStyles.style;

  const [name, setName] = useState(String(_name));
  const [loading, setLoading] = useState(false);
  const changeRoomName = useCallback(
    debounce(async (value: string) => {
      setLoading(true);
      await room.setName(value);
      setLoading(false);
    }, 2500),
    [],
  );
  const onNameChange = useCallback(
    (newName: string) => {
      setName(newName);
      // @ts-ignore
      changeRoomName(newName);
    },
    [changeRoomName],
  );

  return (
    <>
      <View style={[theme.justifyCenter, theme.marginTop8x]}>
        {canEdit ? (
          <>
            <Text
              style={[
                theme.paddingVertical,
                theme.fontL,
                theme.colorSecondaryText,
              ]}>
              {t('Room name')}
            </Text>
            <TextInput
              value={name}
              onChangeText={onNameChange}
              style={[
                theme.input,
                theme.backgroundSecondary,
                theme.fontL,
                theme.padding2x,
              ]}
            />
          </>
        ) : (
          <Text style={[theme.fontXL, theme.textCenter, theme.padding]}>
            {name}
          </Text>
        )}

        {loading && <Spinner style={styles.nameSpinner} />}
      </View>
    </>
  );
};

export default RoomName;

const styles = StyleSheet.create({
  nameSpinner: { position: 'absolute', right: 16 },
  avatarContainer: {
    flex: 1,
  },
});
