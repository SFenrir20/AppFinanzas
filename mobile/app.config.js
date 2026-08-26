const baseConfig = require("./app.json").expo;

const allowCleartextHttp = process.env.EXPO_ALLOW_CLEARTEXT === "1";
const plugins = [...(baseConfig.plugins ?? [])];

if (allowCleartextHttp) {
  plugins.push("./plugins/with-cleartext-http");
}

module.exports = () => ({
  ...baseConfig,
  android: {
    ...baseConfig.android,
    usesCleartextTraffic: allowCleartextHttp,
  },
  plugins,
  extra: {
    ...baseConfig.extra,
    allowCleartextHttp,
  },
});
