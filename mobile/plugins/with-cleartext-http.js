const { withAndroidManifest } = require("expo/config-plugins");

module.exports = function withCleartextHttp(config) {
  return withAndroidManifest(config, (updatedConfig) => {
    const application = updatedConfig.modResults.manifest.application?.[0];

    if (application) {
      application.$["android:usesCleartextTraffic"] = "true";
    }

    return updatedConfig;
  });
};
