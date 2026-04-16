module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    ['module:react-native-dotenv', {
      "moduleName": "@env",
      "path": ".env.development",
      "blacklist": null,
      "allowlist": null,
      "safe": false,
      "allowUndefined": true,
      "verbose": false
    }],
    'react-native-reanimated/plugin'
  ]
};
