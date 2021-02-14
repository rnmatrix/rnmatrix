import Navigation from '../utilities/navigation';
import { InteractionManager } from 'react-native';

export const showModal = async (routeName, props): Promise<any> => {
  return new Promise((resolve, reject) =>
    Navigation.instance?.navigate(routeName, {
      ...props,
      onFinished: (result) => {
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

type Question = {
  title: string;
  description?: string | JSX.Element;
  button?: string;
  danger?: boolean;
  onFinished?: any;
};

export const showError = async (question: Question): Promise<boolean> => {
  return false;
};
