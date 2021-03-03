import React from 'react';
import { Dimensions, Text, Image } from 'react-native';
import rnm from '@rn-matrix/core'

export default function ImageMessage({ event }) {
  const content = event.getContent();
  const { w, h } = content.info;
  const ratio = w / h; // ratio * h === w
  const width = ratio * Dimensions.get('screen').width * 0.45;
  const height = width / ratio;

  const imageStyles = {
    width,
    height,
    backgroundColor: '#ccc',
    borderRadius: 20,
  };

  return (
    <Image
      style={imageStyles}
      source={{
        uri: rnm.getHttpUrl(content.url),
      }}
    />
  );
}
