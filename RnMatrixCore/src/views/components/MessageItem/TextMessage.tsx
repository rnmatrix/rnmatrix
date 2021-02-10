import React from 'react'
import { Text, View } from 'react-native'

export default function TextMessage({event, isMe}) {
  return (
    <View style={{paddingVertical: 12, paddingHorizontal: 14, borderRadius: 24, backgroundColor: isMe ? 'dodgerblue' : '#ddd', maxWidth: '85%'}}>
      <Text style={{color: isMe ? '#fff' : '#000', fontWeight: '600', fontSize: 16}}>{event.getContent().body}</Text>
    </View>
  )
}