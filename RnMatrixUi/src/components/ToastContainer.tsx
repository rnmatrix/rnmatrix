/*
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

import * as React from 'react';
import ToastStore, { IToast } from '@rn-matrix/core/src/react-sdk-utils/stores/ToastStore';
import { Text, View } from 'react-native';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ThemedStyles from '../styles/ThemedStyles';

interface IState {
  toasts: IToast<any>[];
  countSeen: number;
}

export default class ToastContainer extends React.Component<{}, IState> {
  constructor(props, context) {
    super(props, context);
    this.state = {
      toasts: ToastStore.sharedInstance().getToasts(),
      countSeen: ToastStore.sharedInstance().getCountSeen(),
    };

    // Start listening here rather than in componentDidMount because
    // toasts may dismiss themselves in their didMount if they find
    // they're already irrelevant by the time they're mounted, and
    // our own componentDidMount is too late.
    ToastStore.sharedInstance().on('update', this._onToastStoreUpdate);
  }

  componentWillUnmount() {
    ToastStore.sharedInstance().removeListener('update', this._onToastStoreUpdate);
  }

  _onToastStoreUpdate = () => {
    this.setState({
      toasts: ToastStore.sharedInstance().getToasts(),
      countSeen: ToastStore.sharedInstance().getCountSeen(),
    });
  };

  render() {
    const totalCount = this.state.toasts.length;
    const isStacked = totalCount > 1;
    let toast;
    if (totalCount !== 0) {
      const topToast = this.state.toasts[0];
      const { title, icon, key, component, className, props } = topToast;
      let countIndicator;
      if (isStacked || this.state.countSeen > 0) {
        countIndicator = ` (${this.state.countSeen + 1}/${this.state.countSeen + totalCount})`;
      }

      const toastProps = Object.assign({}, props, {
        key,
        toastKey: key,
      });
      toast = (
        <View
          style={[
            ThemedStyles.style.backgroundPrimary,
            ThemedStyles.style.borderLink,
            ThemedStyles.style.border,
            {
              position: 'absolute',
              bottom: 16,
              left: 16,
              right: 16,
              borderRadius: 10,
              padding: 16,
            },
          ]}>
          <View style={ThemedStyles.style.rowJustifyStart}>
            {/* <Icon
              name="shield-alert"
              size={21}
              color={ThemedStyles.getColor('alert')}
              style={ThemedStyles.style.marginRight}
            /> */}
            <Text style={[ThemedStyles.style.fontXL, ThemedStyles.style.colorPrimaryText]}>
              {title}
            </Text>
          </View>
          <Text>{countIndicator}</Text>
          <View>{React.createElement(component, toastProps)}</View>
        </View>
      );
    }

    return <View>{toast}</View>;
  }
}
