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

import React, { ReactNode } from 'react';
import { Text, View } from 'react-native';
import Button from '../common/Button';
import ThemedStyles from '../styles/ThemedStyles';

export type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };
export type XOR<T, U> = T | U extends object ? (Without<T, U> & U) | (Without<U, T> & T) : T | U;

export interface IProps {
  description: ReactNode;
  acceptLabel: string;

  onAccept();
}

interface IPropsExtended extends IProps {
  rejectLabel: string;
  onReject();
}

const GenericToast: React.FC<XOR<IPropsExtended, IProps>> = ({
  description,
  acceptLabel,
  rejectLabel,
  onAccept,
  onReject,
}) => {
  return (
    <View>
      <Text style={[ThemedStyles.style.colorPrimaryText]}>{description}</Text>
      <View style={ThemedStyles.style.rowJustifyEnd}>
        {onReject && rejectLabel && (
          <Button
            style={[ThemedStyles.style.marginRight4x]}
            label={rejectLabel}
            type="danger"
            onPress={onReject}
          />
        )}
        <Button type="success" label={acceptLabel} onPress={onAccept} />
      </View>
    </View>
  );
};

export default GenericToast;
