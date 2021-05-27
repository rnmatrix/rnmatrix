import React, { useCallback, useState, useRef, useEffect } from 'react';
import { View, Text } from 'react-native-animatable';
import { TextStyle } from 'react-native';
import ThemedStyles from '../styles/ThemedStyles';
import Selector from './Selector';

type InputSelectorPropsType = {
  data: Array<any>;
  valueExtractor: Function;
  keyExtractor: Function;
  onSelected: Function;
  selectTitle?: string;
  label: string;
  selected: any;
  textStyle?: TextStyle;
  backdropOpacity?: number;
  style?: any;
  disabled?: boolean;
};

const InputSelector = (props: InputSelectorPropsType) => {
  const theme = ThemedStyles.style;

  const [item, setItem] = useState(props.selected);

  let selectorRef = useRef<any>(null);

  const selected = useCallback(
    (item) => {
      const value = props.keyExtractor(item);
      setItem(value);
      props.onSelected(value);
    },
    [setItem, props],
  );

  useEffect(() => {
    setItem(props.selected);
  }, [props.selected]);

  const getValueOf = useCallback(
    (key) => {
      const item = props.data.find((item) => props.keyExtractor(item) === key);
      return props.valueExtractor(item);
    },
    [props],
  );

  return (
    <>
      <InputMenuWrapper style={props.style} label={props.label}>
        <Text
          style={[
            props.disabled ? theme.colorTertiaryText : theme.colorPrimaryText,
            theme.fontM,
          ]}
          onPress={() => !props.disabled && selectorRef.current?.show(item)}>
          {getValueOf(item)}
        </Text>
      </InputMenuWrapper>
      <Selector
        ref={selectorRef}
        onItemSelect={selected}
        title={props.selectTitle || ''}
        data={props.data}
        valueExtractor={props.valueExtractor}
        keyExtractor={props.keyExtractor}
        textStyle={props.textStyle}
        backdropOpacity={props.backdropOpacity}
      />
    </>
  );
};

export default InputSelector;

type InputMenuWrapperProps = {
  style?: any;
  label: string;
};

export const InputMenuWrapper: React.FC<InputMenuWrapperProps> = ({
  children,
  style,
  label,
}) => {
  const theme = ThemedStyles.style;

  return (
    <View style={[theme.backgroundPrimary, style]}>
      <View
        style={[
          theme.rowJustifySpaceBetween,
          theme.backgroundSecondary,
          theme.paddingVertical3x,
          theme.paddingHorizontal3x,
          theme.borderPrimary,
          theme.borderHair,
        ]}>
        <Text style={[theme.marginLeft, theme.colorSecondaryText, theme.fontM]}>
          {label}
        </Text>

        {children}
      </View>
    </View>
  );
};
