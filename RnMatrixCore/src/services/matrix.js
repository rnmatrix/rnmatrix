import AsyncStorage from '@react-native-community/async-storage';

import { verificationMethods } from 'matrix-js-sdk/src/crypto';
import DeviceListener from '../react-sdk-utils/DeviceListener';
import { SetupEncryptionStore } from '../react-sdk-utils/stores/SetupEncryptionStore';
import { BehaviorSubject } from 'rxjs';
import request from 'xmlhttp-request';
import { crossSigningCallbacks } from '../react-sdk-utils/SecurityManager';
import AsyncCryptoStore from '../storage/AsyncCryptoStore';
import i18n from '../utilities/i18n';
import { toImageBuffer } from '../utilities/misc';
import '../utilities/poly';
import matrixSdk, { AutoDiscovery, MemoryStore } from 'matrix-js-sdk';
import { setCrypto } from 'matrix-js-sdk/lib/utils';

const E2E_PREFIX = 'crypto.';
const KEY_END_TO_END_TRUSTED_BACKUP_PUBKEY = E2E_PREFIX + 'trusted_backup_pubkey';

const debug = require('debug')('rnm:matrix.js');
// We need to put matrix logs to silent otherwise it throws exceptions we can't
// catch
// const logger = loglevel.getLogger('matrix');
// logger.setLevel('silent');
// import Olm from 'olm/olm_legacy'
import Olm from 'react-native-olm';

global.Olm = Olm;
/**
 * FIXME: this is temporary until we find a better place to call this.
 * Set request object of matrix js sdk before anything else.
 *
 * */
matrixSdk.request(request);
setCrypto(require('react-native-crypto'));

const MATRIX_CLIENT_START_OPTIONS = {
  initialSyncLimit: 6,
  request: request,
  lazyLoadMembers: true,
  pendingEventOrdering: 'detached',
  timelineSupport: true,
  unstableClientRelationAggregation: true,
  store: new MemoryStore({
    localStorage: AsyncStorage,
  }),
  cryptoStore: new AsyncCryptoStore(AsyncStorage),
  sessionStore: {
    setLocalTrustedBackupPubKey: function (pubkey) {
      return AsyncStorage.setItem(KEY_END_TO_END_TRUSTED_BACKUP_PUBKEY, pubkey);
    },
    getLocalTrustedBackupPubKey: function () {
      return AsyncStorage.getItem(KEY_END_TO_END_TRUSTED_BACKUP_PUBKEY);
    },
  }, // js-sdk complains if this isn't supplied but it's only used for remembering a local trusted backup key
  cryptoCallbacks: crossSigningCallbacks,
  verificationMethods: [verificationMethods.SAS],
};

class MatrixService {
  _client;
  _started;

  constructor(props) {
    this._client = null;
    this._started = false;
    this._isReady$ = new BehaviorSubject(false);
    this._isSynced$ = new BehaviorSubject(false);
    this._error$ = new BehaviorSubject(null);
  }

  // ********************************************************************************
  // Data
  // ********************************************************************************
  getClient() {
    if (!this._client) {
      // throw Error('getClient: No matrix client');
      console.warn('getClient: No matrix client');
      return null;
    }
    return this._client;
  }

  getError$() {
    return this._error$;
  }

  hasClient() {
    return !!this._client;
  }

  isReady$() {
    return this._isReady$;
  }

  isSynced$() {
    return this._isSynced$;
  }

  // ********************************************************************************
  // Actions
  // ********************************************************************************
  async createClient(baseUrl, accessToken = null, userId = null, deviceId = null) {
    debug('createClient', baseUrl, accessToken?.slice(0, 10), userId, deviceId);
    if (this._client && !deviceId) {
      if (this._client.baseUrl === baseUrl && this._client.getAccessToken() === accessToken) {
        debug('Client exists already, ignoring…');
        return this._client;
      }
      this.stop();
    } else {
      this._client = matrixSdk.createClient({
        baseUrl,
        accessToken,
        userId,
        deviceId,
        ...MATRIX_CLIENT_START_OPTIONS,
      });
      debug('Client created: ', this._client);
      return this._client;
    }
  }

  async start(useCrypto = false) {
    if (!this._client) {
      debug('start: no client created.');
      return null;
    }
    if (this._started) {
      debug('start: already started.');
      return null;
    }

    this._client.on('sync', this._onSyncEvent.bind(this));
    if (useCrypto) {
      await global.Olm.init();
      await this._client.initCrypto();
    }
    await this._client.startClient(MATRIX_CLIENT_START_OPTIONS);

    if (useCrypto) {
      this._client.setGlobalErrorOnUnknownDevices(false);
    }

    DeviceListener.makeShared().start();
    SetupEncryptionStore.makeShared().start();

    this._started = true;
    debug('Matrix client started');
  }

  stop() {
    if (!this._client) {
      debug('stop: no client.');
      return null;
    }

    if (this._started) {
      this._client.removeAllListeners();
      this._client.stopClient();
    }

    delete this._client;
    this._started = false;
  }

  _onSyncEvent(state, prevState, data) {
    switch (state) {
      case 'PREPARED':
        if (data.fromCache) {
          debug('Matrix client data loaded from storage');
          this._isReady$.next(true);
        } else {
          debug('Matrix client synced with homeserver');
          if (prevState === 'ERROR') this._error$.next(null);
          if (!this._isReady$.getValue()) this._isReady$.next(true);
          this._isSynced$.next(true);
        }
        break;
      case 'SYNCING':
        if (prevState === 'ERROR' || prevState === 'CATCHUP') {
          this._isSynced$.next(true);
          this._error$.next(null);
        }
        break;
      case 'ERROR':
        debug('A syncing error ocurred:', { state, prevState, data });
        console.warn('A syncing error ocurred:', { state, prevState, data });
        this._isSynced$.next(false);
        this._error$.next(data);
        break;
      default:
    }
  }

  // ********************************************************************************
  // Helpers
  // ********************************************************************************
  async getHomeserverData(domain) {
    const clientConfig = await AutoDiscovery.findClientConfig(domain);
    const config = clientConfig['m.homeserver'];
    if (config.state !== AutoDiscovery.SUCCESS) {
      debug('AutoDiscovery error', config);
      return {
        error: 'INVALID_HOMESERVER',
        message: i18n.t('auth:login.invalidHomeserverError'),
      };
    }
    return {
      domain,
      baseUrl: config.base_url,
    };
  }

  getImageUrl(mxcUrl, width, height, resizeMethod = 'scale') {
    if (!this._client) {
      throw Error('getImageUrl: No matrix client');
    }

    if (width == null && height == null) {
      return this._client.mxcUrlToHttp(mxcUrl);
    } else {
      return this._client.mxcUrlToHttp(mxcUrl, width, height, resizeMethod);
    }
  }

  getHttpUrl(mxcUrl, width = null, height = null, resizeMethod = 'scale') {
    if (!this._client) {
      throw Error('getHttpUrl: No matrix client');
    }

    if (width === null && height === null) {
      return this._client.mxcUrlToHttp(mxcUrl);
    } else {
      return this._client.mxcUrlToHttp(mxcUrl, width, height, resizeMethod);
    }
  }

  isRoomDirect(roomId) {
    if (!this._client) {
      throw Error('isRoomDirect: No matrix client');
    }

    const directEvent = this._client.getAccountData('m.direct');
    const directRooms = directEvent ? Object.keys(directEvent.getContent()) : [];
    if (directRooms.includes(roomId)) return true;

    const room = this._client.getRoom(roomId);
    if (room.getJoinedMemberCount() <= 2) return true;
    return false;
  }

  async uploadImage(image, opts) {
    try {
      return this._client.uploadContent(toImageBuffer(image.data), {
        onlyContentUri: true,
        name: image.fileName,
        type: image.type,
        ...opts,
      });
    } catch (e) {
      debug('Error uploading image:', e);
      return null;
    }
  }

  async uploadContent(file) {
    try {
      const url = await this._client.uploadContent(file);
      return url;
    } catch (e) {
      debug('Error uploading file:', e);
      return null;
    }
  }
}

const matrix = new MatrixService();
export default matrix;
