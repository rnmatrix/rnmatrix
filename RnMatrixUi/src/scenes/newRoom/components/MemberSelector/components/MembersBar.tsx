import { useDimensions } from '@react-native-community/hooks';
import userService from '@rn-matrix/core/src/services/user';
import React, { forwardRef, useCallback, useMemo, useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  Transition,
  Transitioning,
} from 'react-native-reanimated';
import { mix, useTransition } from 'react-native-redash';
// import Icon from 'react-native-vector-icons/Ionicons';
import Avatar from '../../../../../common/Avatar';
import ThemedStyles from '../../../../../styles/ThemedStyles';

const springConfig = { duration: 250, easing: Easing.out(Easing.ease) };

interface MembersBarProps {
  members: any[];
  onMemberPress?: (user: any) => void;
}

const TRANSITION = (
  <Transition.Together>
    <Transition.In
      interpolation={'easeOut'}
      propagation="right"
      type="slide-right"
    />
    <Transition.Out
      interpolation={'easeOut'}
      propagation="left"
      type="slide-left"
    />
    <Transition.Change interpolation="easeInOut" />
  </Transition.Together>
);

const MemberItem = forwardRef<any, any>(({ member, onMemberPress }, ref) => {
  const theme = ThemedStyles.style;
  const editable = Boolean(onMemberPress);
  const _onPress = useCallback(() => onMemberPress && onMemberPress(member), [
    onMemberPress,
    member,
  ]);

  return (
    <View
      key={member.id}
      style={[
        theme.marginRight2x,
        theme.centered,
        theme.marginVertical5x,
        theme.marginRight3x,
        {
          width: 60,
          height: 80,
        },
      ]}>
      <Avatar
        size={50}
        name={member.name$.getValue() || member.id}
        avatarURI={userService.getAvatarUrl(member.avatar$.getValue())}
      />
      {editable && (
        <Pressable
          hitSlop={20}
          onPress={_onPress}
          style={[styles.closeIconWrapper, theme.backgroundTertiary]}>
            <Text>X</Text>
          {/* <Icon
            name={'close'}
            size={15}
            color={theme.colorPrimaryText.color}
            style={styles.closeIcon}
          /> */}
        </Pressable>
      )}
      <Text
        style={[styles.textMaxWidth, theme.marginTop2x, theme.textCenter]}
        numberOfLines={1}
        textBreakStrategy={'highQuality'}>
        {member.name$.getValue() || member.id}
      </Text>
    </View>
  );
});

const MembersBar = ({ members, onMemberPress }: MembersBarProps) => {
  const transitionViewRef = useRef<any>();
  const theme = ThemedStyles.style;
  const {
    window: { width },
  } = useDimensions();
  const transition = useTransition(members.length === 0, springConfig);
  const heightAnimation = mix(transition, 130, 0);

  transitionViewRef?.current?.animateNextTransition();

  const fullWidth = useMemo(() => ({ width }), [width]);

  const transitioningViewStyle = useMemo(
    () => [
      {
        flexDirection: 'row',
        minWidth: width,
      },
      theme.paddingHorizontal3x,
    ],
    [width],
  );

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={fullWidth}>
      <Animated.View
        style={{
          height: heightAnimation,
        }}>
        <Transitioning.View
          ref={(ref) => (transitionViewRef!.current = ref)}
          transition={TRANSITION}
          style={transitioningViewStyle}>
          {members.map((member, index) => (
            <MemberItem
              key={member.id}
              member={member}
              onMemberPress={onMemberPress}
            />
          ))}
        </Transitioning.View>
      </Animated.View>
    </ScrollView>
  );
};

export default MembersBar;

const styles = StyleSheet.create({
  spacing: { height: 200 },
  container: {},
  closeIcon: { padding: 2 },
  textMaxWidth: {
    maxWidth: 60,
  },
  closeIconWrapper: {
    position: 'absolute',
    top: 0,
    right: 0,
    borderRadius: 100,
  },
});
