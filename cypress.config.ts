import { defineConfig } from "cypress";

module.exports = defineConfig({
  projectId: "9mirv8",
  // setupNodeEvents can be defined in either
  // the e2e or component configuration
  reporter: "cypress-multi-reporters",
  reporterOptions: {
    husky: "^7.0.4",
    reporterEnabled: "cypress-mochawesome-reporter, mocha-junit-reporter",
    // cypressMochawesomeReporterReporterOptions: {
    //   reportDir: "cypress/reports/html",
    //   charts: true,
    //   reportPageTitle: "app.dev.crop.photo local test suite",
    //   embeddedScreenshots: true,
    //   inlineAssets: true
    // },
    mochaJunitReporterReporterOptions: {
      mochaFile: "cypress/reports/junit/results-[hash].xml"
    }
  },
  video: false,
  e2e: {
    baseUrl: "https://app.dev.crop.photo",
    specPattern: "cypress/integration/**/*.spec.ts",
    supportFile: "cypress/support/commands.ts",
    env: {
      username: "teeth-frog@2yguhweg.mailosaur.net",
      password: "P@ssw0rd123",
      MAILOSAUR_API_KEY: "3fb6elGO1lxjTP8j",
      serverId: "2yguhweg",
      emailDomainName: "2yguhweg.mailosaur.net"
    },
    setupNodeEvents(on, config) {
      // on("after:spec", (spec, results) => {
      //   if (results && results.video) {
      //     // Do we have failures for any retry attempts?
      //     const failures = some(results.tests, test => {
      //       return some(test.attempts, { state: "failed" });
      //     });
      //     if (!failures) {
      //       // delete the video if the spec passed and no tests retried
      //       return del(results.video);
      //     }
      //   }
      // });
      require("cypress-mochawesome-reporter/plugin")(on);
      on("task", {
        log(message) {
          console.log(message);

          return null;
        }
      });
    }
  }
});
