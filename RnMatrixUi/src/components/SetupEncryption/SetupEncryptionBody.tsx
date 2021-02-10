/*
Copyright 2020 The Matrix.org Foundation C.I.C.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import {
  PHASE_BUSY,
  PHASE_CONFIRM_SKIP,
  PHASE_DONE,
  PHASE_FINISHED,
  PHASE_INTRO,
  SetupEncryptionStore,
} from '@rn-matrix/core/src/react-sdk-utils/stores/SetupEncryptionStore';
import PropTypes from 'prop-types';
import React from 'react';
import { Text, View } from 'react-native';
import Button from '../../common/Button';
import Spinner from '../../common/Spinner';

// TODO: translate
const _t = (s, obj?) => {
  if (!obj) return s;

  return s.replace(/(\{\{)(.*?)(\}\})/gm, Object.values(obj)[0]);
};

function keyHasPassphrase(keyInfo) {
  return keyInfo.passphrase && keyInfo.passphrase.salt && keyInfo.passphrase.iterations;
}

type SetupEncryptionBodyProps = {
  onFinished: any; // FIXME
};

type SetupEncryptionBodyState = {
  phase: any; // FIXME
  verificationRequest: any; // FIXME
  backupInfo: any; // FIXME
};

export default class SetupEncryptionBody extends React.Component<
  SetupEncryptionBodyProps,
  SetupEncryptionBodyState
> {
  static propTypes = {
    onFinished: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    const store = SetupEncryptionStore.sharedInstance();
    store.on('update', this._onStoreUpdate);
    store.start();
    this.state = {
      phase: store.phase,
      // this serves dual purpose as the object for the request logic and
      // the presence of it indicating that we're in 'verify mode'.
      // Because of the latter, it lives in the state.
      verificationRequest: store.verificationRequest,
      backupInfo: store.backupInfo,
    };
  }

  _onStoreUpdate = () => {
    const store = SetupEncryptionStore.sharedInstance();
    if (store.phase === PHASE_FINISHED) {
      this.props.onFinished();
      return;
    }
    this.setState({
      phase: store.phase,
      verificationRequest: store.verificationRequest,
      backupInfo: store.backupInfo,
    });
  };

  componentWillUnmount() {
    const store = SetupEncryptionStore.sharedInstance();
    store.off('update', this._onStoreUpdate);
    store.stop();
  }

  _onUsePassphraseClick = async () => {
    console.log('_onUsePassphraseClick')
    const store = SetupEncryptionStore.sharedInstance();
    console.log('store', store)
    store.usePassPhrase();
  };

  onSkipClick = () => {
    const store = SetupEncryptionStore.sharedInstance();
    store.skip();
  };

  onSkipConfirmClick = () => {
    const store = SetupEncryptionStore.sharedInstance();
    store.skipConfirm();
  };

  onSkipBackClick = () => {
    const store = SetupEncryptionStore.sharedInstance();
    store.returnAfterSkip();
  };

  onDoneClick = () => {
    const store = SetupEncryptionStore.sharedInstance();
    store.done();
  };

  render() {
    const { phase } = this.state;

    if (this.state.verificationRequest) {
      return <Text>Verification request</Text>;
      // FIXME
      // return (
      //   <EncryptionPanel
      //     layout="dialog"
      //     verificationRequest={this.state.verificationRequest}
      //     onClose={this.props.onFinished}
      //     member={matrix.getClient().getUser(this.state.verificationRequest.otherUserId)}
      //   />
      // );
    } else if (phase === PHASE_INTRO) {
      const store = SetupEncryptionStore.sharedInstance();
      let recoveryKeyPrompt;
      if (store.keyInfo && keyHasPassphrase(store.keyInfo)) {
        recoveryKeyPrompt = _t('Use Recovery Key or Passphrase');
      } else if (store.keyInfo) {
        recoveryKeyPrompt = _t('Use Recovery Key');
      }

      let useRecoveryKeyButton;
      if (recoveryKeyPrompt) {
        useRecoveryKeyButton = (
          <Button kind="link" onPress={this._onUsePassphraseClick} label={recoveryKeyPrompt}/>
        );
      }

      // FIXMe
      const brand = 'Minds';

      return (
        <View>
          <Text>
            {_t(
              'Confirm your identity by verifying this login from one of your other sessions, ' +
                'granting it access to encrypted messages.'
            )}
          </Text>
          <Text>{_t('This requires the latest {{brand}}s on your other devices:', { brand })}</Text>

          <View>
            <View>
              <Text>{_t('{{brand}}s Web', { brand })}</Text>
              <Text>{_t('{{brand}}s Desktop', { brand })}</Text>
            </View>
            <View>
              <Text>{_t('{{brand}}s iOS', { brand })}</Text>
              <Text>{_t('{{brand}}s Android', { brand })}</Text>
            </View>
            <Text>{_t('or another cross-signing capable Matrix client')}</Text>
          </View>

          <View>
            {useRecoveryKeyButton}
            <Button kind="danger" onPress={this.onSkipClick} label={_t('Skip')} />
          </View>
        </View>
      );
    } else if (phase === PHASE_DONE) {
      let message;
      if (this.state.backupInfo) {
        message = (
          <Text>
            {_t(
              'Your new session is now verified. It has access to your ' +
                'encrypted messages, and other users will see it as trusted.'
            )}
          </Text>
        );
      } else {
        message = (
          <Text>{_t('Your new session is now verified. Other users will see it as trusted.')}</Text>
        );
      }
      return (
        <View>
          <View />
          {message}
          <View>
            <Button kind="primary" onPress={this.onDoneClick} label={_t('Done')} />
          </View>
        </View>
      );
    } else if (phase === PHASE_CONFIRM_SKIP) {
      return (
        <View>
          <Text>
            {_t(
              'Without completing security on this session, it won’t have ' +
                'access to encrypted messages.'
            )}
          </Text>
          <View>
            <Button kind="secondary" onPress={this.onSkipConfirmClick} label={_t('Skip')} />
            <Button kind="danger" onPress={this.onSkipBackClick} label={_t('Go Back')} />
          </View>
        </View>
      );
    } else if (phase === PHASE_BUSY) {
      return <Spinner />;
    } else {
      console.log(`SetupEncryptionBody: Unknown phase ${phase}`);
    }
  }
}
