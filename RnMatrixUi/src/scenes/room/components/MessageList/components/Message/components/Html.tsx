import React, { useEffect, useState } from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import HtmlRenderer from 'react-native-render-html';
import ThemedStyles from '../../../../../../../styles/ThemedStyles';
import { htmlEmojis } from '../../../../../../../utilities/emojis';
import { htmlLinks } from '../../../../../../../utilities/misc';

const parseHtml = (html) => {
  return htmlEmojis(html?.includes('href') ? html : htmlLinks(html));
};

export default function Html({
  html,
  isMe = false,
  accentColor = ThemedStyles.getColor('link'),
}) {
  const styles = getHtmlStyles({ isMe, accentColor });
  const [parsedHtml, setParsedHtml] = useState(parseHtml(html));

  //* *******************************************************************************
  // Methods
  //* *******************************************************************************
  const onLinkPress = (e, link) => {
    if (link) {
      Linking.canOpenURL(link).then(() => {
        Linking.openURL(link);
      });
    }
  };

  const renderers: any = {
    emoji: { renderer: emojiRenderer, wrapper: 'Text' },
    ul: { renderer: unorderedListRenderer, wrapper: 'Text' },
  };

  //* *******************************************************************************
  // Lifecycle
  //* *******************************************************************************
  useEffect(() => {
    if (html === parsedHtml) {
      return;
    }

    setParsedHtml(parseHtml(html));
  }, [html, parsedHtml]);

  return parsedHtml ? (
    // @ts-ignore
    <HtmlRenderer
      html={parsedHtml}
      renderers={renderers}
      onLinkPress={onLinkPress}
      renderersProps={{ isMe }}
      {...styles}
    />
  ) : null;
}

const emojiRenderer = (
  htmlAttribs,
  children,
  convertedCSSStyles,
  passProps,
) => (
  <Text key={passProps.key} style={styles.notoFont}>
    {children}
  </Text>
);

const unorderedListRenderer = (
  htmlAttribs,
  children,
  convertedCSSStyles,
  { renderersProps },
) => {
  const theme = ThemedStyles.style;
  const color = renderersProps.isMe ? '#fff' : '#222';
  return children.map((c, i) => (
    <View style={theme.rowJustifyStart} key={i}>
      <Text style={{ color, fontSize: 6, marginTop: 6, marginRight: 6 }}>
        ⬤
      </Text>
      {c}
    </View>
  ));
};

const getHtmlStyles = ({ isMe, accentColor }) => ({
  baseFontStyle: {
    color: isMe ? '#fff' : ThemedStyles.getColor('primary_text'),
    letterSpacing: 0.3,
    fontWeight: '400',
  },
  tagsStyles: {
    blockquote: {
      borderLeftColor: accentColor,
      borderLeftWidth: 3,
      paddingLeft: 10,
      marginVertical: 10,
      opacity: 0.75,
    },
    a: {
      color: isMe ? '#fff' : ThemedStyles.getColor('link'),
      textDecorationLine: 'underline',
    },
    code: {
      backgroundColor: '#00000025',
    },
  },
});

const styles = StyleSheet.create({
  notoFont: { fontFamily: 'NotoColorEmoji' },
});
