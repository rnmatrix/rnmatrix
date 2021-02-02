import { useObservableState } from 'observable-hooks';
import React, { useCallback } from 'react';
import RoomInviteItem from './components/RoomInviteItem';
import { matrix } from '@rn-matrix/core';

const InvitesList = () => {
  const inviteList = useObservableState<any[]>(
    matrix.getRoomsByType$('invites'),
  );
  const renderInviteRow = useCallback(({ item }) => {
    return <RoomInviteItem key={item.id} room={item} />;
  }, []);

  return <>{(inviteList || []).map((item) => renderInviteRow({ item }))}</>;
};

export default InvitesList;
