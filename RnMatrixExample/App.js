import React from 'react';
import {Text} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import AppNavigator from './src/AppNavigator';
import {matrix} from '@rn-matrix/core';
import initUI, {ThemedStyles} from '@rn-matrix/ui';

const debug = require('debug');
debug.enable('rnm:*');

matrix.initAuth();
initUI({
  theme: 'dark',
  brand: 'RnMatrix',
});

let oldRender = Text.render;
Text.render = function (...args) {
  let origin = oldRender.call(this, ...args);
  return React.cloneElement(origin, {
    style: [
      ThemedStyles.style.colorPrimaryText,
      // { fontFamily: 'Roboto' },
      origin.props.style,
    ],
  });
};

export default function App() {
  return (
    <SafeAreaView style={ThemedStyles.style.flexContainer}>
      <NavigationContainer theme={ThemedStyles.navTheme}>
        <AppNavigator />
      </NavigationContainer>
    </SafeAreaView>
  );
}
