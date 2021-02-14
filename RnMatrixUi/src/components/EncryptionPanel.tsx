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

import { matrix } from '@rn-matrix/core';
import { useEventEmitter } from '@rn-matrix/core/hooks';
import { ensureDMExists } from '@rn-matrix/core/src/react-sdk-utils/createRoom';
import {
  PHASE_REQUESTED,
  PHASE_UNSENT,
  VerificationRequest,
} from 'matrix-js-sdk/src/crypto/verification/request/VerificationRequest';
import { RoomMember } from 'matrix-js-sdk/src/models/room-member';
import React, { useCallback, useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { showError } from '../common/Modal';
import EncryptionInfo from './EncryptionInfo';
import VerificationPanel from './VerificationPanel';

// TODO: translate
const _t = (s, obj?) => {
  if (!obj) return s;

  return s.replace(/(\{\{)(.*?)(\}\})/gm, Object.values(obj)[0]);
};

// cancellation codes which constitute a key mismatch
const MISMATCHES = ['m.key_mismatch', 'm.user_error', 'm.mismatched_sas'];

interface IProps {
  member: RoomMember;
  onClose: () => void;
  verificationRequest: VerificationRequest;
  verificationRequestPromise?: Promise<VerificationRequest>;
  layout: string;
  inDialog?: boolean;
  isRoomEncrypted?: boolean;
}

const EncryptionPanel: React.FC<IProps> = (props: IProps) => {
  const {
    verificationRequest,
    verificationRequestPromise,
    member,
    onClose,
    layout,
    isRoomEncrypted,
  } = props;
  const [request, setRequest] = useState(verificationRequest);
  // state to show a spinner immediately after clicking "start verification",
  // before we have a request
  const [isRequesting, setRequesting] = useState(false);
  const [phase, setPhase] = useState(request && request.phase);
  useEffect(() => {
    setRequest(verificationRequest);
    if (verificationRequest) {
      setRequesting(false);
      setPhase(verificationRequest.phase);
    }
  }, [verificationRequest]);

  useEffect(() => {
    async function awaitPromise() {
      setRequesting(true);
      const requestFromPromise = await verificationRequestPromise;
      setRequesting(false);
      setRequest(requestFromPromise);
      setPhase(requestFromPromise.phase);
    }

    if (verificationRequestPromise) {
      awaitPromise();
    }
  }, [verificationRequestPromise]);
  const changeHandler = useCallback(() => {
    // handle transitions -> cancelled for mismatches which fire a modal instead of showing a card
    if (request && request.cancelled && MISMATCHES.includes(request.cancellationCode)) {
      showError({
        title: _t('Your messages are not secure'),
        description: (
          <View>
            <Text>{_t('One of the following may be compromised:')}</Text>
            <View>
              <Text>{_t('Your homeserver')}</Text>
              <Text>{_t('The homeserver the user you’re verifying is connected to')}</Text>
              <Text>{_t('Yours, or the other users’ internet connection')}</Text>
              <Text>{_t('Yours, or the other users’ session')}</Text>
            </View>
          </View>
        ),
        onFinished: onClose,
      });
      return; // don't update phase here as we will be transitioning away from this view shortly
    }

    if (request) {
      setPhase(request.phase);
    }
  }, [onClose, request]);
  useEventEmitter(request, 'change', changeHandler);

  const onStartVerification = useCallback(async () => {
    setRequesting(true);
    const cli = matrix.getClient();
    const roomId = await ensureDMExists(cli, member.userId);
    const verificationRequest_ = await cli.requestVerificationDM(member.userId, roomId);
    setRequest(verificationRequest_);
    setPhase(verificationRequest_.phase);
    // TODO: what should I do here?
    // Notify the RightPanelStore about this
    // dis.dispatch({
    //   action: Action.SetRightPanelPhase,
    //   phase: RightPanelPhases.EncryptionPanel,
    //   refireParams: { member, verificationRequest: verificationRequest_ },
    // });
  }, [member]);

  const requested =
    (!request && isRequesting) ||
    (request && (phase === PHASE_REQUESTED || phase === PHASE_UNSENT || phase === undefined));
  const isSelfVerification = request
    ? request.isSelfVerification
    : member.userId === matrix.getClient().getUserId();
  if (!request || requested) {
    const initiatedByMe = (!request && isRequesting) || (request && request.initiatedByMe);
    return (
      <EncryptionInfo
        isRoomEncrypted={isRoomEncrypted}
        onStartVerification={onStartVerification}
        member={member}
        isSelfVerification={isSelfVerification}
        waitingForOtherParty={requested && initiatedByMe}
        waitingForNetwork={requested && !initiatedByMe}
        inDialog={layout === 'dialog'}
      />
    );
  } else {
    return (
      <VerificationPanel
        isRoomEncrypted={isRoomEncrypted}
        layout={layout}
        onClose={onClose}
        member={member}
        request={request}
        key={request.channel.transactionId}
        inDialog={layout === 'dialog'}
        phase={phase}
      />
    );
  }
};

export default EncryptionPanel;
