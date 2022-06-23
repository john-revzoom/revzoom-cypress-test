import { defineConfig } from "cypress";

module.exports = defineConfig({
  // setupNodeEvents can be defined in either
  // the e2e or component configuration
  extends: './cypress.config.ts'
});
