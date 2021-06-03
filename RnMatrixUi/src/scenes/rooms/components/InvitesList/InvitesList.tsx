import React, { useCallback } from 'react';
// import RoomInviteItem from './components/RoomInviteItem';
import RoomInviteItem from '../../../../common/RoomInviteItem'

const InvitesList = ({invites}) => {
  // const inviteList = useObservableState<any[]>(
  //   matrix.getRoomsByType$('invites'),
  // );
  const renderInviteRow = useCallback(({ item }) => {
    return <RoomInviteItem key={item.id} room={item} updateLists={() => {}} />;
  }, []);

  return <>{(invites || []).map((item) => renderInviteRow({ item }))}</>;
};

export default InvitesList;
