/*
Copyright 2017 Aidan Gauland
Copyright 2018 New Vector Ltd.
Copyright 2019 The Matrix.org Foundation C.I.C.

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
import PropTypes from 'prop-types';
import { View } from 'react-native';
import Button from './Button';

// TODO: translate
const _t = (s, obj?) => {
  if (!obj) return s;

  return s.replace(/(\{\{)(.*?)(\}\})/gm, Object.values(obj)[0]);
};

/**
 * Basic container for buttons in modal dialogs.
 */
export default class DialogButtons extends React.Component {
  static propTypes = {
    // The primary button which is styled differently and has default focus.
    primaryButton: PropTypes.node.isRequired,

    // A node to insert into the cancel button instead of default "Cancel"
    cancelButton: PropTypes.node,

    // If true, make the primary button a form submit button (input type="submit")
    primaryIsSubmit: PropTypes.bool,

    // onPress handler for the primary button.
    onPrimaryButtonClick: PropTypes.func,

    // should there be a cancel button? default: true
    hasCancel: PropTypes.bool,

    // The class of the cancel button, only used if a cancel button is
    // enabled
    cancelButtonClass: PropTypes.node,

    // onPress handler for the cancel button.
    onCancel: PropTypes.func,

    focus: PropTypes.bool,

    // disables the primary and cancel buttons
    disabled: PropTypes.bool,

    // disables only the primary button
    primaryDisabled: PropTypes.bool,

    // something to stick next to the buttons, optionally
    additive: PropTypes.element,
  };

  static defaultProps = {
    hasCancel: true,
    disabled: false,
  };

  _onCancelClick = () => {
    this.props.onCancel();
  };

  render() {
    let cancelButton;

    if (this.props.cancelButton || this.props.hasCancel) {
      cancelButton = (
        <Button
          raised
          // important: the default type is 'submit' and this button comes before the
          // primary in the DOM so will get form submissions unless we make it not a submit.
          label={this.props.cancelButton || _t('Cancel')}
          onPress={this._onCancelClick}
          // className={this.props.cancelButtonClass}
          disabled={this.props.disabled}
        />
      );
    }

    let additive = null;
    if (this.props.additive) {
      additive = <View>{this.props.additive}</View>;
    }

    return (
      <View>
        {additive}
        {cancelButton}
        {this.props.children}
        <Button
          raised
          type={this.props.primaryIsSubmit ? 'submit' : 'button'}
          label={this.props.primaryButton}
          onPress={this.props.onPrimaryButtonClick}
          autoFocus={this.props.focus}
          disabled={this.props.disabled || this.props.primaryDisabled}
        />
      </View>
    );
  }
}