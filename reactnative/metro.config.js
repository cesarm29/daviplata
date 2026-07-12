const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const config = {
  watchFolders: [],
  resolver: {
    blacklistRE: /\/android\/|\/ios\/|\/__tests__\//,
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
