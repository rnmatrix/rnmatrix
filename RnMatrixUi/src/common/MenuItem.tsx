import React from 'react';
import { TextStyle } from 'react-native';
import { ListItem } from 'react-native-elements';
import ThemedStyles from '../styles/ThemedStyles';

export type MenuItemItem = {
  onPress?: () => void;
  title: string | JSX.Element;
  description?: string | JSX.Element;
  icon?:
    | {
        name: string;
        type?: string;
        color?: string;
      }
    | JSX.Element;
  noIcon?: boolean;
};

export type MenuItemPropsType = {
  item: MenuItemItem;
  component?: any;
  containerItemStyle?: {} | [];
  titleStyle?: TextStyle | Array<TextStyle>;
  chevronStyle?: TextStyle | Array<TextStyle>;
  disabled?: boolean;
  testID?: string;
};

export default function ({
  item,
  component,
  containerItemStyle,
  testID,
  titleStyle,
  chevronStyle,
  disabled,
}: MenuItemPropsType) {
  const theme = ThemedStyles.style;

  // ListItem Container Style
  const containerStyle = [
    theme.backgroundSecondary,
    theme.borderTopHair,
    theme.borderBottomHair,
    theme.borderPrimary,
    theme.padding0x,
    theme.paddingHorizontal4x,
    containerItemStyle,
  ];

  // icon is element?
  const isIconElement = item.icon && !('name' in item.icon);

  // ListItem Chevron Style
  let _chevronStyle: undefined | object;
  if (!item.noIcon && !isIconElement) {
    _chevronStyle = {
      ...theme.colorIcon,
      size: 24,
      type: 'ionicon',
      name: 'chevron-forward',
      ...chevronStyle,
    };

    if (item.icon && !isIconElement) {
      _chevronStyle = { ..._chevronStyle, ...item.icon };
    }
  }

  return (
    <ListItem
      Component={component}
      onPress={item.onPress}
      containerStyle={containerStyle}
      disabled={disabled}
      testID={testID}>
      <ListItem.Content style={{ height: 70 }}>
        <ListItem.Title style={[theme.listItemTitle, titleStyle]}>{item.title}</ListItem.Title>
        {Boolean(item.description) && (
          <ListItem.Subtitle style={theme.colorTertiaryText}>{item.description}</ListItem.Subtitle>
        )}
      </ListItem.Content>
      {_chevronStyle && <ListItem.Chevron {..._chevronStyle} />}
      {isIconElement && item.icon}
    </ListItem>
  );
}
