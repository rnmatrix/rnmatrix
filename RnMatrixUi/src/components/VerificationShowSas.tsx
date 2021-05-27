/*
Copyright 2019 Vector Creations Ltd

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
import React from 'react';
import { Text, View } from 'react-native';
import Button from '../common/Button';
import ThemedStyles from '../styles/ThemedStyles';
import { PendingActionSpinner } from './EncryptionInfo';

// TODO: translate
const _t = (s, obj?) => {
  if (!obj) return s;

  let count = 0

  return s.replace(/(\{\{)(.*?)(\}\})/gm, (substring: string) => {
    const value = Object.values(obj)[count];
    count++;
    return value;
  });
};

// TODO: translate
const _td = (s, obj?) => {
  if (!obj) return s;

  return s.replace(/(\{\{)(.*?)(\}\})/gm, Object.values(obj)[0]);
};

function capFirst(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default class VerificationShowSas extends React.Component<any, any> {
  static propTypes = {
    pending: PropTypes.bool,
    displayName: PropTypes.string, // required if pending is true
    device: PropTypes.object,
    onDone: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    sas: PropTypes.object.isRequired,
    isSelf: PropTypes.bool,
    inDialog: PropTypes.bool, // whether this component is being shown in a dialog and to use DialogButtons
  };

  constructor(props) {
    super(props);

    this.state = {
      pending: false,
    };
  }

  onMatchClick = () => {
    this.setState({ pending: true });
    this.props.onDone();
  };

  onDontMatchClick = () => {
    this.setState({ cancelling: true });
    this.props.onCancel();
  };

  render() {
    const theme = ThemedStyles.style;

    let sasDisplay;
    let sasCaption;
    if (this.props.sas.emoji) {
      const emojiBlocks = this.props.sas.emoji.map((emoji, i) => (
        <View key={i} style={[theme.padding2x, theme.centered]}>
          <Text
            style={{
              fontSize: 40,
            }}>
            {emoji[0]}
          </Text>
          <Text>{_t(capFirst(emoji[1]))}</Text>
        </View>
      ));
      sasDisplay = (
        <View>
          <View style={[theme.rowJustifyCenter]}>{emojiBlocks.slice(0, 4)}</View>
          <View style={theme.rowJustifyCenter}>{emojiBlocks.slice(4)}</View>
        </View>
      );
      sasCaption = this.props.isSelf
        ? _t('Confirm the emoji below are displayed on both sessions, in the same order:')
        : _t('Verify this user by confirming the following emoji appear on their screen.');
    } else if (this.props.sas.decimal) {
      const numberBlocks = this.props.sas.decimal.map((num, i) => <span key={i}>{num}</span>);
      sasDisplay = <View>{numberBlocks}</View>;
      sasCaption = this.props.isSelf
        ? _t('Verify this session by confirming the following number appears on its screen.')
        : _t('Verify this user by confirming the following number appears on their screen.');
    } else {
      return (
        <View>
          {_t('Unable to find a supported verification method.')}
          <Button type="primary" onPress={this.props.onCancel} label={_t('Cancel')} />
        </View>
      );
    }

    let confirm;
    if (this.state.pending || this.state.cancelling) {
      let text;
      if (this.state.pending) {
        if (this.props.isSelf) {
          // device shouldn't be null in this situation but it can be, eg. if the device is
          // logged out during verification
          if (this.props.device) {
            text = _t('Waiting for your other session, {{deviceName}} ({{deviceId}}), to verify…', {
              deviceName: this.props.device ? this.props.device.getDisplayName() : '',
              deviceId: this.props.device ? this.props.device.deviceId : '',
            });
          } else {
            text = _t('Waiting for your other session to verify…');
          }
        } else {
          const { displayName } = this.props;
          text = _t('Waiting for {{displayName}} to verify…', { displayName });
        }
      } else {
        text = _t('Cancelling…');
      }
      confirm = <PendingActionSpinner text={text} />;
    } else {
      confirm = (
        <React.Fragment>
          <Button
            onPress={this.onDontMatchClick}
            type="danger"
            raised
            label={_t("They don't match")}
            style={theme.marginBottom2x}
          />
          <Button
            onPress={this.onMatchClick}
            type="success"
            raised
            label={_t('They match')}
          />
        </React.Fragment>
      );
    }

    return (
      <View style={theme.padding2x}>
        <Text>{sasCaption}</Text>
        {sasDisplay}
        <Text>
          {this.props.isSelf
            ? ''
            : _t('To be secure, do this in person or use a trusted way to communicate.')}
        </Text>
        {confirm}
      </View>
    );
  }
}

// List of Emoji strings from the js-sdk, for i18n
_td('Dog');
_td('Cat');
_td('Lion');
_td('Horse');
_td('Unicorn');
_td('Pig');
_td('Elephant');
_td('Rabbit');
_td('Panda');
_td('Rooster');
_td('Penguin');
_td('Turtle');
_td('Fish');
_td('Octopus');
_td('Butterfly');
_td('Flower');
_td('Tree');
_td('Cactus');
_td('Mushroom');
_td('Globe');
_td('Moon');
_td('Cloud');
_td('Fire');
_td('Banana');
_td('Apple');
_td('Strawberry');
_td('Corn');
_td('Pizza');
_td('Cake');
_td('Heart');
_td('Smiley');
_td('Robot');
_td('Hat');
_td('Glasses');
_td('Spanner');
_td('Santa');
_td('Thumbs up');
_td('Umbrella');
_td('Hourglass');
_td('Clock');
_td('Gift');
_td('Light bulb');
_td('Book');
_td('Pencil');
_td('Paperclip');
_td('Scissors');
_td('Lock');
_td('Key');
_td('Hammer');
_td('Telephone');
_td('Flag');
_td('Train');
_td('Bicycle');
_td('Aeroplane');
_td('Rocket');
_td('Trophy');
_td('Ball');
_td('Guitar');
_td('Trumpet');
_td('Bell');
_td('Anchor');
_td('Headphones');
_td('Folder');
_td('Pin');
