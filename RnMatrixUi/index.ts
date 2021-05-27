import Config from './src/Config';
import ThemedStyles from './src/styles/ThemedStyles';

export { default as ThemedStyles } from './src/styles/ThemedStyles';
export {
  default as ToastContainer,
  showMessage as showToastMessage,
  hideMessage as hideToastMessage,
} from 'react-native-flash-message';
export { default as Navigation } from './src/utilities/navigation';
// TODO: add an init function to handle initing ThemedStyles initialization

type UiConfig = {
  theme: 'dark' | 'light';
  brand: string;
};

export default async function init({ theme, brand }: UiConfig) {
  await ThemedStyles.init();
  ThemedStyles.setTheme(theme === 'dark' ? 1 : 0);
  Config.setBrand(brand);
}
