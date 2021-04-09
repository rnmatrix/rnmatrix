import NetInfo from '@react-native-community/netinfo'
import { randomBytes } from 'react-native-randombytes';
import { polyfillGlobal } from 'react-native/Libraries/Utilities/PolyfillFunctions';

let unsubscribeNetInfoListener

if (typeof window === 'object') {
  window.addEventListener = (type, listener, options) => {
    if (type === 'online') {
      unsubscribeNetInfoListener = NetInfo.addEventListener(state => state.isConnected && listener())
    }

    // nil
  }
  window.removeEventListener = (type, listener, options) => {
    if (type === 'online') {
      if (unsubscribeNetInfoListener) {
        unsubscribeNetInfoListener()
      }
    }

    // nil
  }

  // implement window.getRandomValues(), for packages that rely on it
  if (!window.crypto) window.crypto = {};
  if (!window.crypto.getRandomValues) {
    window.crypto.getRandomValues = function getRandomValues(arr) {
      let orig = arr;
      if (arr.byteLength != arr.length) {
        // Get access to the underlying raw bytes
        arr = new Uint8Array(arr.buffer);
      }
      const bytes = randomBytes(arr.length);
      for (var i = 0; i < bytes.length; i++) {
        arr[i] = bytes[i];
      }

      return orig;
    };
  }
}

// Needed so that 'stream-http' chooses the right default protocol.
global.location = {
  protocol: 'file:',
  href: '',
};

// TODO: is it ok to put this here?
polyfillGlobal('URL', () => require('whatwg-url').URL);
