import '@rn-matrix/core/shim.js';

import {polyfillGlobal} from 'react-native/Libraries/Utilities/PolyfillFunctions';
polyfillGlobal('URL', () => require('whatwg-url').URL);

import {AppRegistry, LogBox} from 'react-native';
import {name as appName} from './app.json';
// import 'node-libs-react-native/globals';
import {AppRegistry} from 'react-native';
import 'react-native-gesture-handler'; // fix ongesture handler error
// import {polyfillGlobal} from 'react-native/Libraries/Utilities/PolyfillFunctions';
import App from './App';
// import {name as appName} from './app.json';
import './global';



LogBox.ignoreAllLogs()


AppRegistry.registerComponent(appName, () => App)
