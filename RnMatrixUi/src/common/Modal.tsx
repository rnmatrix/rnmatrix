import Navigation from '../utilities/navigation';
import { InteractionManager } from 'react-native';

export const showModal = async (routeName, props): Promise<any> => {
  return new Promise((resolve, reject) =>
    Navigation.instance?.navigate(routeName, {
      ...props,
      onFinished: (result) => {
        console.log('onFinished', result)
        console.log('Navigation.instance', Navigation.instance)
        Navigation.instance?.goBack();

        InteractionManager.runAfterInteractions(() => resolve(result));
      },
      // TODO: handle rejection on cancel
    })
  );
  // return [{
  //   passphrase: '',
  //   recoveryKey: '',
  // }];
};
