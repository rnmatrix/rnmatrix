import 'react-native-gesture-handler';
import 'node-libs-react-native/globals';
import '@rn-matrix/core/shim.js';

import {polyfillGlobal} from 'react-native/Libraries/Utilities/PolyfillFunctions';
polyfillGlobal('URL', () => require('whatwg-url').URL);

import {AppRegistry, LogBox} from 'react-native';
import {name as appName} from './app.json';
import App from './App';

LogBox.ignoreAllLogs()

AppRegistry.registerComponent(appName, () => App);
