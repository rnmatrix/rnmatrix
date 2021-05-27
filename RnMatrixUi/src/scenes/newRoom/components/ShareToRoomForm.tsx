import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';
import { Text, TextInput, View } from 'react-native';
import ThemedStyles from '../../../styles/ThemedStyles';
import i18n from '../../../utilities/i18n';
import MembersBar from './MemberSelector/components/MembersBar';

const t = (s) => i18n.t(`newRoom:shareToRoom.${s}`);

const ShareToRoomForm = ({ onDetailsChange, selectedMembers }, ref) => {
  const theme = ThemedStyles.style;
  const [message, setMessage] = useState('');

  useEffect(
    () =>
      onDetailsChange({
        message,
      }),
    [message, onDetailsChange],
  );

  useImperativeHandle(
    ref,
    () => ({
      getMessage: () => message,
    }),
    [message],
  );

  const labelStyle = [
    theme.fontL,
    theme.colorTertiaryText,
    theme.marginBottom2x,
  ];

  const textInputStyle = useMemo(
    () => [theme.input, theme.padding2x, theme.backgroundSecondary],
    [],
  );

  return (
    <View style={[theme.paddingTop4x, theme.paddingHorizontal4x]}>
      <Text style={labelStyle}>{t(`message`)}</Text>
      <TextInput
        value={message}
        onChangeText={setMessage}
        placeholderTextColor={ThemedStyles.getColor('tertiary_text')}
        multiline
        numberOfLines={3}
        style={textInputStyle}
      />

      <MembersBar members={selectedMembers} />
    </View>
  );
};

export default forwardRef(ShareToRoomForm);
