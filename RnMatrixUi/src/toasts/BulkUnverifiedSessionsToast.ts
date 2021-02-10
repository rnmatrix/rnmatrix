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
import DeviceListener from '@rn-matrix/core/src/react-sdk-utils/DeviceListener';
import { showMessage } from 'react-native-flash-message';
import ThemedStyles from '../styles/ThemedStyles';
import Navigation from '../utilities/navigation';

const TOAST_KEY = 'reviewsessions';

// TODO: translate
const _t = (s, obj?) => {
  if (!obj) return s;

  return s.replace(/(\{\{)(.*?)(\}\})/gm, Object.values(obj)[0]);
};

export const showToast = (deviceIds: Set<string>) => {
  const onAccept = () => {
    DeviceListener.sharedInstance.dismissUnverifiedSessions(deviceIds);

    console.log('matrix.getClient().getUserId()', matrix.getClient().getUserId())
    console.log('matrix.getClient().getUser(matrix.getClient().getUserId())', matrix.getClient().getUser(matrix.getClient().getUserId()))
    // TODO: navigate to user info
    Navigation.instance?.navigate('MessengerUserInfo', {
      user: matrix.getClient().getUser(matrix.getClient().getUserId()),
    });
    // dis.dispatch({
    //     action: 'view_user_info',
    //     userId: matrix.getClient().getUserId(),
    // });
  };

  const onReject = () => {
    DeviceListener.sharedInstance.dismissUnverifiedSessions(deviceIds);
  };

  showMessage({
    message: _t('Review where you’re logged in'),
    description: _t('Verify all your sessions to ensure your account & messages are safe'),
    floating: true,
    autoHide: false,
    onPress: onAccept,
    onHide: onReject,
    backgroundColor: ThemedStyles.getColor('link'),

  });
  // ToastStore.sharedInstance().addOrReplaceToast({
  //     key: TOAST_KEY,
  //     // title: _t("Review where you’re logged in"),
  //     // icon: "verification_warning",
  //     props: {
  //         description: _t("Verify all your sessions to ensure your account & messages are safe"),
  //         acceptLabel: _t("Review"),
  //         onAccept,
  //         rejectLabel: _t("Later"),
  //         onReject,
  //     },
  //     component: GenericToast,
  //     priority: 50,
  // });
};

export const hideToast = () => {
  // ToastStore.sharedInstance().dismissToast(TOAST_KEY);
};
