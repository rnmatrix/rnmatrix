import React, { useMemo } from 'react';

import {
  Platform,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
  ViewStyle,
} from 'react-native';
import ThemedStyles from '../../../../../../../styles/ThemedStyles';
import { colors } from '../../../constants';

export default function Reactions({
  reactions,
  toggleReaction,
  myUserId,
  isMyBubble,
}) {
  const theme = ThemedStyles.style;
  const wrapperStyle = useMemo(
    () => ({ flexDirection: isMyBubble ? 'row-reverse' : 'row' } as ViewStyle),
    [isMyBubble],
  );

  return (
    <View style={[styles.wrapper, wrapperStyle]}>
      {Object.keys(reactions).map((key) => {
        const isSelected = !!reactions[key][myUserId];
        const selectedStyle = {
          backgroundColor: ThemedStyles.getColor('link'),
          borderWidth: 1.8,
          borderColor: colors.blue500,
        };
        const toggle = () => toggleReaction(key);
        return (
          <TouchableHighlight key={key} onPress={toggle} style={styles.button}>
            <View
              style={[
                styles.buttonContent,
                theme.backgroundTertiary,
                theme.borderPrimary,
                isSelected ? selectedStyle : {},
              ]}>
              <Text
                style={Platform.OS === 'android' ? styles.buttonText : null}>
                {key}
              </Text>
              <Text
                style={{
                  color: isSelected
                    ? colors.white
                    : ThemedStyles.getColor('secondary_text'),
                  marginTop: Platform.OS !== 'ios' ? -5 : undefined,
                }}>
                &nbsp;{`${Object.keys(reactions[key]).length}`}
              </Text>
            </View>
          </TouchableHighlight>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    zIndex: 2,
    flexWrap: 'wrap',
    marginTop: 1,
  },
  button: {
    width: 50,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
    borderRadius: 30,
    overflow: 'hidden',
    marginHorizontal: 2,
  },
  buttonContent: {
    width: 50,
    height: 30,
    paddingTop: 2,
    borderRadius: 30,
    borderWidth: 0.6,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  buttonText: {
    // fontFamily: 'NotoColorEmoji',
    marginTop: -5,
  },
});
