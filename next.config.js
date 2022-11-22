const path = require("path");
const util = require("util");
const exec = util.promisify(require("child_process").exec);
const execSync = require("child_process").execSync;

module.exports = {
  reactStrictMode: true,
  generateBuildId: async () => {
    let version;
    let error;
    if (process.env.AWS_CODEBUILD_VERSION) {
      version = process.env.AWS_CODEBUILD_VERSION;
    } else {
      const { stdout, stderr } = await exec("git describe --tags");
      version = stdout;
      error = stderr;
    }
    if (error) {
      console.error("Error ", error);
      process.exit(1);
    }
    console.info("Version detection:", version);
    return version;
  },
  experimental: {
    outputStandalone: true
  },
  env: {
    BUILD_VERSION: process.env.AWS_CODEBUILD_VERSION || execSync("git describe --tags").toString("utf8")
  }
};
