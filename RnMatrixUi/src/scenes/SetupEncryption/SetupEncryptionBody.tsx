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

import { matrix } from '@rn-matrix/core';
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
import Icon from 'react-native-vector-icons/MaterialIcons';
import Button from '../../common/Button';
import MenuItem from '../../common/MenuItem';
import Spinner from '../../common/Spinner';
import Config from '../../Config';
import ThemedStyles from '../../styles/ThemedStyles';
import E2EIcon from '../../utilities/E2EIcon';
import EncryptionPanel from '../../components/EncryptionPanel';

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
    const store = SetupEncryptionStore.sharedInstance();
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
    const theme = ThemedStyles.style;
    const { phase } = this.state;

    if (this.state.verificationRequest) {
      return (
        <EncryptionPanel
          layout="dialog"
          verificationRequest={this.state.verificationRequest}
          onClose={this.onSkipBackClick}
          member={matrix.getClient().getUser(this.state.verificationRequest.otherUserId)}
        />
      );
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
          <MenuItem
            containerItemStyle={theme.backgroundPrimary}
            item={{
              title: recoveryKeyPrompt, // TODO: translate
              description: "If you can't access an existing session", // TODO: translate
              onPress: this._onUsePassphraseClick,
            }}
          />
        );
      }

      // FIXMe
      const brand = Config.brand;

      return (
        <>
          <View style={theme.padding4x}>
            <Text>
              {_t(
                'Confirm your identity by verifying this login from one of your other sessions, ' +
                  'granting it access to encrypted messages.'
              )}
            </Text>
            <Text style={theme.marginTop2x}>
              {_t('This requires the latest {{brand}} version on your other devices:', { brand })}
            </Text>
          </View>

          <View style={[theme.rowJustifyStart, theme.marginVertical4x, theme.marginHorizontal8x]}>
            <View style={[theme.flexContainer, theme.alignCenter]}>
              <Icon
                name={'desktop-mac'}
                size={49}
                color={theme.colorPrimaryText.color}
                style={theme.marginBottom}
              />
              <Text>Minds.com</Text>
            </View>
            <View style={[theme.flexContainer, theme.alignCenter]}>
              <Icon
                name={'phone-iphone'}
                size={49}
                color={theme.colorPrimaryText.color}
                style={theme.marginBottom}
              />
              <Text>{_t('{{brand}} iOS', { brand })}</Text>
              <Text>{_t('{{brand}} Android', { brand })}</Text>
            </View>
          </View>

          <View>
            {useRecoveryKeyButton}
            <MenuItem
              containerItemStyle={[theme.backgroundPrimary, { borderTopWidth: 0 }]}
              titleStyle={{ color: theme.backgroundDanger.backgroundColor }}
              chevronStyle={{ color: theme.backgroundDanger.backgroundColor }}
              item={{
                title: _t('Skip'), // TODO: translate
                onPress: this.onSkipClick,
              }}
            />
          </View>
        </>
      );
    } else if (phase === PHASE_DONE) {
      let message;
      if (this.state.backupInfo) {
        message = _t(
          'Your new session is now verified. It has access to your ' +
            'encrypted messages, and other users will see it as trusted.'
        );
      } else {
        message = _t('Your new session is now verified. Other users will see it as trusted.');
      }
      return (
        <View style={ThemedStyles.style.padding2x}>
          <Text style={[ThemedStyles.style.fontXXL, ThemedStyles.style.marginBottom]}>
            {_t('Verified')}
          </Text>
          <Text>{message}</Text>
          <View style={[ThemedStyles.style.centered, ThemedStyles.style.marginBottom2x]}>
            <E2EIcon isUser={true} status="verified" size={128} hideTooltip={true} />
          </View>
          <Button raised type="success" onPress={this.onDoneClick} label={_t('Got it')} />
        </View>
      );
    } else if (phase === PHASE_CONFIRM_SKIP) {
      return (
        <>
          <Text style={theme.padding4x}>
            {_t(
              'Without completing security on this session, it won’t have ' +
                'access to encrypted messages.'
            )}
          </Text>
          <View>
            <MenuItem
              containerItemStyle={theme.backgroundPrimary}
              titleStyle={{ color: theme.backgroundDanger.backgroundColor }}
              chevronStyle={{ color: theme.backgroundDanger.backgroundColor }}
              item={{
                title: _t('Skip'), // TODO: translate
                onPress: this.onSkipConfirmClick,
              }}
            />
            <MenuItem
              containerItemStyle={[theme.backgroundPrimary, { borderTopWidth: 0 }]}
              titleStyle={theme.colorLink}
              chevronStyle={theme.colorLink}
              item={{
                title: _t('Go Back'), // TODO: translate
                onPress: this.onSkipBackClick,
              }}
            />
          </View>
        </>
      );
    } else if (phase === PHASE_BUSY) {
      return <Spinner />;
    } else {
      console.log(`SetupEncryptionBody: Unknown phase ${phase}`);
    }
  }
}
