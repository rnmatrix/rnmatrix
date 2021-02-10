import React, { FC, useCallback, useMemo } from 'react';
import { View, StyleSheet, Pressable, Text, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from '../scenes/newRoom/components/Header';
import ThemedStyles from '../styles/ThemedStyles';
import DialogButtons from './DialogButtons';

const IS_IOS = Platform.OS === 'ios';

// TODO: translate
const _t = (s, obj?) => {
  if (!obj) return s;

  return s.replace(/(\{\{)(.*?)(\}\})/gm, Object.values(obj)[0]);
};

interface BaseDialogProps {
  title: string,
}

const BaseDialog: FC<BaseDialogProps> = ({ children }) => {
  const theme = ThemedStyles.style;

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

      <View style={{ padding: 16 }}>
        {children}
      </View>
    </View>
  );
};

export default BaseDialog;

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
