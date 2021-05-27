import React, { useCallback, useRef } from 'react';
import { TouchableOpacity } from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import ImagePicker, { ImagePickerOptions } from 'react-native-image-picker';
import Menu, { MenuItem } from 'react-native-material-menu';
import Icon from '../../../../../../../common/Icon';
import withPreventDoubleTap from '../../../../../../../common/PreventDoubleTap';
import ThemedStyles from '../../../../../../../styles/ThemedStyles';
// import { showNotification } from '../../../../../../../../../../AppMessages';
import i18n from '../../../../../../../utilities/i18n';

const TouchableOpacityCustom = withPreventDoubleTap(TouchableOpacity);

const t = (s, options?) => i18n.t(`composer:attachmentAction.${s}`, options);

type PropsTypes = {
  room: any; // TODO: use Room
};

/**
 * Remind Action Component
 */
export default function ({ room }: PropsTypes) {
  const theme = ThemedStyles.style;
  const iconColor = ThemedStyles.getColor('primary_text');

  const ref = useRef<Menu>(null);
  const showDropdown = useCallback(() => {
    if (ref.current) {
      ref.current.show();
    }
  }, [ref]);

  const openImagePicker = () => {
    const options: ImagePickerOptions = {
      mediaType: 'mixed',
    };
    ref.current?.hide();
    ImagePicker.launchImageLibrary(options, async (response) => {
      if (response.didCancel) {
        return;
      }
      if (response.error) {
        // TODO
        // showNotification(response.error, 'danger');
        return;
      }
      room.sendMessage(response, response.type ? 'm.image' : 'm.video');
    });
  };

  const openDocPicker = () => {
    ref.current?.hide();
    DocumentPicker.pick({} as any).then((res) => {
      if (res) {
        room.sendMessage(res, 'm.file');
      }
    });
  };

  const iconStyle = [theme.colorSecondaryText];
  const menuText = [theme.colorSecondaryText, theme.fontL];

  return (
    <Menu
      ref={ref}
      style={theme.backgroundSecondary}
      button={
        <TouchableOpacityCustom
          style={[
            theme.rowJustifyCenter,
            theme.paddingHorizontal3x,
            theme.paddingVertical4x,
            theme.alignCenter,
          ]}
          onPress={showDropdown}
          testID="Attachment Button">
          <Icon name="attach" size={25} color={iconColor} />
        </TouchableOpacityCustom>
      }>
      <MenuItem onPress={openDocPicker} textStyle={menuText}>
        <Icon style={iconStyle} color={iconColor} name="attach" size={15} />
        {'  ' + t('document')}
      </MenuItem>
      <MenuItem onPress={openImagePicker} textStyle={menuText}>
        <Icon style={iconStyle} color={iconColor} name="image" size={15} />
        {'  ' + t('image')}
      </MenuItem>
    </Menu>
  );
}
