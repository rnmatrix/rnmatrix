/*
Copyright 2015, 2016 OpenMarket Ltd

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
import { TextInput, View } from 'react-native';
// import Select from '../../../../../common/components/controls/Select';
// import Input from '../../../../../common/components/Input';
import InputSelector, {
  InputMenuWrapper,
} from '../../../common/InputSelector';
import ThemedStyles from '../../../styles/ThemedStyles';
import * as Roles from './Roles';

// TODO: translate
const _t = (s, obj?) => s;

interface PowerSelectorProps {
  value: string;
  // The maximum value that can be set with the power selector
  maxValue: number;

  // Default user power level for the room
  usersDefault: number;

  // should the user be able to change the value? false by default.
  disabled?: boolean;
  onChange: (value: string, powerLevelKey?: string) => any; // TODO

  // Optional key to pass as the second argument to `onChange`
  powerLevelKey?: string;

  // The name to annotate the selector with
  label?: string;
}

interface PowerSelectorState {
  levelRoleMap: any;
  // List of power levels to show in the drop-down
  options: any[];

  custom?: boolean;
  customValue: string;
  customLevel?: number;
  selectValue: number;
}

export default class PowerSelector extends React.Component<
  PowerSelectorProps,
  PowerSelectorState
> {
  static defaultProps = {
    maxValue: Infinity,
    usersDefault: 0,
  };

  private textInputRef;

  constructor(props) {
    super(props);

    this.state = {
      levelRoleMap: {},
      // List of power levels to show in the drop-down
      options: [],

      customValue: this.props.value,
      selectValue: 0,
    };
  }

  // TODO: [REACT-WARNING] Replace with appropriate lifecycle event
  // eslint-disable-next-line camelcase
  UNSAFE_componentWillMount() {
    this._initStateFromProps(this.props);
  }

  // eslint-disable-next-line camelcase
  UNSAFE_componentWillReceiveProps(newProps) {
    this._initStateFromProps(newProps);
  }

  _initStateFromProps(newProps) {
    // This needs to be done now because levelRoleMap has translated strings
    const levelRoleMap = Roles.levelRoleMap(newProps.usersDefault);
    const options = Object.keys(levelRoleMap).filter((level) => {
      return (
        level === undefined ||
        level <= newProps.maxValue ||
        level == newProps.value
      );
    });

    const isCustom = levelRoleMap[newProps.value] === undefined;

    this.setState({
      levelRoleMap,
      options,
      custom: isCustom,
      customLevel: newProps.value,
      customValue: newProps.value,
      selectValue: isCustom ? 'SELECT_VALUE_CUSTOM' : newProps.value,
    });
  }

  onSelectChange = (value) => {
    const isCustom = value === 'SELECT_VALUE_CUSTOM';
    if (isCustom) {
      this.setState({ custom: true });
    } else {
      this.props.onChange(value, this.props.powerLevelKey);
      this.setState({ selectValue: value });
    }
  };

  onCustomChange = (text) => {
    this.setState({ customValue: text });
  };

  onCustomBlur = () =>
    this.props.onChange(
      this.state.customValue,
      this.props.powerLevelKey,
    );

  onCustomKeyDown = () => {
    if (this.textInputRef) {
      this.textInputRef.blur();
    }
    // if (event.key === Key.ENTER) {
    //   event.preventDefault();
    //   event.stopPropagation();
    //
    //   // Do not call the onChange handler directly here - it can cause an infinite loop.
    //   // Long story short, a user hits Enter to submit the value which onChange handles as
    //   // raising a dialog which causes a blur which causes a dialog which causes a blur and
    //   // so on. By not causing the onChange to be called here, we avoid the loop because we
    //   // handle the onBlur safely.
    //   event.target.blur();
    // }
  };

  render() {
    let picker;
    const label =
      typeof this.props.label === 'undefined'
        ? _t('Power level')
        : this.props.label;
    if (this.state.custom) {
      picker = (
        <InputMenuWrapper
          label={label}
          style={ThemedStyles.style.paddingBottom2x}>
          <TextInput
            ref={(ref) => (this.textInputRef = ref)}
            keyboardType="number-pad"
            // max={this.props.maxValue}
            onBlur={this.onCustomBlur}
            selectTextOnFocus
            onSubmitEditing={this.onCustomKeyDown}
            onChangeText={this.onCustomChange}
            value={String(this.state.customValue)}
            editable={!this.props.disabled}
            style={{
              width: 50,
              textAlign: 'center',
              padding: 0,
            }}
          />
        </InputMenuWrapper>
      );
    } else {
      // Each level must have a definition in this.state.levelRoleMap
      let options: any[] = this.state.options.map((level) => {
        return {
          value: level,
          text: Roles.textualPowerLevel(level, this.props.usersDefault),
        };
      });
      options.push({ value: 'SELECT_VALUE_CUSTOM', text: _t('Custom level') });

      picker = (
        <InputSelector
          // element="select"
          label={label}
          onSelected={this.onSelectChange}
          selected={String(this.state.selectValue)}
          disabled={this.props.disabled}
          keyExtractor={(item) => item.value}
          valueExtractor={(item) => item.text}
          data={options.filter(Boolean)}
          style={ThemedStyles.style.paddingBottom2x}
        />
      );
    }

    return <View>{picker}</View>;
  }
}
