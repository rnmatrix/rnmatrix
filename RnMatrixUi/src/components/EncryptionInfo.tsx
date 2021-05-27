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

import React from 'react';
import { RoomMember } from 'matrix-js-sdk/src/models/room-member';
import { Text, View } from 'react-native';
import Button from '../common/Button';
import Spinner from '../common/Spinner';

// TODO: translate
const _t = (s, obj?) => {
  if (!obj) return s;

  return s.replace(/(\{\{)(.*?)(\}\})/gm, Object.values(obj)[0]);
};

export const PendingActionSpinner = ({ text }) => {
  return (
    <View>
      <Spinner />
      <Text>{text}</Text>
    </View>
  );
};

interface IProps {
  waitingForOtherParty: boolean;
  waitingForNetwork: boolean;
  member: RoomMember;
  onStartVerification: () => Promise<void>;
  isRoomEncrypted: boolean;
  inDialog: boolean;
  isSelfVerification: boolean;
}

const EncryptionInfo: React.FC<IProps> = ({
  waitingForOtherParty,
  waitingForNetwork,
  member,
  onStartVerification,
  isRoomEncrypted,
  inDialog,
  isSelfVerification,
}: IProps) => {
  let content: JSX.Element;
  if (waitingForOtherParty || waitingForNetwork) {
    let text: string;
    if (waitingForOtherParty) {
      if (isSelfVerification) {
        text = _t('Waiting for you to accept on your other session…');
      } else {
        text = _t('Waiting for {{displayName}} to accept…', {
          displayName: member.displayName || member.name || member.userId,
        });
      }
    } else {
      text = _t('Accepting…');
    }
    content = <PendingActionSpinner text={text} />;
  } else {
    content = <Button label={_t('Start Verification')} onPress={onStartVerification} />;
  }

  let description: JSX.Element;
  if (isRoomEncrypted) {
    description = (
      <View>
        <Text>{_t('Messages in this room are end-to-end encrypted.')}</Text>
        <Text>
          {_t(
            'Your messages are secured and only you and the recipient have ' +
              'the unique keys to unlock them.'
          )}
        </Text>
      </View>
    );
  } else {
    description = (
      <View>
        <Text>{_t('Messages in this room are not end-to-end encrypted.')}</Text>
        <Text>
          {_t(
            'In encrypted rooms, your messages are secured and only you and the recipient have ' +
              'the unique keys to unlock them.'
          )}
        </Text>
      </View>
    );
  }

  if (inDialog) {
    return content;
  }

  return (
    <React.Fragment>
      <View>
        <Text>{_t('Encryption')}</Text>
        {description}
      </View>
      <View>
        <Text>{_t('Verify User')}</Text>
        <View>
          <Text>
            {_t(
              'For extra security, verify this user by checking a one-time code on both of your devices.'
            )}
          </Text>
          <Text>{_t('To be secure, do this in person or use a trusted way to communicate.')}</Text>
          {content}
        </View>
      </View>
    </React.Fragment>
  );
};

export default EncryptionInfo;
