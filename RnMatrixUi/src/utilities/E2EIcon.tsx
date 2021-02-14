/*
Copyright 2019 New Vector Ltd
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

import React from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ThemedStyles from '../styles/ThemedStyles';

// TODO: translate
const _t = (s, obj) => s;
const _td = (s, obj?) => s;

export const E2E_STATE = {
  VERIFIED: 'verified',
  WARNING: 'warning',
  UNKNOWN: 'unknown',
  NORMAL: 'normal',
  UNAUTHENTICATED: 'unauthenticated',
};

const crossSigningUserTitles = {
  [E2E_STATE.WARNING]: _td('This user has not verified all of their sessions.'),
  [E2E_STATE.NORMAL]: _td('You have not verified this user.'),
  [E2E_STATE.VERIFIED]: _td(
    'You have verified this user. This user has verified all of their sessions.'
  ),
};
const crossSigningRoomTitles = {
  [E2E_STATE.WARNING]: _td('Someone is using an unknown session'),
  [E2E_STATE.NORMAL]: _td('This room is end-to-end encrypted'),
  [E2E_STATE.VERIFIED]: _td('Everyone in this room is verified'),
};

const E2EIcon = ({ isUser, status, className, size, onPress, bordered, hideTooltip }: any) => {
  // const classes = classNames(
  //   {
  //     mx_E2EIcon: true,
  //     mx_E2EIcon_bordered: bordered,
  //     mx_E2EIcon_warning: status === E2E_STATE.WARNING,
  //     mx_E2EIcon_normal: status === E2E_STATE.NORMAL,
  //     mx_E2EIcon_verified: status === E2E_STATE.VERIFIED,
  //   },
  //   className,
  // );

  // let style;
  // if (size) {
  //   style = { width: `${size}px`, height: `${size}px` };
  // }
  //
  // if (onPress) {
  //   return <Button onPress={onPress} style={style} />;
  // }

  let icon: any = null;

  switch (status) {
    case E2E_STATE.WARNING:
      icon = (
        <Icon
          name={'shield-alert'}
          size={size}
          color={ThemedStyles.getColor('danger_background')}
        />
      );
      break;
    case E2E_STATE.NORMAL:
      icon = <Icon name={'shield'} size={size} color={ThemedStyles.getColor('icon')} />;
      break;
    case E2E_STATE.VERIFIED:
      icon = <Icon name={'shield-check'} size={size} color={ThemedStyles.getColor('adminBadge')} />;
      break;
  }

  return icon;
};

// E2EIcon.propTypes = {
//   isUser: PropTypes.bool,
//   status: PropTypes.oneOf(Object.values(E2E_STATE)),
//   className: PropTypes.string,
//   size: PropTypes.number,
//   onPress: PropTypes.func,
// };

export default E2EIcon;
