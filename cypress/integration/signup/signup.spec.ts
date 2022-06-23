import { makeId } from "../../support/utils/common";

describe("Signup", () => {
  beforeEach(() => {
    cy.visit("/user/signup");
  });

  it("should display signup page", () => {
    cy.get("h1").contains("Create an account");
    cy.get("p").contains("No credit card required. Get started in minutes.");
    cy.get('input').should('have.length', 4);
    cy.get('[placeholder="John"]').should('be.visible');
    cy.get('[placeholder="Doe"]').should('be.visible');
    cy.get('[placeholder="john@doe.com"]').should('be.visible');
    cy.get('.ant-btn').contains('I already have an account').should('be.visible');
    cy.get('label').contains('First name').should('be.visible');
    cy.get('label').contains('Last name').should('be.visible');
    cy.get('label').contains('Enter work email').should('be.visible');
    cy.get('label').contains('Enter password').should('be.visible');
  });

  it("should navigate to login page", () => {
    cy.get(".ant-btn").contains("I already have an account").click();
    cy.location('pathname').should('eq', '/user/login');
  });

  it("should navigate to forgot password page", () => {
    cy.get("a").contains("Forgot password?").click();
    cy.location('pathname').should('eq', '/user/forgot-password');
  });

  it("should be able to signup successfully", () => {
    cy.get("[type='submit']").should('be.disabled');
    cy.get("[name='firstName']").type("John");
    cy.get("[name='lastName']").type("Revzoom");
    cy.get("[type='email']").type(`john+test${makeId(5)}@revzoom.com`);
    cy.get("[type='password']").type(Cypress.env("password"));
    cy.get("[type='submit']").should('be.enabled');
    cy.get(".ant-btn").contains("Create an account").click({ force: true });
    cy.wait(5000);
    cy.location('pathname').should('eq', '/user/login');
    cy.get(".ant-message").contains("Your account has been created successfully.");
  });
});
