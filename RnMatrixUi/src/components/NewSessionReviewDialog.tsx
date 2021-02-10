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

import PropTypes from 'prop-types';
import React, { useCallback, useMemo } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DialogButtons from '../common/DialogButtons';
import Spinner from '../common/Spinner';
import Header from '../scenes/newRoom/components/Header';
import { NewRoomScreens } from '../scenes/newRoom/NewRoomScreen';
import ThemedStyles from '../styles/ThemedStyles';

const IS_IOS = Platform.OS === 'ios';

// TODO: translate
const _t = (s, obj?) => {
  if (!obj) return s;

  return s.replace(/(\{\{)(.*?)(\}\})/gm, Object.values(obj)[0]);
};

const NewSessionReviewDialog = ({ device }) => {
  const theme = ThemedStyles.style;
  // static propTypes = {
  //   userId: PropTypes.string.isRequired,
  //   device: PropTypes.object.isRequired,
  //   onFinished: PropTypes.func.isRequired,
  // };

  const onCancelClick = () => {
    // Modal.createTrackedDialog("Verification failed", "insecure", ErrorDialog, {
    //     headerImage: require("../../../../res/img/e2e/warning.svg"),
    //     title: _t("Your account is not secure"),
    //     description: <View>
    //         {_t("One of the following may be compromised:")}
    //         <ul>
    //             <li>{_t("Your password")}</li>
    //             <li>{_t("Your homeserver")}</li>
    //             <li>{_t("This session, or the other session")}</li>
    //             <li>{_t("The internet connection either session is using")}</li>
    //         </ul>
    //         <View>
    //             {_t("We recommend you change your password and recovery key in Settings immediately")}
    //         </View>
    //     </View>,
    //     onFinished: () => this.props.onFinished(false),
    // });
  };

  const onContinueClick = () => {
    // const { userId, device } = this.props;
    // const cli = MatrixClientPeg.get();
    // const requestPromise = cli.requestVerification(
    //     userId,
    //     [device.deviceId],
    // );
    //
    // this.props.onFinished(true);
    // Modal.createTrackedDialog('New Session Verification', 'Starting dialog', VerificationRequestDialog, {
    //     verificationRequestPromise: requestPromise,
    //     member: cli.getUser(userId),
    // });
  };

  const insets = useSafeAreaInsets();
  const cleanTop = useMemo(
    () => ({
      marginTop: insets.top + (IS_IOS ? 100 : 90),
    }),
    []
  );

  const onBack = useCallback(() => {
    // go back please
  }, []);

  // const icon = <View />;

  return (
    <View style={[cleanTop, styles.container, theme.backgroundPrimary]}>
      <Header
        leftIcon={
          <Pressable style={styles.headerLeftIconWrapper} hitSlop={50} onPress={onBack}>
            <Text style={[theme.fontL, theme.bold]}>Close</Text>
          </Pressable>
        }
        title={_t('New session')}
        // rightIcon={
        //   loading ? (
        //     <View style={styles.headerRightIconWrapper}>
        //       <Spinner size={'small'} />
        //     </View>
        //   ) : (
        //     <Pressable style={styles.headerRightIconWrapper} hitSlop={50} onPress={onDone}>
        //       <Text style={[theme.fontL, theme.bold]}>{doneTitle}</Text>
        //     </Pressable>
        //   )
        // }
      />
      <Text>
        {_t(
          'Use this session to verify your new one, ' + 'granting it access to encrypted messages:'
        )}
      </Text>
      <Text>{device?.getDisplayName()}</Text>
      <Text>({device?.deviceId})</Text>
      <Text>
        {_t('If you didn’t sign in to this session, ' + 'your account may be compromised.')}
      </Text>
      <DialogButtons
        cancelButton={_t("This wasn't me")}
        cancelButtonClass="danger"
        primaryButton={_t('Continue')}
        onCancel={onCancelClick}
        onPrimaryButtonClick={onContinueClick}
      />
    </View>
  );
};

export default NewSessionReviewDialog;

const styles = StyleSheet.create({
  headerRightIconWrapper: { position: 'absolute', right: 20 },
  headerLeftIconWrapper: { position: 'absolute', left: 20 },
  container: {
    flex: 1,
    borderTopRightRadius: 15,
    borderTopLeftRadius: 15,
    overflow: 'hidden',
  },
});
