describe("Login", () => {
  beforeEach(() => {
    cy.visit("/user/login");
  });

  it("should navigate to login page", () => {
    cy.get("h1").contains("Welcome back").should('be.visible');
    cy.get('label').contains('Enter email').should('be.visible');
    cy.get('label').contains('Enter password').should('be.visible');
    cy.get('[placeholder="john@doe.com"]').should('be.visible');
    cy.get('[src="/images/Logo.svg"]').should('be.visible');
  });

  it("should navigate to signup page", () => {
    cy.get(".ant-btn").contains("Create an account").click();
    cy.location("pathname").should("eq", "/user/signup");
  });
  it("should navigate to forgot password page", () => {
    cy.getDataCy("input-label").contains("Forgot password?").click({ force: true });
    cy.location("pathname").should("eq", "/user/forgot-password");
  });
});
