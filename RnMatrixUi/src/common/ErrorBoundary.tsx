import React, { Component } from 'react';

import { Text, Clipboard, View, ViewStyle } from 'react-native';
import ThemedStyles from '../styles/ThemedStyles';

type PropsType = {
  message: string;
  containerStyle?: ViewStyle | Array<ViewStyle>;
  children: React.ReactNode;
  textSmall?: boolean;
};

type StateType = {
  hasError: boolean;
};

// TODO: translate
const t = (s: string) => s;

/**
 * Error boundary
 */
export default class ErrorBoundary extends Component<PropsType, StateType> {
  error?: Error;
  info: any;
  state = {
    hasError: false,
  } as StateType;

  /**
   * Constructors
   * @param props
   */
  constructor(props: PropsType) {
    super(props);
    this.state = { hasError: false };
  }

  /**
   *
   * @param error
   */
  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error: Error, info) {
    // logService.exception(error);
    this.error = error;
    this.info = info;
  }

  copy = () => {
    Clipboard.setString(
      (this.error?.message || this.error) +
        '\nSTACK:\n' +
        this.info.componentStack,
    );
    // showNotification(i18n.t('stacktraceCopied'));
  };

  getErrorMessage() {
    const { containerStyle, textSmall } = this.props;

    return (
      <View style={[ThemedStyles.style.columnAlignCenter, containerStyle]}>
        <Text
          style={[
            textSmall ? ThemedStyles.style.fontS : ThemedStyles.style.fontM,
            ThemedStyles.style.textCenter,
            ThemedStyles.style.marginTop2x,
            ThemedStyles.style.fontHairline,
            ThemedStyles.style.colorDanger,
          ]}
          onPress={this.copy}>
          {this.props.message || t('errorDisplaying')}
        </Text>
        <Text
          style={[
            textSmall ? ThemedStyles.style.fontXS : ThemedStyles.style.fontS,
            ThemedStyles.style.textCenter,
            ThemedStyles.style.marginTop2x,
            ThemedStyles.style.marginBottom2x,
            ThemedStyles.style.fontHairline,
          ]}
          onPress={this.copy}>
          {t('tapCopyError')}
        </Text>
      </View>
    );
  }

  /**
   * Render
   */
  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return this.getErrorMessage();
    }

    return this.props.children;
  }
}

/**
 * With error boundary HOC
 * @param {Component} WrappedComponent
 * @param {string} message
 * @param {boolean} small
 */
export const withErrorBoundary = (
  WrappedComponent,
  message = '',
  small = false,
) => (props) => {
  if (!message) message = t('errorDisplaying');
  return (
    <ErrorBoundary message={message} textSmall={small}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );
};
