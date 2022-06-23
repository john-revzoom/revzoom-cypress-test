import { makeId, navigateToResetPasswordPage } from "../../support/utils/common";

describe("Forgot Password", () => {
  beforeEach(() => {
    cy.visit("/user/forgot-password");
  });

  it("should display the correct forgot password page", () => {
    cy.get("h1").contains("Forgot password").should("be.visible");
    cy.get("p").contains("Enter your email below to reset your password.").should("be.visible");
    cy.get("input").should("have.length", 1);
    cy.get('[placeholder="john@doe.com"]').should("be.visible");
    cy.get(".ant-btn").contains("Back to sign in").should("be.visible");
    cy.get("label").contains("Enter email").should("be.visible");
    cy.get(".ant-btn-primary").contains("Reset password").should("be.visible");
  });

  it("should navigate to login page", () => {
    cy.get(".ant-btn").contains("Back to sign in").click();
    cy.location("pathname").should("eq", "/user/login");
  });

  it("should navigate to reset password page", () => {
    cy.get("[type='submit']").should("be.disabled");
    navigateToResetPasswordPage();
  });

  it("should display the correct reset password page", () => {
    navigateToResetPasswordPage();
    cy.get("h1").contains("Reset password").should("be.visible");
    cy.get("p").contains("Enter your new password and select next when you’re done.").should("be.visible");
    cy.get("label").contains("Enter your new password").should("be.visible");
    cy.get("label").contains("Confirm your new password").should("be.visible");
    cy.get("[type='password']").should("have.length", 2);
    cy.get(".ant-btn-primary").contains("Next").should("be.visible");
    cy.get("[type='button']").should("be.disabled");
  });

  it("should be able to send a new password request and verify code successfully", () => {
    const newPassword = `P@ssw0rd${makeId(5)}`;
    navigateToResetPasswordPage();
    cy.get("h2").should("not.exist");
    cy.get("[type='password']").first().type(newPassword);
    cy.get("[type='password']").last().type(newPassword);
    cy.get("[type='button']").should("be.enabled").click({ force: true });
    cy.get("h2").contains("Verify your identity").should("be.visible");
    cy.wait(10000);
    cy.mailosaurGetMessage(Cypress.env("serverId"), {
      sentTo: Cypress.env("username")
    }).then(email => {
      expect(email.subject).to.equal("Your verification code");
      const codes = email.html.codes;
      const code = codes[0].value.replace("The", "");
      const characters = code.split("");
      cy.task("log", characters);
      cy.get("[autocomplete='new-text']").first().type(characters[0]);
      cy.get("[autocomplete='new-text']").eq(1).type(characters[1]);
      cy.get("[autocomplete='new-text']").eq(2).type(characters[2]);
      cy.get("[autocomplete='new-text']").eq(3).type(characters[3]);
      cy.get("[autocomplete='new-text']").eq(4).type(characters[4]);
      cy.get("[autocomplete='new-text']").eq(5).type(characters[5]);
      cy.get(".ant-btn-primary").click({ force: true });
      cy.wait(5000);
      cy.location("pathname").should("eq", "/user/login");
    });
  });

  it("should be able to send resend password request and verify code successfully", () => {
    const newPassword = `P@ssw0rd${makeId(5)}`;
    navigateToResetPasswordPage();
    cy.get("h2").should("not.exist");
    cy.get("[type='password']").first().type(newPassword);
    cy.get("[type='password']").last().type(newPassword);
    cy.get("[type='button']").should("be.enabled").click({ force: true });
    cy.get(".ant-message").should("not.exist");
    cy.get("h2").contains("Verify your identity").should("be.visible");
    cy.wait(30000);
    cy.get("p").contains("Resend email").click({ force: true });
    cy.get(".ant-message").should("not.exist");
    cy.get("p").contains("A new email is sent, you should receive it shortly")
    cy.wait(10000);
    cy.mailosaurGetMessage(Cypress.env("serverId"), {
      sentTo: Cypress.env("username")
    }).then(email => {
      expect(email.subject).to.equal("Your verification code");
      const codes = email.html.codes;
      const code = codes[0].value.replace("The", "");
      const characters = code.split("");
      cy.task("log", characters);
      cy.get("[autocomplete='new-text']").first().type(characters[0]);
      cy.get("[autocomplete='new-text']").eq(1).type(characters[1]);
      cy.get("[autocomplete='new-text']").eq(2).type(characters[2]);
      cy.get("[autocomplete='new-text']").eq(3).type(characters[3]);
      cy.get("[autocomplete='new-text']").eq(4).type(characters[4]);
      cy.get("[autocomplete='new-text']").eq(5).type(characters[5]);
      cy.get(".ant-btn-primary").click({ force: true });
      cy.wait(5000);
      cy.location("pathname").should("eq", "/user/login");
    });
  });
});
