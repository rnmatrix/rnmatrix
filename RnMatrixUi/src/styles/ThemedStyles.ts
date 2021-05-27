import { action, observable, reaction } from 'mobx';
import { Platform, StyleSheet } from 'react-native';
import { DARK_THEME, LIGHT_THEME } from './Colors';
import type { ThemedStyle } from './Style';
import { buildStyle } from './Style';

/**
 * ThemedStylesStore
 */
class ThemedStylesStore {
  /**
   * Theme observable
   * 1 Dark
   * 0 Light
   * -1 Not loaded
   * @property {Observable<numeric>}
   */
  @observable theme: number = -1;

  navTheme?: object = undefined;
  defaultScreenOptions?: object = undefined;

  /**
   * Style
   */
  style: ThemedStyle = {} as ThemedStyle;

  /**
   * Initialice themed styles
   */
  async init() {
    // load stored theme value here
    this.generateStyle();
  }

  /**
   * Set dark theme
   */
  @action
  setDark() {
    // RNBootSplash.show({ duration: 150 });
    this.theme = 1;
    this.generateStyle();
    // setTimeout(() => {
    // RNBootSplash.hide({ duration: 150 });
    // }, 1000);
  }

  /**
   * Set light theme
   */
  @action
  setLight() {
    // RNBootSplash.show({ duration: 150 });
    this.theme = 0;
    this.generateStyle();
    // setTimeout(() => {
    // RNBootSplash.hide({ duration: 150 });
    // }, 1000);
  }

  /**
   * Set theme
   * @param {number} value
   */
  @action
  setTheme(value) {
    this.theme = value;
    this.generateStyle();
  }

  /**
   * On theme change reaction
   * @param {Function} fn
   */
  onThemeChange(fn) {
    return reaction(
      () => [this.theme],
      async (args) => await fn(...args),
      {
        fireImmediately: false,
      }
    );
  }

  /**
   * Get color of theme based on property
   * @param {String} prop
   */
  getColor(prop) {
    const theme = this.theme ? DARK_THEME : LIGHT_THEME;
    return theme[prop];
  }

  /**
   * Generates the current theme
   */
  generateStyle() {
    const theme = this.theme ? DARK_THEME : LIGHT_THEME;

    // const baseTheme = this.theme === 0 ? DefaultTheme : DarkTheme;

    this.navTheme = {
      // ...baseTheme,
      colors: {
        // ...baseTheme.colors,
        background: theme.primary_background,
        // card: theme.backgroundSecondary, // generates an error on ios
        text: theme.primary_text,
        primary: theme.icon,
      },
    };

    this.defaultScreenOptions = {
      title: '',
      headerStyle: {
        backgroundColor: theme.primary_background,
      },
      contentStyle: {
        backgroundColor: theme.primary_background,
      },
      stackAnimation: Platform.select({
        ios: 'default',
        android: 'fade',
      }),
    };

    // Fix for the header's extra padding on android
    if (Platform.OS === 'android') {
      // @ts-ignore
      this.defaultScreenOptions.headerTopInsetEnabled = false;
    }

    this.style = StyleSheet.create<ThemedStyle>(buildStyle(theme));
  }
}

export default new ThemedStylesStore();