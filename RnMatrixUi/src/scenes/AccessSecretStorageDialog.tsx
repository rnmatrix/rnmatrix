/*
Copyright 2018, 2019 New Vector Ltd
Copyright 2019, 2020 The Matrix.org Foundation C.I.C.

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
import { debounce } from 'lodash';
import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
import { Text, View } from 'react-native';
import DocumentPicker, { DocumentPickerOptions } from 'react-native-document-picker';
import { Input } from 'react-native-elements';
import fs from 'react-native-fs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import BaseDialog from '../common/BaseDialog';
import Button from '../common/Button';
import MenuItem from '../common/MenuItem';
import ThemedStyles from '../styles/ThemedStyles';

// TODO: translate
const _t = (s, obj?) => {
  if (!obj) return s;

  return s.replace(/(\{\{)(.*?)(\}\})/gm, Object.values(obj)[0]);
};

// Maximum acceptable size of a key file. It's 59 characters including the spaces we encode,
// so this should be plenty and allow for people putting extra whitespace in the file because
// maybe that's a thing people would do?
const KEY_FILE_MAX_SIZE = 128;

// Don't shout at the user that their key is invalid every time they type a key: wait a short time
const VALIDATION_THROTTLE_MS = 200;

/*
 * Access Secure Secret Storage by requesting the user's passphrase.
 */
export default class AccessSecretStorageDialog extends React.Component<any, any> {
  static route = 'AccessSecretStorageDialog';

  static propTypes = {
    // { passphrase, pubkey }
    keyInfo: PropTypes.object.isRequired,
    // Function from one of { passphrase, recoveryKey } -> boolean
    checkPrivateKey: PropTypes.func.isRequired,
  };

  private readonly _fileUpload;

  constructor(props) {
    super(props);

    this._fileUpload = React.createRef();

    this.state = {
      recoveryKey: '',
      recoveryKeyValid: null,
      recoveryKeyCorrect: null,
      recoveryKeyFileError: null,
      forceRecoveryKey: false,
      passPhrase: '',
      keyMatches: null,
    };
  }

  _onCancel = () => {
    this.props.route.params.onFinished(false);
  };

  _onUseRecoveryKeyClick = () => {
    this.setState({
      forceRecoveryKey: true,
    });
  };

  _validateRecoveryKeyOnChange = debounce(() => {
    this._validateRecoveryKey();
  }, VALIDATION_THROTTLE_MS);

  async _validateRecoveryKey() {
    if (this.state.recoveryKey === '') {
      this.setState({
        recoveryKeyValid: null,
        recoveryKeyCorrect: null,
      });
      return;
    }

    try {
      const cli = matrix.getClient();
      const decodedKey = cli.keyBackupKeyFromRecoveryKey(this.state.recoveryKey);
      const correct = await cli.checkSecretStorageKey(decodedKey, this.props.route.params.keyInfo);
      this.setState({
        recoveryKeyValid: true,
        recoveryKeyCorrect: correct,
      });
    } catch (e) {
      this.setState({
        recoveryKeyValid: false,
        recoveryKeyCorrect: false,
      });
    }
  }

  _onRecoveryKeyChange = (value) => {
    this.setState({
      recoveryKey: value,
      recoveryKeyFileError: null,
    });

    // also clear the file upload control so that the user can upload the same file
    // the did before (otherwise the onchange wouldn't fire)
    if (this._fileUpload.current) this._fileUpload.current.value = null;

    // We don't use Field's validation here because a) we want it in a separate place rather
    // than in a tooltip and b) we want it to display feedback based on the uploaded file
    // as well as the text box. Ideally we would refactor Field's validation logic so we could
    // re-use some of it.
    this._validateRecoveryKeyOnChange();
  };

  _onPassPhraseNext = async (e) => {
    e.preventDefault();

    if (this.state.passPhrase.length <= 0) return;

    this.setState({ keyMatches: null });
    const input = { passphrase: this.state.passPhrase };
    const keyMatches = await this.props.route.params.checkPrivateKey(input);
    if (keyMatches) {
      this.props.route.params.onFinished(input);
    } else {
      this.setState({ keyMatches });
    }
  };

  _onRecoveryKeyNext = async () => {
    if (!this.state.recoveryKeyValid) return;

    this.setState({ keyMatches: null });
    const input = { recoveryKey: this.state.recoveryKey };
    const keyMatches = await this.props.route.params.checkPrivateKey(input);
    if (keyMatches) {
      this.props.route.params.onFinished(input);
    } else {
      this.setState({ keyMatches });
    }
  };

  _onPassPhraseChange = (value) => {
    this.setState({
      passPhrase: value,
      keyMatches: null,
    });
  };

  getKeyValidationText() {
    if (this.state.recoveryKeyFileError) {
      return _t('Wrong file type');
    } else if (this.state.recoveryKeyCorrect) {
      return _t('Looks good!');
    } else if (this.state.recoveryKeyValid) {
      return _t('Wrong Recovery Key');
    } else if (this.state.recoveryKeyValid === null) {
      return '';
    } else {
      return _t('Invalid Recovery Key');
    }
  }

  openDocPicker = async () => {
    const f = await DocumentPicker.pick({ type: ['text/plain'] } as DocumentPickerOptions<any>);
    if (f) {
      if (f.size > KEY_FILE_MAX_SIZE) {
        this.setState({
          recoveryKeyFileError: true,
          recoveryKeyCorrect: false,
          recoveryKeyValid: false,
        });
      } else {
        const contents = await fs.readFile(f.uri);
        // test it's within the base58 alphabet. We could be more strict here, eg. require the
        // right number of characters, but it's really just to make sure that what we're reading is
        // text because we'll put it in the text field.
        if (/^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz\s]+$/.test(contents)) {
          console.log('VALID?', true);
          this.setState(
            {
              recoveryKeyFileError: null,
              recoveryKey: contents.trim(),
            },
            () => this._validateRecoveryKey()
          );
        } else {
          console.log('VALID?', false);
          this.setState({
            recoveryKeyFileError: true,
            recoveryKeyCorrect: false,
            recoveryKeyValid: false,
            recoveryKey: '',
          });
        }
      }
    }
  };

  render() {
    const hasPassphrase =
      this.props.route.params.keyInfo &&
      this.props.route.params.keyInfo.passphrase &&
      this.props.route.params.keyInfo.passphrase.salt &&
      this.props.route.params.keyInfo.passphrase.iterations;

    let content;
    let title;
    let titleClass;
    if (hasPassphrase && !this.state.forceRecoveryKey) {
      title = _t('Security Phrase');

      let keyStatus;
      if (this.state.keyMatches === false) {
        keyStatus = (
          <Text>
            {'\uD83D\uDC4E '}
            {_t(
              'Unable to access secret storage. ' +
                'Please verify that you entered the correct recovery passphrase.'
            )}
          </Text>
        );
      } else {
        keyStatus = <View />;
      }

      content = (
        <View>
          <Text>
            {_t(
              'Enter your Security Phrase or <button>Use your Security Key</button> to continue.',
              {}
              // FIXME
              /*
              {
                button: (s) => (
                  <AccessibleButton element="span" onPress={this._onUseRecoveryKeyClick}>
                    {s}
                  </AccessibleButton>
                ),
              }
*/
            )}
          </Text>

          <Input
            onChangeText={this._onPassPhraseChange}
            value={this.state.passPhrase}
            autoFocus={true}
            // autoComplete="new-password"
            placeholder={_t('Security Phrase')}
          />
          {keyStatus}

          <Button
            label={_t('Continue')}
            onPress={this._onPassPhraseNext}
            disabled={this.state.passPhrase.length === 0}
          />
          <Button label={_t('Go Back')} onPress={this._onCancel} />
        </View>
      );
    } else {
      title = _t('Security Key');
      const recoveryKeyFeedback = <Text>{this.getKeyValidationText()}</Text>;

      content = (
        <View>
          {/*<Text style={ThemedStyles.style.colorSecondaryText}>{_t('Use your Security Key to continue.')}</Text>*/}

          <View style={ThemedStyles.style.padding2x}>
            <Input
              label={_t('Use your Security Key to continue.')}
              value={this.state.recoveryKey}
              onChangeText={this._onRecoveryKeyChange}
              labelStyle={[ThemedStyles.style.colorSecondaryText, ThemedStyles.style.fontNormal]}
              style={ThemedStyles.style.colorPrimaryText}
              // forceValidity={this.state.recoveryKeyCorrect}
              // autoComplete="off"
            />
            <View style={ThemedStyles.style.padding2x}>
              <Text
                style={[
                  ThemedStyles.style.fontXL,
                  ThemedStyles.style.colorSecondaryText,
                  ThemedStyles.style.textCenter,
                  ThemedStyles.style.marginBottom2x,
                ]}>
                {_t('or')}
              </Text>
              <Button
                label={_t('Upload')}
                icon={<Icon name={'upload-file'} size={21} color={ThemedStyles.getColor('link')} />}
                type="primary"
                raised
                onPress={this.openDocPicker}
              />
            </View>

            {recoveryKeyFeedback}
          </View>

          <MenuItem
            containerItemStyle={[ThemedStyles.style.backgroundPrimary]}
            titleStyle={
              this.state.recoveryKeyValid
                ? ThemedStyles.style.colorLink
                : ThemedStyles.style.colorTertiaryText
            }
            chevronStyle={
              this.state.recoveryKeyValid
                ? ThemedStyles.style.colorLink
                : ThemedStyles.style.colorTertiaryText
            }
            disabled={!this.state.recoveryKeyValid}
            item={{
              title: _t('Continue'), // TODO: translate
              onPress: this._onRecoveryKeyNext,
            }}
          />
          <MenuItem
            containerItemStyle={[ThemedStyles.style.backgroundPrimary, { borderTopWidth: 0 }]}
            item={{
              title: _t('Go Back'), // TODO: translate
              onPress: this._onCancel,
            }}
          />
          {/*<Button
            label={_t('Continue')}
            onPress={this._onRecoveryKeyNext}
            disabled={!this.state.recoveryKeyValid}
          />*/}
        </View>
      );
    }

    return (
      <BaseDialog onBack={this._onCancel} title={title}>
        {content}
      </BaseDialog>
    );
  }
}