import { uiLogin } from "../../support/utils/common";

describe("Homepage", () => {
  beforeEach(() => {
    cy.visit("/");
    uiLogin();
  });

  it("should be able to upload successfully", () => {
    cy.get(".section > div > input[type='file']").selectFile("cypress/fixtures/sample-upload.jpg", { force: true });
    cy.get("span").contains("Uploads").should("be.visible");
    cy.wait(5000);
    cy.get(".upload-status > .finished > span").contains("FINISHED").should("be.visible");
    cy.get(".cancel > span").contains("DONE").should("be.visible");
  });
  it("should be able to upload and see result in notification", () => {
    cy.get(".section > div > input[type='file']").selectFile("cypress/fixtures/sample-upload-2.jpg", { force: true });
    cy.get("span").contains("Uploads").should("be.visible");
    cy.wait(5000);
    cy.get(".upload-status > .finished > span").contains("FINISHED").should("be.visible");
    cy.get(".cancel > span").contains("DONE").should("be.visible").click();
    cy.wait(1000);
    cy.get("header > .right > button").click();
    cy.wait(1000);
    cy.get("#ActivityPanel > div > div").first().contains("Moments Ago").should("be.visible");
  });
});
