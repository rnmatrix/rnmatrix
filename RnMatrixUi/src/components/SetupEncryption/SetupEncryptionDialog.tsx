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
  PHASE_DONE,
  SetupEncryptionStore,
} from '@rn-matrix/core/src/react-sdk-utils/stores/SetupEncryptionStore';
import PropTypes from 'prop-types';
import React from 'react';
import { Text } from 'react-native';
import BaseDialog from '../../common/BaseDialog';
import SetupEncryptionBody from './SetupEncryptionBody';

// TODO: translate
const _t = (s, obj?) => {
  if (!obj) return s;

  return s.replace(/(\{\{)(.*?)(\}\})/gm, Object.values(obj)[0]);
};

// function iconFromPhase(phase) {
//   if (phase === PHASE_DONE) {
//     return require('../../../../../res/img/e2e/verified.svg');
//   } else {
//     return require('../../../../../res/img/e2e/warning.svg');
//   }
// }

export default class SetupEncryptionDialog extends React.Component {
  static propTypes = {
    onFinished: PropTypes.func.isRequired,
  };

  private store;

  constructor(props) {
    super(props);

    this.store = SetupEncryptionStore.sharedInstance();
    this.state = { phase: this.store.phase };
  }

  componentDidMount() {
    this.store.on('update', this._onStoreUpdate);
  }

  componentWillUnmount() {
    this.store.removeListener('update', this._onStoreUpdate);
  }

  _onStoreUpdate = () => {
    this.setState({ phase: this.store.phase });
  };

  onClose = () => {
    this.props.navigation.goBack();
  }

  render() {
    return (
      <BaseDialog title={_t('Verify this session')}>
        <Text>{this.state.phase}</Text>
        <SetupEncryptionBody onFinished={this.onClose} />
      </BaseDialog>
    );
  }
}
