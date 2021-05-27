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
import { verificationMethods } from 'matrix-js-sdk/src/crypto';
import { ReciprocateQRCode } from 'matrix-js-sdk/src/crypto/verification/QRCode';
// import VerificationQRCode from "../elements/crypto/VerificationQRCode";
import {
  PHASE_CANCELLED,
  PHASE_DONE,
  PHASE_READY,
  PHASE_STARTED,
  VerificationRequest,
} from 'matrix-js-sdk/src/crypto/verification/request/VerificationRequest';
import { SAS } from 'matrix-js-sdk/src/crypto/verification/SAS';
import { RoomMember } from 'matrix-js-sdk/src/models/room-member';
import React from 'react';
import { Text, View } from 'react-native';
import Button from '../common/Button';
import Spinner from '../common/Spinner';
import Config from '../Config';
import ThemedStyles from '../styles/ThemedStyles';
import E2EIcon from '../utilities/E2EIcon';
import VerificationShowSas from './VerificationShowSas';

// TODO: translate
const _t = (s, obj?) => {
  if (!obj) return s;

  let count = 0;

  return s.replace(/(\{\{)(.*?)(\}\})/gm, (substring: string) => {
    const value = Object.values(obj)[count];
    count++;
    return value;
  });
};
// XXX: Should be defined in matrix-js-sdk
enum VerificationPhase {
  PHASE_UNSENT,
  PHASE_REQUESTED,
  PHASE_READY,
  PHASE_DONE,
  PHASE_STARTED,
  PHASE_CANCELLED,
}

interface IProps {
  layout: string;
  request: VerificationRequest;
  member: RoomMember;
  phase: VerificationPhase;
  onClose: () => void;
  isRoomEncrypted: boolean;
  inDialog: boolean;
  key: number;
}

interface IState {
  sasEvent?: SAS;
  emojiButtonClicked?: boolean;
  reciprocateButtonClicked?: boolean;
  reciprocateQREvent?: ReciprocateQRCode;
}

export default class VerificationPanel extends React.PureComponent<IProps, IState> {
  private hasVerifier: boolean;

  constructor(props: IProps) {
    super(props);
    this.state = {};
    this.hasVerifier = false;
  }

  private renderQRPhase() {
    const { member, request } = this.props;
    const showSAS: boolean = request.otherPartySupportsMethod(verificationMethods.SAS);
    // FIXME in the future
    // const showQR: boolean = request.otherPartySupportsMethod(SCAN_QR_CODE_METHOD);
    const showQR: boolean = false;

    const noCommonMethodError: JSX.Element | null =
      !showSAS && !showQR ? (
        <Text>
          {_t(
            `The session you are trying to verify doesn't support scanning a QR code or emoji verification, which is what ${Config.brand} supports. Try with a different client.`
          )}
        </Text>
      ) : null;

    if (this.props.layout === 'dialog') {
      // HACK: This is a terrible idea.
      let qrBlockDialog: JSX.Element | null = null;
      let sasBlockDialog: JSX.Element | null = null;
      if (showQR) {
        // qrBlockDialog = (
        //   <View >
        //     <Text>{_t('Scan this unique code')}</Text>
        //     <VerificationQRCode qrCodeData={request.qrCodeData} />
        //   </View>
        // );
      }
      if (showSAS) {
        sasBlockDialog = (
          <View
            style={[
              ThemedStyles.style.padding2x,
              ThemedStyles.style.borderRadius4x,
              ThemedStyles.style.backgroundSecondary,
              ThemedStyles.style.centered,
            ]}>
            <Text style={[ThemedStyles.style.textCenter, ThemedStyles.style.bold]}>
              {_t('Compare unique emoji')}
            </Text>
            <Text
              style={[
                ThemedStyles.style.textCenter,
                ThemedStyles.style.colorTertiaryText,
                ThemedStyles.style.marginVertical4x,
                ThemedStyles.style.fontThin,
              ]}>
              {_t("Compare a unique set of emoji if you don't have a camera on either device")}
            </Text>
            <Button
              label={_t('Start')}
              disabled={this.state.emojiButtonClicked}
              onPress={this.startSAS}
            />
          </View>
        );
      }
      return (
        <View style={ThemedStyles.style.padding2x}>
          <Text style={ThemedStyles.style.colorSecondaryText}>
            {_t('Verify this session by completing one of the following:')}
          </Text>
          <View style={ThemedStyles.style.marginVertical4x}>
            {sasBlockDialog}
            {noCommonMethodError}
          </View>
        </View>
      );
    }

    let qrBlock: JSX.Element;
    if (showQR) {
      // qrBlock = (
      //   <View>
      //     <Text>{_t('Verify by scanning')}</Text>
      //     <Text>
      //       {_t('Ask %(displayName)s to scan your code:', {
      //         displayName: member.displayName || member.name || member.userId,
      //       })}
      //     </Text>
      //
      //     <View>
      //       <VerificationQRCode qrCodeData={request.qrCodeData} />
      //     </View>
      //   </View>
      // );
    }

    let sasBlock: JSX.Element | null = null;
    if (showSAS) {
      const disabled = this.state.emojiButtonClicked;
      const sasLabel = showQR
        ? _t("If you can't scan the code above, verify by comparing unique emoji.")
        : _t('Verify by comparing unique emoji.');

      // Note: mx_VerificationPanel_verifyByEmojiButton is for the end-to-end tests
      sasBlock = (
        <View>
          <Text>{_t('Verify by emoji')}</Text>
          <Text>{sasLabel}</Text>
          <Button
            label={_t('Verify by emoji')}
            disabled={disabled}
            kind="primary"
            onPress={this.startSAS}
          />
        </View>
      );
    }

    const noCommonMethodBlock = noCommonMethodError ? <View>{noCommonMethodError}</View> : null;

    // TODO: add way to open camera to scan a QR code
    return (
      <React.Fragment>
        {sasBlock}
        {noCommonMethodBlock}
      </React.Fragment>
    );
  }

  private onReciprocateYesClick = () => {
    this.setState({ reciprocateButtonClicked: true });
    this.state.reciprocateQREvent.confirm();
  };

  private onReciprocateNoClick = () => {
    this.setState({ reciprocateButtonClicked: true });
    this.state.reciprocateQREvent.cancel();
  };

  private getDevice() {
    const deviceId = this.props.request && this.props.request.channel.deviceId;
    return matrix.getClient().getStoredDevice(matrix.getClient().getUserId(), deviceId);
  }

  private renderQRReciprocatePhase() {
    const { member, request } = this.props;
    const description = request.isSelfVerification
      ? _t('Almost there! Is your other session showing the same shield?')
      : _t('Almost there! Is {{displayName}} showing the same shield?', {
          displayName: member.displayName || member.name || member.userId,
        });
    let body: JSX.Element;
    if (this.state.reciprocateQREvent) {
      // Element Web doesn't support scanning yet, so assume here we're the client being scanned.
      //
      // we're passing both a label and a child string to Button as
      // FormButton and AccessibleButton expect this differently
      body = (
        <React.Fragment>
          <Text>{description}</Text>
          <E2EIcon isUser={true} status="verified" size={128} hideTooltip />
          <View>
            <Button
              label={_t('No')}
              type="danger"
              disabled={this.state.reciprocateButtonClicked}
              onPress={this.onReciprocateNoClick}
            />
            <Button
              label={_t('Yes')}
              type="primary"
              disabled={this.state.reciprocateButtonClicked}
              onPress={this.onReciprocateYesClick}
            />
          </View>
        </React.Fragment>
      );
    } else {
      body = (
        <Text>
          <Spinner />
        </Text>
      );
    }
    return (
      <View>
        <Text>{_t('Verify by scanning')}</Text>
        {body}
      </View>
    );
  }

  private renderVerifiedPhase() {
    const { member, request } = this.props;

    let text: string | null = null;
    if (!request.isSelfVerification) {
      if (this.props.isRoomEncrypted) {
        text = _t("Verify all users in a room to ensure it's secure.");
      } else {
        text = _t('In encrypted rooms, verify all users to ensure it’s secure.');
      }
    }

    let description: string;
    if (request.isSelfVerification) {
      const device = this.getDevice();
      if (!device) {
        // This can happen if the device is logged out while we're still showing verification
        // UI for it.
        console.warn("Verified device we don't know about: " + this.props.request.channel.deviceId);
        description = _t("You've successfully verified your device!");
      } else {
        description = _t("You've successfully verified {{deviceName}} ({{deviceId}})!", {
          deviceName: device ? device.getDisplayName() : '',
          deviceId: this.props.request.channel.deviceId,
        });
      }
    } else {
      description = _t("You've successfully verified {{displayName}}!", {
        displayName: member.displayName || member.name || member.userId,
      });
    }

    return (
      <View style={ThemedStyles.style.padding2x}>
        <Text style={[ThemedStyles.style.fontXXL, ThemedStyles.style.marginBottom]}>
          {_t('Verified')}
        </Text>
        <Text>{description}</Text>
        {text ? <Text>{text}</Text> : null}
        <View style={[ThemedStyles.style.centered, ThemedStyles.style.marginBottom2x]}>
          <E2EIcon isUser={true} status="verified" size={128} hideTooltip={true} />
        </View>
        <Button raised type="success" onPress={this.props.onClose} label={_t('Got it')} />
      </View>
    );
  }

  private renderCancelledPhase() {
    const { member, request } = this.props;

    let startAgainInstruction: string;
    if (request.isSelfVerification) {
      startAgainInstruction = _t('Start verification again from the notification.');
    } else {
      startAgainInstruction = _t('Start verification again from their profile.');
    }

    let text: string;
    if (request.cancellationCode === 'm.timeout') {
      text = _t('Verification timed out.') + ` ${startAgainInstruction}`;
    } else if (request.cancellingUserId === request.otherUserId) {
      if (request.isSelfVerification) {
        text = _t('You cancelled verification on your other session.');
      } else {
        text = _t('{{displayName}} cancelled verification.', {
          displayName: member.displayName || member.name || member.userId,
        });
      }
      text = `${text} ${startAgainInstruction}`;
    } else {
      text = _t('You cancelled verification.') + ` ${startAgainInstruction}`;
    }

    return (
      <View>
        <Text>{_t('Verification cancelled')}</Text>
        <Text>{text}</Text>

        <Button type="primary" onPress={this.props.onClose} label={_t('Got it')} />
      </View>
    );
  }

  public render() {
    const { member, phase, request } = this.props;

    const displayName = member.displayName || member.name || member.userId;

    switch (phase) {
      case PHASE_READY:
        return this.renderQRPhase();
      case PHASE_STARTED:
        switch (request.chosenMethod) {
          case verificationMethods.RECIPROCATE_QR_CODE:
            return this.renderQRReciprocatePhase();
          case verificationMethods.SAS: {
            const emojis = this.state.sasEvent ? (
              <VerificationShowSas
                displayName={displayName}
                device={this.getDevice()}
                sas={this.state.sasEvent.sas}
                onCancel={this.onSasMismatchesClick}
                onDone={this.onSasMatchesClick}
                inDialog={this.props.inDialog}
                isSelf={request.isSelfVerification}
              />
            ) : (
              <Spinner />
            );
            return <View>{emojis}</View>;
          }
          default:
            return null;
        }
      case PHASE_DONE:
        return this.renderVerifiedPhase();
      case PHASE_CANCELLED:
        return this.renderCancelledPhase();
    }
    console.error('VerificationPanel unhandled phase:', phase);
    return null;
  }

  private startSAS = async () => {
    this.setState({ emojiButtonClicked: true });
    const verifier = this.props.request.beginKeyVerification(verificationMethods.SAS);
    try {
      await verifier.verify();
    } catch (err) {
      console.error(err);
    }
  };

  private onSasMatchesClick = () => {
    this.state.sasEvent.confirm();
  };

  private onSasMismatchesClick = () => {
    this.state.sasEvent.mismatch();
  };

  private updateVerifierState = () => {
    const { request } = this.props;
    const { sasEvent, reciprocateQREvent } = request.verifier;
    request.verifier.off('show_sas', this.updateVerifierState);
    request.verifier.off('show_reciprocate_qr', this.updateVerifierState);
    this.setState({ sasEvent, reciprocateQREvent });
  };

  private onRequestChange = async () => {
    const { request } = this.props;
    const hadVerifier = this.hasVerifier;
    this.hasVerifier = !!request.verifier;
    if (!hadVerifier && this.hasVerifier) {
      request.verifier.on('show_sas', this.updateVerifierState);
      request.verifier.on('show_reciprocate_qr', this.updateVerifierState);
      try {
        // on the requester side, this is also awaited in startSAS,
        // but that's ok as verify should return the same promise.
        await request.verifier.verify();
      } catch (err) {
        console.error('error verify', err);
      }
    }
  };

  public componentDidMount() {
    const { request } = this.props;
    request.on('change', this.onRequestChange);
    if (request.verifier) {
      const { sasEvent, reciprocateQREvent } = request.verifier;
      this.setState({ sasEvent, reciprocateQREvent });
    }
    this.onRequestChange();
  }

  public componentWillUnmount() {
    const { request } = this.props;
    if (request.verifier) {
      request.verifier.off('show_sas', this.updateVerifierState);
      request.verifier.off('show_reciprocate_qr', this.updateVerifierState);
    }
    request.off('change', this.onRequestChange);
  }
}
