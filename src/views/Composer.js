import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableHighlight } from 'react-native';
import { useObservableState } from 'observable-hooks';
import { colors } from '../constants';
import Icon from './components/Icon';
import externalService from '../services/external';
import messageService from '../services/message';

export default function Composer({
  room,
  isEditing = false,
  onEndEdit = () => {},
  selectedMessage = null,
  enableReplies = false,
  onCancelReply = () => {},
}) {
  const [value, setValue] = useState('');

  const textInputRef = useRef(null);

  const roomName = useObservableState(room.name$);

  const handleSend = () => {
    if (enableReplies && !isEditing && selectedMessage) {
      room.sendReply(selectedMessage, value);
      onCancelReply();
    } else {
      room.sendMessage(value, 'm.text');
    }
    setValue('');
  };

  const cancel = () => {
    setValue('');
    if (isEditing) {
      onEndEdit();
    } else {
      onCancelReply();
    }
  };

  const confirmEdit = () => {
    externalService.editMessage(room.id, selectedMessage.id, value);
    setValue('');
    textInputRef.current.blur();
    onEndEdit();
  };

  useEffect(() => {
    if (isEditing && selectedMessage) {
      setValue(selectedMessage.content$.getValue().text);
      textInputRef.current.focus();
    }
  }, [isEditing, selectedMessage]);

  if (!room) {
    return (
      <View style={styles.wrapper}>
        <Text style={{ marginLeft: 12 }}>No room specified.</Text>
      </View>
    );
  }

  console.log(selectedMessage);

  return (
    <View style={styles.wrapper}>
      {(isEditing || (!isEditing && selectedMessage && enableReplies)) && (
        <View style={styles.activeMessageBar}>
          <View>
            <Text style={{ color: 'dodgerblue', fontWeight: 'bold' }}>
              {isEditing ? 'Editing' : `Replying to ${selectedMessage.sender.name$.getValue()}`}
            </Text>
            <Text numberOfLines={1} style={{ color: 'gray' }}>
              {selectedMessage.content$?.getValue()?.text}
            </Text>
          </View>
          <TouchableHighlight
            onPress={cancel}
            underlayColor="#ddd"
            style={{ padding: 6, borderRadius: 50 }}>
            <View>
              <Icon name="close" color="gray" />
            </View>
          </TouchableHighlight>
        </View>
      )}
      <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
        {room.isEncrypted() && (
          <Icon name="lock" color="#888" style={{ marginVertical: 10, marginHorizontal: 4 }} />
        )}
        <TextInput
          ref={textInputRef}
          style={styles.input}
          multiline
          placeholder={`Message ${roomName}...`}
          value={value}
          onChangeText={setValue}
        />
        <TouchableHighlight
          disabled={value.length === 0}
          onPress={isEditing ? confirmEdit : handleSend}
          underlayColor="#ddd"
          style={styles.sendButton}>
          <Text style={[styles.sendText, value.length === 0 ? { color: '#888' } : {}]}>
            {isEditing ? 'Save' : 'Send'}
          </Text>
        </TouchableHighlight>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    minHeight: 45,
    borderTopWidth: 1,
    borderTopColor: colors.gray300,
    backgroundColor: colors.white,
    padding: 6,
  },
  activeMessageBar: {
    margin: 6,
    padding: 6,
    borderLeftWidth: 4,
    borderLeftColor: 'dodgerblue',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  input: {
    padding: 12,
    paddingLeft: 6,
    maxHeight: 200,
    flex: 1,
    fontSize: 14,
  },
  sendButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  sendText: {
    color: '#2d5bc4',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
