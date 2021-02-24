import AsyncStorage from '@react-native-community/async-storage';
import '@rn-matrix/core/shim.js';
import 'node-libs-react-native/globals';
import {AppRegistry} from 'react-native';
import 'react-native-gesture-handler'; // fix ongesture handler error
import {polyfillGlobal} from 'react-native/Libraries/Utilities/PolyfillFunctions';
import App from './App';
import {name as appName} from './app.json';
import './global';

polyfillGlobal('URL', () => require('whatwg-url').URL);

console.disableYellowBox = true;


AppRegistry.registerComponent(appName, () => App)
