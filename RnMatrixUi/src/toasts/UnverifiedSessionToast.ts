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
import ToastStore from '@rn-matrix/core/src/react-sdk-utils/stores/ToastStore';
import NewSessionReviewDialog from '../scenes/NewSessionReviewDialog';
import Navigation from '../utilities/navigation';
import GenericToast from './GenericToast';

function toastKey(deviceId: string) {
  return 'unverified_session_' + deviceId;
}

// TODO: translate
const _t = (s, obj?) => {
  if (!obj) return s;

  return s.replace(/(\{\{)(.*?)(\}\})/gm, Object.values(obj)[0]);
};

export const showToast = (deviceId: string) => {
  const cli = matrix.getClient();

  const onAccept = () => {
    Navigation.instance?.navigate(NewSessionReviewDialog.route, {
      userId: cli.getUserId(),
      device: cli.getStoredDevice(cli.getUserId(), deviceId),
      onFinished: (r) => {
        if (!r) {
          /* This'll come back false if the user clicks "this wasn't me" and saw a warning dialog */
          DeviceListener.sharedInstance.dismissUnverifiedSessions([deviceId]);
        }
      },
    });
    // FIXMe
    // Modal.createTrackedDialog(
    //   'New Session Review',
    //   'Starting dialog',
    //   NewSessionReviewDialog,
    //   {
    //     userId: cli.getUserId(),
    //     device: cli.getStoredDevice(cli.getUserId(), deviceId),
    //     onFinished: (r) => {
    //       if (!r) {
    //         /* This'll come back false if the user clicks "this wasn't me" and saw a warning dialog */
    //         DeviceListener.sharedInstance.dismissUnverifiedSessions([deviceId]);
    //       }
    //     },
    //   },
    //   null,
    //   /* priority = */ false,
    //   /* static = */ true
    // );
  };

  const onReject = () => {
    DeviceListener.sharedInstance.dismissUnverifiedSessions([deviceId]);
  };

  const device = cli.getStoredDevice(cli.getUserId(), deviceId);

  // showMessage({
  //   message: _t('New login. Was this you?'),
  //   description: _t('Verify the new login accessing your account: %(name)s', {
  //     name: device?.getDisplayName(),
  //   }),
  //   floating: true,
  //   autoHide: false,
  //   onPress: onAccept,
  //   onHide: onReject,
  //   backgroundColor: ThemedStyles.getColor('link'),
  // });

  ToastStore.sharedInstance().addOrReplaceToast({
    key: toastKey(deviceId),
    title: _t('New login. Was this you?'),
    icon: 'verification_warning',
    props: {
      description: _t('Verify the new login accessing your account: {{name}}', {
        name: device.getDisplayName(),
      }),
      acceptLabel: _t('Verify'),
      onAccept,
      rejectLabel: _t('Later'),
      onReject,
    },
    component: GenericToast,
    priority: 80,
  });
};

export const hideToast = (deviceId: string) => {
  ToastStore.sharedInstance().dismissToast(toastKey(deviceId));
};
