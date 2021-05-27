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

import EventEmitter from 'events';
import matrix from '../../services/matrix';
import { accessSecretStorage, AccessCancelledError } from '../SecurityManager';
import { PHASE_DONE as VERIF_PHASE_DONE } from "matrix-js-sdk/src/crypto/verification/request/VerificationRequest";

export const PHASE_INTRO = 0;
export const PHASE_BUSY = 1;
export const PHASE_DONE = 2;    //final done stage, but still showing UX
export const PHASE_CONFIRM_SKIP = 3;
export const PHASE_FINISHED = 4; //UX can be closed

export class SetupEncryptionStore extends EventEmitter {
    public static sharedInstance: SetupEncryptionStore;

    static makeShared() {
        SetupEncryptionStore.sharedInstance = new SetupEncryptionStore();
        return SetupEncryptionStore.sharedInstance;
    }

    start() {
        if (this._started) {
            return;
        }
        this._started = true;
        this.phase = PHASE_BUSY;
        this.verificationRequest = null;
        this.backupInfo = null;

        // ID of the key that the secrets we want are encrypted with
        this.keyId = null;
        // Descriptor of the key that the secrets we want are encrypted with
        this.keyInfo = null;

        const cli = matrix.getClient();
        cli.on("crypto.verification.request", this.onVerificationRequest);
        cli.on('userTrustStatusChanged', this._onUserTrustStatusChanged);

        const requestsInProgress = cli.getVerificationRequestsToDeviceInProgress(cli.getUserId());
        if (requestsInProgress.length) {
            // If there are multiple, we take the most recent. Equally if the user sends another request from
            // another device after this screen has been shown, we'll switch to the new one, so this
            // generally doesn't support multiple requests.
            this._setActiveVerificationRequest(requestsInProgress[requestsInProgress.length - 1]);
        }

        this.fetchKeyInfo();
    }

    stop() {
        if (!this._started) {
            return;
        }
        this._started = false;
        if (this.verificationRequest) {
            this.verificationRequest.off("change", this.onVerificationRequestChange);
        }
        if (matrix.getClient()) {
            matrix.getClient().removeListener("crypto.verification.request", this.onVerificationRequest);
            matrix.getClient().removeListener('userTrustStatusChanged', this._onUserTrustStatusChanged);
        }
    }

    async fetchKeyInfo() {
        const keys = await matrix.getClient().isSecretStored('m.cross_signing.master', false);
        if (keys === null || Object.keys(keys).length === 0) {
            this.keyId = null;
            this.keyInfo = null;
        } else {
            // If the secret is stored under more than one key, we just pick an arbitrary one
            this.keyId = Object.keys(keys)[0];
            this.keyInfo = keys[this.keyId];
        }

        this.phase = PHASE_INTRO;
        this.emit("update");
    }

    async usePassPhrase() {
        console.log('usePassPhrase')
        this.phase = PHASE_BUSY;
        this.emit("update");
        const cli = matrix.getClient();
        try {
            const backupInfo = await cli.getKeyBackupVersion();
            console.log('backupInfo', backupInfo)
            this.backupInfo = backupInfo;
            console.log('running update')
            // this.emit("update");
            console.log('update ran')
            // The control flow is fairly twisted here...
            // For the purposes of completing security, we only wait on getting
            // as far as the trust check and then show a green shield.
            // We also begin the key backup restore as well, which we're
            // awaiting inside `accessSecretStorage` only so that it keeps your
            // passphase cached for that work. This dialog itself will only wait
            // on the first trust check, and the key backup restore will happen
            // in the background.
            console.log('running Promise')
            await new Promise((resolve, reject) => {
                console.log('inside Promise')
                try {
                    console.log('accessSecretStorage')
                    accessSecretStorage(async () => {
                        console.log('checkOwnCrossSigningTrust')
                        await cli.checkOwnCrossSigningTrust();
                        console.log('checkOwnCrossSigningTrust success')
                        resolve();
                        if (backupInfo) {
                            // A complete restore can take many minutes for large
                            // accounts / slow servers, so we allow the dialog
                            // to advance before this.
                            await cli.restoreKeyBackupWithSecretStorage(backupInfo);
                        }
                    }).catch(reject);
                } catch (e) {
                    console.log('Err')
                    console.error(e);
                    reject(e);
                }
                console.log('done')
            });

            if (cli.getCrossSigningId()) {
                this.phase = PHASE_DONE;
                this.emit("update");
            }
        } catch (e) {
            if (!(e instanceof AccessCancelledError)) {
                console.log(e);
            }
            // this will throw if the user hits cancel, so ignore
            this.phase = PHASE_INTRO;
            this.emit("update");
        }
    }

    _onUserTrustStatusChanged = (userId) => {
        if (userId !== matrix.getClient().getUserId()) return;
        const publicKeysTrusted = matrix.getClient().getCrossSigningId();
        if (publicKeysTrusted) {
            this.phase = PHASE_DONE;
            this.emit("update");
        }
    }

    onVerificationRequest = (request) => {
        this._setActiveVerificationRequest(request);
    }

    onVerificationRequestChange = () => {
        if (this.verificationRequest.cancelled) {
            this.verificationRequest.off("change", this.onVerificationRequestChange);
            this.verificationRequest = null;
            this.emit("update");
        } else if (this.verificationRequest.phase === VERIF_PHASE_DONE) {
            this.verificationRequest.off("change", this.onVerificationRequestChange);
            this.verificationRequest = null;
            // At this point, the verification has finished, we just need to wait for
            // cross signing to be ready to use, so wait for the user trust status to
            // change (or change to DONE if it's already ready).
            const publicKeysTrusted = matrix.getClient().getCrossSigningId();
            this.phase = publicKeysTrusted ? PHASE_DONE : PHASE_BUSY;
            this.emit("update");
        }
    }

    skip() {
        this.phase = PHASE_CONFIRM_SKIP;
        this.emit("update");
    }

    skipConfirm() {
        this.phase = PHASE_FINISHED;
        this.emit("update");
    }

    returnAfterSkip() {
        this.phase = PHASE_INTRO;
        this.emit("update");
    }

    done() {
        this.phase = PHASE_FINISHED;
        this.emit("update");
        // async - ask other clients for keys, if necessary
        matrix.getClient()._crypto.cancelAndResendAllOutgoingKeyRequests();
    }

    async _setActiveVerificationRequest(request) {
        if (request.otherUserId !== matrix.getClient().getUserId()) return;

        if (this.verificationRequest) {
            this.verificationRequest.off("change", this.onVerificationRequestChange);
        }
        this.verificationRequest = request;
        await request.accept();
        request.on("change", this.onVerificationRequestChange);
        this.emit("update");
    }
}