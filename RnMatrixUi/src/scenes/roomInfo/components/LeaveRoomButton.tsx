import React, { useCallback, useMemo, useState } from 'react';
import Spinner from '../../../common/Spinner';
import MenuItem from '../../../common/MenuItem';
import colors from '../../../styles/Colors';
import useNavigation from '../../../hooks/useNavigation';
// import { RoomInfoScreenNavigationProp } from '../RoomInfoScreen';

const t = (k) => k; // TODO: translate

const LeaveRoomButton = ({ room }) => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const onLeaveRoom = useCallback(async () => {
    setLoading(true);
    await room.leave();
    setLoading(false);
    navigation.popToTop();
  }, [navigation, room]);

  return (
    <MenuItem
      titleStyle={useMemo(
        () => ({
          color: colors.danger,
        }),
        [],
      )}
      item={useMemo(
        () => ({
          title: t('Leave room'),
          onPress: onLeaveRoom,
          icon: loading ? <Spinner /> : undefined,
        }),
        [loading, onLeaveRoom],
      )}
    />
  );
};

export default LeaveRoomButton;
