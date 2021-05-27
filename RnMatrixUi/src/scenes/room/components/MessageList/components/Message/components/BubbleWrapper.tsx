import { matrix } from '@rn-matrix/core';
import userService from '@rn-matrix/core/src/services/user';
import { useObservableState } from 'observable-hooks';
import React, { useCallback, useMemo } from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import Swipeable from 'react-native-swipeable';
import Avatar from '../../../../../../../common/Avatar';
import useNavigation from '../../../../../../../hooks/useNavigation';
import ThemedStyles from '../../../../../../../styles/ThemedStyles';
import Icon from '../../../../../../../common/Icon';
import { useRoom } from '../../../../../RoomContext';
import Reactions from './Reactions';
import ReadReceipts from './ReadReceipts';

/**
 * This is the component that wraps almost all kinds of
 * messages and provides shared functionality to them
 * */
export function BubbleWrapper({
  children,
  isMe,
  showSender,
  onSwipe,
  message,
  nextSame,
  showReactions = false,
}: any) {
  const theme = ThemedStyles.style;
  const navigation = useNavigation();
  const room = useRoom();
  const reactions = useObservableState<any>(message.reactions$);
  const receipts = useObservableState<any>(message.receipts$);

  const myUser = useMemo(() => matrix.getMyUser(), [matrix]);

  const toggleReaction = useCallback(
    (key) => {
      message.toggleReaction(key);
    },
    [message],
  );

  const replyButtonStyle = useMemo(
    () =>
      ({
        height: '100%',
        justifyContent: 'center',
        alignItems: 'flex-start',
        marginRight: 60,
      } as ViewStyle),
    [isMe],
  );
  const readReceiptsStyle = useMemo(
    () =>
      ({
        flexDirection: isMe ? 'row-reverse' : 'row',
        alignItems: 'center',
      } as ViewStyle),
    [isMe],
  );

  const buttons = [
    <View style={replyButtonStyle}>
      <Icon name="reply" size={30} color="#666" />
    </View>,
  ];

  const Wrapper: React.FC<any> = ({ children: wrapperChildren }) =>
    !onSwipe ? (
      wrapperChildren
    ) : (
      <Swipeable
        rightButtons={buttons}
        rightActionActivationDistance={50}
        rightButtonWidth={0}
        swipeStartMinDistance={5}
        onRightActionRelease={onSwipe}>
        {wrapperChildren}
      </Swipeable>
    );

  return (
    <Wrapper>
      <View style={[ThemedStyles.style.marginHorizontal2x, styles.leftPadding]}>
        <View style={readReceiptsStyle}>
          {children}
          {receipts && isMe && <ReadReceipts isMe={isMe} receipts={receipts} />}
        </View>
        {reactions && showReactions && (
          <Reactions
            reactions={reactions}
            toggleReaction={toggleReaction}
            myUserId={myUser.id}
            isMyBubble={isMe}
          />
        )}
      </View>

      {!isMe && !nextSame && showSender && (
        <View
          style={[
            theme.rowJustifyStart,
            theme.paddingHorizontal2x,
            theme.backgroundSecondary,
            styles.avatarWrapper,
          ]}>
          <Avatar
            size={40}
            onPress={() =>
              message.sender._matrixUser &&
              navigation.navigate('MessengerUserInfo', {
                user: message.sender._matrixUser,
                room,
              })
            }
            avatarURI={userService.getAvatarUrl(
              message.sender.avatar$.getValue(),
            )}
            name={message.sender.name$.getValue()}
          />
        </View>
      )}
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  leftPadding: {
    paddingLeft: 50,
  },
  avatarWrapper: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    width: 40,
    height: 40,
  },
});
