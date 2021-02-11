import React from 'react';
import { Text, View } from 'react-native';
import {
  textForHistoryVisibilityEvent,
  textForPowerEvent,
  textForRoomNameEvent,
} from '../../../matrix-react/TextForEvent';
import EventTypes from '../../../types/EventTypes';

export default function EventMessage({ event }) {
  const renderContent = () => {
    switch (event.getType()) {
      case EventTypes.roomHistoryVisibility:
        return textForHistoryVisibilityEvent(event);
      case EventTypes.roomPowerLevels:
        return textForPowerEvent(event);
      case EventTypes.roomName:
        return textForRoomNameEvent(event);
      default:
        return event.getType();
    }
  };

  const message = renderContent();
  return message.length > 0 ? (
    <View
      style={{
        maxWidth: '75%',
        alignSelf: 'center',
        paddingVertical: 8,
        paddingHorizontal: 18,
        backgroundColor: '#888',
        borderRadius: 24,
        marginVertical: 10,
      }}>
      <Text style={{ textAlign: 'center', fontWeight: '600', color: '#fff' }}>{message}</Text>
    </View>
  ) : null;
}
