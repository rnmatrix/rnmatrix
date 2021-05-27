import React from 'react';
import { ActivityIndicator, ActivityIndicatorProps, View } from 'react-native';
import ThemedStyles from '../styles/ThemedStyles';

interface SpinnerProps extends ActivityIndicatorProps {
  //
}

export default function Spinner(props: SpinnerProps) {
  return (
    <ActivityIndicator
      color={ThemedStyles.getColor('link')}
      size={'large'}
      {...props}
    />
  );
}

export class CenteredSpinner extends React.Component {
  render() {
    return (
      <View
        // @ts-ignore
        style={styles.activitycontainer}
        // @ts-ignore
        onLayout={this.props.onLayout}
      >
        <Spinner />
      </View>
    );
  }
}

const styles = {
  activitycontainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    minHeight: 100,
    flex: 1,
  },
};
