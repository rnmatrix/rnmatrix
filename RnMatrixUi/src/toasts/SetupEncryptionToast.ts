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

import DeviceListener from '@rn-matrix/core/src/react-sdk-utils/DeviceListener';
import { accessSecretStorage } from '@rn-matrix/core/src/react-sdk-utils/SecurityManager';
import { showMessage } from 'react-native-flash-message';
import SetupEncryptionDialog from '../components/SetupEncryption/SetupEncryptionDialog';
import ThemedStyles from '../styles/ThemedStyles';
import Navigation from '../utilities/navigation';

const TOAST_KEY = 'setupencryption';

// TODO: translate
const _t = (s, obj?) => {
  if (!obj) return s;

  return s.replace(/(\{\{)(.*?)(\}\})/gm, Object.values(obj)[0]);
};

const getTitle = (kind: Kind) => {
  switch (kind) {
    case Kind.SET_UP_ENCRYPTION:
      return _t('Set up Secure Backup');
    case Kind.UPGRADE_ENCRYPTION:
      return _t('Encryption upgrade available');
    case Kind.VERIFY_THIS_SESSION:
      return _t('Verify this session');
  }
};

const getIcon = (kind: Kind) => {
  switch (kind) {
    case Kind.SET_UP_ENCRYPTION:
    case Kind.UPGRADE_ENCRYPTION:
      return 'secure_backup';
    case Kind.VERIFY_THIS_SESSION:
      return 'verification_warning';
  }
};

const getSetupCaption = (kind: Kind) => {
  switch (kind) {
    case Kind.SET_UP_ENCRYPTION:
      return _t('Continue');
    case Kind.UPGRADE_ENCRYPTION:
      return _t('Upgrade');
    case Kind.VERIFY_THIS_SESSION:
      return _t('Verify');
  }
};

const getDescription = (kind: Kind) => {
  switch (kind) {
    case Kind.SET_UP_ENCRYPTION:
    case Kind.UPGRADE_ENCRYPTION:
      return _t('Safeguard against losing access to encrypted messages & data');
    case Kind.VERIFY_THIS_SESSION:
      return _t('Other users may not trust it');
  }
};

export enum Kind {
  SET_UP_ENCRYPTION = 'set_up_encryption',
  UPGRADE_ENCRYPTION = 'upgrade_encryption',
  VERIFY_THIS_SESSION = 'verify_this_session',
}

const onReject = () => {
  DeviceListener.sharedInstance.dismissEncryptionSetup();
};

export const showToast = (kind: Kind) => {
  const onAccept = async () => {
    if (kind === Kind.VERIFY_THIS_SESSION) {
      Navigation.instance?.navigate('SetupEncryptionDialog');
      // Modal.createTrackedDialog("Verify session", "Verify session", SetupEncryptionDialog,
      //     {}, null, /* priority = */ false, /* static = */ true);
    } else {
      // FIXME show spinner modal
      // const modal = Modal.createDialog(
      //     Spinner, null, "mx_Dialog_spinner", /* priority */ false, /* static */ true,
      // );
      try {
        await accessSecretStorage();
      } finally {
        // modal.close();
      }
    }
  };

  showMessage({
    message: getTitle(kind),
    description: getDescription(kind),
    floating: true,
    autoHide: false,
    onPress: onAccept,
    onHide: onReject,
    backgroundColor: ThemedStyles.getColor('link'),
  });

  // ToastStore.sharedInstance().addOrReplaceToast({
  //     key: TOAST_KEY,
  //     title: getTitle(kind),
  //     icon: getIcon(kind),
  //     props: {
  //         description: getDescription(kind),
  //         acceptLabel: getSetupCaption(kind),
  //         onAccept,
  //         rejectLabel: _t("Later"),
  //         onReject,
  //     },
  //     component: GenericToast,
  //     priority: kind === Kind.VERIFY_THIS_SESSION ? 95 : 40,
  // });
};

export const hideToast = () => {
  // ToastStore.sharedInstance().dismissToast(TOAST_KEY);
};
