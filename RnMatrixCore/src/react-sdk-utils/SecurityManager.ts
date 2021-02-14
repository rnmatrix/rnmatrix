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

import { ICryptoCallbacks, IDeviceTrustLevel, ISecretStorageKeyInfo } from 'matrix-js-sdk/src/matrix';
import { MatrixClient } from 'matrix-js-sdk/src/client';
import { showModal } from '@rn-matrix/ui/src/common/Modal';
import matrix from '../services/matrix';
import { deriveKey } from 'matrix-js-sdk/src/crypto/key_passphrase';
import { decodeRecoveryKey } from 'matrix-js-sdk/src/crypto/recoverykey';
import { encodeBase64 } from "matrix-js-sdk/src/crypto/olmlib";
import { confirm } from './modals';
import { isSecureBackupRequired } from './WellKnownUtils';

// TODO: translate
const _t = (s, obj?) => {
    if (!obj) return s;

    return s.replace(/(\{\{)(.*?)(\}\})/gm, Object.values(obj)[0]);
};

// FIXME
const SettingsStore = {
    getValue(item) {
        // feature_dehydration
        return true;
    }
}

// This stores the secret storage private keys in memory for the JS SDK. This is
// only meant to act as a cache to avoid prompting the user multiple times
// during the same single operation. Use `accessSecretStorage` below to scope a
// single secret storage operation, as it will clear the cached keys once the
// operation ends.
let secretStorageKeys: Record<string, Uint8Array> = {};
let secretStorageKeyInfo: Record<string, ISecretStorageKeyInfo> = {};
let secretStorageBeingAccessed = false;

let nonInteractive = false;

let dehydrationCache: {
    key?: Uint8Array,
    keyInfo?: ISecretStorageKeyInfo,
} = {};

function isCachingAllowed(): boolean {
    return secretStorageBeingAccessed;
}

/**
 * This can be used by other components to check if secret storage access is in
 * progress, so that we can e.g. avoid intermittently showing toasts during
 * secret storage setup.
 *
 * @returns {bool}
 */
export function isSecretStorageBeingAccessed(): boolean {
    return secretStorageBeingAccessed;
}

export class AccessCancelledError extends Error {
    constructor() {
        super("Secret storage access canceled");
    }
}

async function confirmToDismiss(): Promise<boolean> {
    const [sure] = await confirm({
        title: _t("Cancel entering passphrase?"),
        description: _t("Are you sure you want to cancel entering passphrase?"),
        danger: false,
        action: _t("Go Back"),
    })
    return sure;
}

function makeInputToKey(
    keyInfo: ISecretStorageKeyInfo,
): (keyParams: { passphrase: string, recoveryKey: string }) => Promise<Uint8Array> {
    return async ({ passphrase, recoveryKey }) => {
        if (passphrase) {
            return deriveKey(
                passphrase,
                keyInfo.passphrase?.salt,
                keyInfo.passphrase?.iterations,
            );
        } else {
            return decodeRecoveryKey(recoveryKey);
        }
    };
}

async function getSecretStorageKey(
    { keys: keyInfos }: { keys: Record<string, ISecretStorageKeyInfo> },
    ssssItemName,
): Promise<[string, Uint8Array]> {
    const keyInfoEntries = Object.entries(keyInfos);
    if (keyInfoEntries.length > 1) {
        throw new Error("Multiple storage key requests not implemented");
    }
    const [keyId, keyInfo] = keyInfoEntries[0];

    // Check the in-memory cache
    if (isCachingAllowed() && secretStorageKeys[keyId]) {
        return [keyId, secretStorageKeys[keyId]];
    }

    if (dehydrationCache.key) {
        if (await matrix.getClient().checkSecretStorageKey(dehydrationCache.key, keyInfo)) {
            cacheSecretStorageKey(keyId, keyInfo, dehydrationCache.key);
            return [keyId, dehydrationCache.key];
        }
    }

    if (nonInteractive) {
        throw new Error("Could not unlock non-interactively");
    }

    const inputToKey = makeInputToKey(keyInfo);
    const input = await showModal(
      'AccessSecretStorageDialog',
      {
          keyInfo,
          checkPrivateKey: async (input) => {
              const key = await inputToKey(input);
              return await matrix.getClient().checkSecretStorageKey(key, keyInfo);
          },
      },
    )
    if (!input) {
        throw new AccessCancelledError();
    }
    const key = await inputToKey(input);

    // Save to cache to avoid future prompts in the current session
    cacheSecretStorageKey(keyId, keyInfo, key);

    return [keyId, key];
}

export async function getDehydrationKey(
    keyInfo: ISecretStorageKeyInfo,
    checkFunc: (Uint8Array) => void,
): Promise<Uint8Array> {
    const inputToKey = makeInputToKey(keyInfo);
    const input = await showModal(
      'AccessSecretStorageDialog',
      {
          keyInfo,
          checkPrivateKey: async (input) => {
              console.log('checkPrivateKey 2', input)
              const key = await inputToKey(input);
              try {
                  checkFunc(key);
                  return true;
              } catch (e) {
                  return false;
              }
          },
      },
    )
    if (!input) {
        throw new AccessCancelledError();
    }
    const key = await inputToKey(input);

    // need to copy the key because rehydration (unpickling) will clobber it
    dehydrationCache = {key: new Uint8Array(key), keyInfo};

    return key;
}

function cacheSecretStorageKey(
    keyId: string,
    keyInfo: ISecretStorageKeyInfo,
    key: Uint8Array,
): void {
    if (isCachingAllowed()) {
        secretStorageKeys[keyId] = key;
        secretStorageKeyInfo[keyId] = keyInfo;
    }
}

async function onSecretRequested(
    userId: string,
    deviceId: string,
    requestId: string,
    name: string,
    deviceTrust: IDeviceTrustLevel,
): Promise<string | undefined> {
    console.log("onSecretRequested", userId, deviceId, requestId, name, deviceTrust);
    const client = matrix.getClient();
    if (userId !== client.getUserId()) {
        return;
    }
    if (!deviceTrust || !deviceTrust.isVerified()) {
        console.log(`Ignoring secret request from untrusted device ${deviceId}`);
        return;
    }
    if (
        name === "m.cross_signing.master" ||
        name === "m.cross_signing.self_signing" ||
        name === "m.cross_signing.user_signing"
    ) {
        const callbacks = client.getCrossSigningCacheCallbacks();
        if (!callbacks.getCrossSigningKeyCache) return;
        const keyId = name.replace("m.cross_signing.", "");
        const key = await callbacks.getCrossSigningKeyCache(keyId);
        if (!key) {
            console.log(
                `${keyId} requested by ${deviceId}, but not found in cache`,
            );
        }
        return key && encodeBase64(key);
    } else if (name === "m.megolm_backup.v1") {
        const key = await client._crypto.getSessionBackupPrivateKey();
        if (!key) {
            console.log(
                `session backup key requested by ${deviceId}, but not found in cache`,
            );
        }
        return key && encodeBase64(key);
    }
    console.warn("onSecretRequested didn't recognise the secret named ", name);
}

export const crossSigningCallbacks: ICryptoCallbacks = {
    getSecretStorageKey,
    cacheSecretStorageKey,
    // @ts-ignore
    onSecretRequested,
    getDehydrationKey,
};

export async function promptForBackupPassphrase(): Promise<Uint8Array> {
    let key;

    const [success] = await showModal(
      // FIXME
      // RestoreKeyBackupDialog,
      'RestoreKeyBackupDialog',
      {
          showSummary: false, keyCallback: k => key = k,
      }
    )

    if (!success) throw new Error("Key backup prompt cancelled");

    return key;
}

/**
 * This helper should be used whenever you need to access secret storage. It
 * ensures that secret storage (and also cross-signing since they each depend on
 * each other in a cycle of sorts) have been bootstrapped before running the
 * provided function.
 *
 * Bootstrapping secret storage may take one of these paths:
 * 1. Create secret storage from a passphrase and store cross-signing keys
 *    in secret storage.
 * 2. Access existing secret storage by requesting passphrase and accessing
 *    cross-signing keys as needed.
 * 3. All keys are loaded and there's nothing to do.
 *
 * Additionally, the secret storage keys are cached during the scope of this function
 * to ensure the user is prompted only once for their secret storage
 * passphrase. The cache is then cleared once the provided function completes.
 *
 * @param {Function} [func] An operation to perform once secret storage has been
 * bootstrapped. Optional.
 * @param {bool} [forceReset] Reset secret storage even if it's already set up
 */
export async function accessSecretStorage(func = async () => { }, forceReset = false) {
    debugger;
    const cli = matrix.getClient();
    secretStorageBeingAccessed = true;
    try {
        if (!await cli.hasSecretStorageKey() || forceReset) {
            // This dialog calls bootstrap itself after guiding the user through
            // passphrase creation.
            // TODO: CreateSecretStorageDialog
            // const [confirmed] = await showModal(
            //   'CreateSecretStorageDialog', // CreateSecretStorageDialog,
            //   {
            //       forceReset,
            //   }
            // )
            // if (!confirmed) {
            //     throw new Error("Secret storage creation canceled");
            // }
        } else {
            await cli.bootstrapCrossSigning({
                authUploadDeviceSigningKeys: async (makeRequest) => {
                    console.log('authUploadDeviceSigningKeys')
                    // FIXME
                    // const { finished } = Modal.createTrackedDialog(
                    //     'Cross-signing keys dialog', '', InteractiveAuthDialog,
                    //     {
                    //         title: _t("Setting up keys"),
                    //         matrixClient: cli,
                    //         makeRequest,
                    //     },
                    // );
                    // const [confirmed] = await finished;
                    // if (!confirmed) {
                    //     throw new Error("Cross-signing key upload auth canceled");
                    // }
                },
            });
            await cli.bootstrapSecretStorage({
                getKeyBackupPassphrase: promptForBackupPassphrase,
            });

            const keyId = Object.keys(secretStorageKeys)[0];
            if (keyId && SettingsStore.getValue("feature_dehydration")) {
                let dehydrationKeyInfo = {};
                if (secretStorageKeyInfo[keyId] && secretStorageKeyInfo[keyId].passphrase) {
                    dehydrationKeyInfo = { passphrase: secretStorageKeyInfo[keyId].passphrase };
                }
                console.log("Setting dehydration key");
                await cli.setDehydrationKey(secretStorageKeys[keyId], dehydrationKeyInfo, "Backup device");
            } else if (!keyId) {
                console.warn("Not setting dehydration key: no SSSS key found");
            } else {
                console.log("Not setting dehydration key: feature disabled");
            }
        }

        // `return await` needed here to ensure `finally` block runs after the
        // inner operation completes.
        return await func();
    } finally {
        // Clear secret storage key cache now that work is complete
        secretStorageBeingAccessed = false;
        if (!isCachingAllowed()) {
            secretStorageKeys = {};
            secretStorageKeyInfo = {};
        }
    }
}

// FIXME: this function name is a bit of a mouthful
export async function tryToUnlockSecretStorageWithDehydrationKey(
    client: MatrixClient,
): Promise<void> {
    const key = dehydrationCache.key;
    let restoringBackup = false;
    if (key && await client.isSecretStorageReady()) {
        console.log("Trying to set up cross-signing using dehydration key");
        secretStorageBeingAccessed = true;
        nonInteractive = true;
        try {
            await client.checkOwnCrossSigningTrust();

            // we also need to set a new dehydrated device to replace the
            // device we rehydrated
            let dehydrationKeyInfo = {};
            if (dehydrationCache.keyInfo && dehydrationCache.keyInfo.passphrase) {
                dehydrationKeyInfo = { passphrase: dehydrationCache.keyInfo.passphrase };
            }
            await client.setDehydrationKey(key, dehydrationKeyInfo, "Backup device");

            // and restore from backup
            const backupInfo = await client.getKeyBackupVersion();
            if (backupInfo) {
                restoringBackup = true;
                // don't await, because this can take a long time
                client.restoreKeyBackupWithSecretStorage(backupInfo)
                    .finally(() => {
                        secretStorageBeingAccessed = false;
                        nonInteractive = false;
                        if (!isCachingAllowed()) {
                            secretStorageKeys = {};
                            secretStorageKeyInfo = {};
                        }
                    });
            }
        } finally {
            dehydrationCache = {};
            // the secret storage cache is needed for restoring from backup, so
            // don't clear it yet if we're restoring from backup
            if (!restoringBackup) {
                secretStorageBeingAccessed = false;
                nonInteractive = false;
                if (!isCachingAllowed()) {
                    secretStorageKeys = {};
                    secretStorageKeyInfo = {};
                }
            }
        }
    }
}
