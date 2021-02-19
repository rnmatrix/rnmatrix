import React from 'react';

import {NavigationContainer} from '@react-navigation/native';
import AppNavigator from './src/AppNavigator';
import rnm from '@rn-matrix/core';

const debug = require('debug');
debug.enable('*');

rnm.initAuth();

export default function App() {
  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}
