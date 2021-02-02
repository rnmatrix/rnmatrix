import { matrix } from '@rn-matrix/core';
import { useObservableState } from 'observable-hooks';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableHighlight,
  TouchableOpacity,
  View,
} from 'react-native';
import IonIcons from 'react-native-vector-icons/Ionicons';
import i18n from '../../../../../../utilities/i18n';
import ThemedStyles from '../../../../../../styles/ThemedStyles';
import Icon from '../../../../../../common/Icon';
import AttachmentAction from './components/AttachmentAction';

const t = (s, options?) => i18n.t(`composer:${s}`, options);

export default function Composer({
  room,
  isEditing = false,
  isReplying = false,
  onEndEdit = () => {},
  selectedMessage,
  enableReplies = false,
  onCancelReply = () => {},
  composerStyle = {},
  accentColor = 'crimson',
}) {
  const theme = ThemedStyles.style;
  const [value, setValue] = useState('');
  const textInputRef = useRef<TextInput>(null);

  const handleSend = useCallback(() => {
    if (enableReplies && isReplying && selectedMessage && !isEditing) {
      room.sendReply(selectedMessage, value);
      onCancelReply();
    } else {
      room.sendMessage(value, 'm.text');
    }
    setValue('');
  }, [
    onCancelReply,
    enableReplies,
    isReplying,
    selectedMessage,
    isEditing,
    room,
    value,
  ]);

  const cancel = useCallback(() => {
    setValue('');
    if (isEditing) {
      onEndEdit();
    } else {
      onCancelReply();
    }
  }, [isEditing, onEndEdit, onCancelReply]);

  const confirmEdit = useCallback(() => {
    if (!selectedMessage) {
      return;
    }
    matrix.send(value, 'm.edit', room.id, selectedMessage.id);
    setValue('');
    textInputRef.current!.blur();
    onEndEdit();
  }, [selectedMessage, value, room, textInputRef, onEndEdit]);

  useEffect(() => {
    if (isEditing && selectedMessage) {
      setValue(selectedMessage.content$.getValue().text);
      textInputRef.current!.focus();
    }
  }, [isEditing, selectedMessage]);

  const wrapperStyles = useMemo(
    () => [
      theme.backgroundPrimary,
      theme.borderTopHair,
      theme.borderPrimary,
      theme.paddingHorizontal2x,
    ],
    [],
  );

  if (!room) {
    return (
      <View style={[styles.wrapper, wrapperStyles]}>
        <Text style={theme.marginLeft3x}>{t('noRoomSpecified')}</Text>
      </View>
    );
  }

  // TODO: despaghettize
  return (
    <View style={[styles.wrapper, wrapperStyles, composerStyle]}>
      {selectedMessage &&
        ((isEditing && !isReplying) ||
          (!isEditing && isReplying && enableReplies)) && (
          <View
            style={[styles.activeMessageBar, { borderLeftColor: accentColor }]}>
            <View>
              <Text style={[{ color: accentColor }, theme.bold]}>
                {isEditing
                  ? t('editing')
                  : t('replyingTo', {
                      user: selectedMessage.sender.name$.getValue(),
                    })}
              </Text>
              <Text
                numberOfLines={1}
                style={[theme.colorTertiaryText, { maxWidth: '93%' }]}>
                {selectedMessage.content$?.getValue()?.text}
              </Text>
            </View>
            <TouchableOpacity onPress={cancel} style={styles.cancelButton}>
              <View>
                <Icon name="close" color="gray" />
              </View>
            </TouchableOpacity>
          </View>
        )}
      <View style={[theme.rowJustifyStart, theme.alignCenter]}>
        <TextInput
          ref={textInputRef}
          style={[styles.input, theme.colorPrimaryText]}
          multiline
          placeholder={t('message')}
          placeholderTextColor={ThemedStyles.getColor('secondary_text')}
          value={value}
          onChangeText={setValue}
        />

        {value.length === 0 ? (
          <AttachmentAction room={room} />
        ) : (
          <SendButton
            onPress={isEditing ? confirmEdit : handleSend}
            isEditing={isEditing}
            accentColor={accentColor}
            disabled={value.length === 0}
          />
        )}
      </View>
    </View>
  );
}

const SendButton = ({ disabled, onPress, isEditing, accentColor }) => {
  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={onPress}
      style={styles.sendButton}>
      {isEditing ? (
        <Text
          style={[
            styles.sendText,
            disabled ? styles.disabledColor : { color: accentColor },
          ]}>
          Save
        </Text>
      ) : (
        <IonIcons name="send" size={25} color={ThemedStyles.getColor('link')} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cancelButton: { flexDirection: 'row', alignItems: 'center' },
  disabledColor: { color: '#888' },
  wrapper: {
    minHeight: 45,
    borderTopWidth: 1,
    paddingLeft: 16,
  },
  activeMessageBar: {
    margin: 6,
    padding: 6,
    borderLeftWidth: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  input: {
    maxHeight: 200,
    flex: 1,
    fontSize: 16,
    paddingVertical: 16,
  },
  sendButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  actionButton: {
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  sendText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
});
