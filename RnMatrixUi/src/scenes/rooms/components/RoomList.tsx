import React from 'react';
import { FlatList, View } from 'react-native';
import InvitesList from './InvitesList/InvitesList';

type Props = {
  data?: any;
  renderRow: (item: any) => any;
  listHeader: React.ComponentElement<any, any>;
};

export default function RoomList({ data, inviteList = [], renderRow, listHeader }: Props) {
  return (
    <FlatList
      data={data}
      renderItem={renderRow}
      keyExtractor={(item) => item.id}
      ListFooterComponent={<View style={{ height: 200 }} />}
      ListHeaderComponent={
        <>
          {listHeader}
          <InvitesList invites={inviteList} />
        </>
      }
    />
  );
}
