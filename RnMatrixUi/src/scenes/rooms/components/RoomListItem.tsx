import { useDimensions } from '@react-native-community/hooks';
import moment from 'moment';
import { useObservableState } from 'observable-hooks';
import React, { useCallback } from 'react';
import { StyleSheet, Text, TouchableHighlight, View } from 'react-native';
import ThemedStyles from '../../../styles/ThemedStyles';
import Highlighter from 'react-native-highlight-words';
import Icon from '../../../common/Icon';
import RoomAvatar from '../../../common/RoomAvatar';

const avatarSize = 50;

interface RoomListItemProps {
  room: any;
  onPress: (room: any) => any;
  highlights?: string[];
  body?: string;
  showUnreadStatus?: boolean;
}

const RoomListItem: React.FC<RoomListItemProps> = ({
  room,
  onPress,
  highlights = [],
  body,
  showUnreadStatus = true,
}: RoomListItemProps) => {
  const theme = ThemedStyles.style;
  const name = useObservableState<any>(room.name$);
  const snippet = useObservableState<any>(room.snippet$);
  let unreadCount = useObservableState<any>(room.unreadCount$);
  const { width } = useDimensions().window;

  if (!showUnreadStatus) {
    unreadCount = 0;
  }

  const getFormattedTime = useCallback(() => {
    if (!snippet?.timestamp) return null;

    const date = moment(snippet?.timestamp);
    const now = moment();

    /**
     * If it was the same day, show the time
     * */
    if (date.isSame(now, 'day')) {
      return date.format('hh:mm');
    }

    /**
     * If it was the same week, show the weekDay
     * */
    if (date.isSame(now, 'week')) {
      return date.format('ddd');
    }

    /**
     * If it was older than the current week, show the date YY/MM/DD
     * */
    return date.format('YY/MM/DD');
  }, [snippet?.timestamp]);

  const handleOnPress = useCallback(() => {
    onPress(room);
  }, [room]);

  return (
    <TouchableHighlight
      style={[unreadCount > 0 ? theme.backgroundTertiary : theme.backgroundPrimary]}
      underlayColor={ThemedStyles.getColor('borderColorTertiary')}
      onPress={handleOnPress}>
      <View
        style={[
          theme.padding3x,
          styles.rowWrapper,
          theme.borderTopHair,
          theme.borderPrimary,
          { paddingLeft: 0 },
        ]}>
        <View style={[{ width: 80, flexDirection: 'row' }, theme.justifyCenter, theme.alignCenter]}>
          <RoomAvatar room={room} size={45} style={styles.avatar} />
        </View>
        <View style={[theme.flexContainer]}>
          <View style={[styles.textWrapper, theme.marginBottom]}>
            <Text style={[styles.title, theme.colorPrimaryText]} numberOfLines={1}>
              {room.isEncrypted() && (
                <>
                  <Icon name="lock" color="#888" size={18} />
                  &nbsp;
                </>
              )}
              {name}
            </Text>
          </View>
          <View style={styles.textWrapper}>
            <Highlighter
              style={[styles.snippet, { width: width * 0.7 }, theme.colorSecondaryText]}
              numberOfLines={1}
              ellipsizeMode="tail"
              highlightStyle={[styles.highlightStyle, theme.colorPrimaryText]}
              searchWords={highlights}
              textToHighlight={body || snippet?.content}
            />
          </View>
        </View>
        <View style={[theme.rowJustifyStart, theme.alignCenter]}>
          <View style={[theme.marginRight, theme.marginLeft]}>
            <Text style={[theme.colorSecondaryText, theme.textRight]}>{getFormattedTime()}</Text>
            {!!unreadCount ? (
              <UnreadIndicator unreadCount={unreadCount} />
            ) : (
              <View style={{ height: 31 }} />
            )}
          </View>

          {/*<EntypoIcon
            name="chevron-thin-right"
            color={ThemedStyles.getColor('icon')}
            size={18}
          />*/}
        </View>
      </View>
    </TouchableHighlight>
  );
};

export default RoomListItem;

const UnreadIndicator: React.FC<any> = ({ unreadCount }) => {
  const theme = ThemedStyles.style;

  return (
    <View style={[styles.unreadIndicator, theme.backgroundLink]}>
      <Text style={[theme.colorWhite, theme.bold]}>{unreadCount}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    alignSelf: 'flex-start',
  },
  rowWrapper: {
    flexDirection: 'row',
  },
  textWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 18,
    maxWidth: 200,
  },
  snippet: {
    maxWidth: 500,
  },
  unreadIndicator: {
    paddingHorizontal: 5,
    minWidth: 25,
    height: 25,
    borderRadius: 40,
    marginTop: 6,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
  },
  highlightStyle: { fontWeight: 'bold' },
});
