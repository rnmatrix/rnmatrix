import { matrix } from '@rn-matrix/core';
import { useObservableState } from 'observable-hooks';
import React from 'react';
import { FlatList, View } from 'react-native';
import Spinner from '../../../common/Spinner';
import ThemedStyles from '../../../styles/ThemedStyles';
import InvitesList from './InvitesList/InvitesList';

type Props = {
  data?: any;
  renderRow: (item: any) => any;
  listHeader: React.ComponentElement<any, any>;
};

export default function RoomList({ data, renderRow, listHeader }: Props) {
  const theme = ThemedStyles.style;
  const isReady = useObservableState<any>(matrix.isReady$());
  const isSynced = useObservableState<any>(matrix.isSynced$());

  if (!isReady || !isSynced) {
    return (
      <View style={[theme.centered, theme.padding2x]}>
        <Spinner size="large" />
      </View>
    );
  }

  return (
    <FlatList
      data={data}
      renderItem={renderRow}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <>
          {listHeader}
          <InvitesList />
        </>
      }
    />
  );
}
