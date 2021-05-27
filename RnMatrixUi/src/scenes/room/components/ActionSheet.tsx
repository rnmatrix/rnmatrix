import React, { useEffect, useRef, useState } from 'react';
import { ScrollView } from 'react-native';
import BottomSheet, {
  // @ts-ignore
  addHasReachedTopListener,
  // @ts-ignore
  removeHasReachedTopListener,
} from 'react-native-actions-sheet';
import ThemedStyles from '../../../styles/ThemedStyles';

export default function ActionSheet({
  children,
  visible = false,
  innerScrollEnabled = true,
  gestureEnabled = true,
  onClose = () => {},
  style = {},
}) {
  const theme = ThemedStyles.style;
  const [nestedScroll, setNestedScroll] = useState(false);
  const actionSheetRef = useRef<BottomSheet>(null);

  const _onHasReachedTop = () => {
    setNestedScroll(true);
  };

  useEffect(() => {
    if (innerScrollEnabled) {
      addHasReachedTopListener(_onHasReachedTop);
    }
    return () => {
      if (innerScrollEnabled) {
        removeHasReachedTopListener(_onHasReachedTop);
      }
    };
  }, [innerScrollEnabled]);

  useEffect(() => {
    if (visible) {
      actionSheetRef.current!.setModalVisible(true);
    } else {
      actionSheetRef.current!.setModalVisible(false);
    }
  }, [visible]);

  return (
    <BottomSheet
      ref={actionSheetRef}
      bounceOnOpen
      bounciness={8}
      gestureEnabled={gestureEnabled}
      onClose={onClose}
      containerStyle={{
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        overflow: 'hidden',
        minHeight: 100,
        padding: 24,
        paddingBottom: 48,
        ...theme.backgroundPrimary,
        ...style,
      }}>
      <ScrollView
        nestedScrollEnabled
        scrollEnabled={nestedScroll}
        style={{ width: '100%', maxHeight: 600 }}>
        {children}
      </ScrollView>
    </BottomSheet>
  );
}
