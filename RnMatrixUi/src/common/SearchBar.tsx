import React from 'react';
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';
// import Icon from 'react-native-vector-icons/Ionicons';
import Spinner from '../common/Spinner';
import ThemedStyles from '../styles/ThemedStyles';

export interface SearchBarProps {
  placeholder?: string;
  loading?: boolean;
  onChangeText: (value: string) => void;
  style?: any;
  textInputStyle?: any;
  textInputProps?: Partial<TextInputProps>;
}

const SearchBar = ({
  placeholder,
  loading,
  onChangeText,
  style,
  textInputStyle,
  textInputProps,
}: SearchBarProps) => {
  const theme = ThemedStyles.style;

  return (
    <View style={[styles.container, style]}>
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={ThemedStyles.getColor('secondary_text')}
        textContentType={'URL'}
        textBreakStrategy={'highQuality'}
        autoCorrect={false}
        onChangeText={onChangeText}
        style={[
          theme.fieldTextInput,
          // theme.input,
          theme.colorPrimaryText,
          theme.backgroundSecondary,
          theme.padding4x,
          styles.input,
          theme.flexContainer,
          textInputStyle,
        ]}
        {...textInputProps}
      />

      <View pointerEvents="none" style={styles.searchIcon}>
        {loading ? (
          <Spinner />
        ) : (
          null
          // <Icon
          //   name="md-search"
          //   size={24}
          //   color={ThemedStyles.getColor('icon')}
          // />
        )}
      </View>
    </View>
  );
};

export default SearchBar;

const styles = StyleSheet.create({
  input: {
    paddingLeft: 55,
  },
  searchIcon: {
    position: 'absolute',
    left: 16,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
