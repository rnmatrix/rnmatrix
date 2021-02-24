/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */
const exclusionList = require('metro-config/src/defaults/exclusionList');
const defaultSourceExts = require('metro-config/src/defaults/defaults')
  .sourceExts;
const { getDefaultConfig } = require('metro-config');
const nodelibs = require('node-libs-react-native');
nodelibs.vm = require.resolve('vm-browserify');

module.exports = (async () => {
  const {
    resolver: { assetExts },
  } = await getDefaultConfig();

  return {
    resolver: {
      assetExts: assetExts.filter((ext) => ext !== 'svg'),
      extraNodeModules: nodelibs,
      blacklistRE: exclusionList([
        /ios\/Pods\/JitsiMeetSDK\/Frameworks\/JitsiMeet.framework\/assets\/node_modules\/react-native\/.*/,
      ]),
      sourceExts: [
        ...(process.env.RN_SRC_EXT
          ? process.env.RN_SRC_EXT.split(',').concat(defaultSourceExts)
          : defaultSourceExts),
        'svg',
      ],
    },
    transformer: {
      babelTransformerPath: require.resolve('react-native-svg-transformer'),
      getTransformOptions: async () => ({
        transform: {
          experimentalImportSupport: true,
          inlineRequires: true,
        },
      }),
    },
  };
})();
