// import { uiLogin } from "../../support/utils/common";

// describe("Login", () => {
//   beforeEach(() => {
//     cy.visit("/");
//   });

//   it("should navigate to login page", () => {
//     cy.get(".header").contains("Welcome to the Evolphin Web Client").should("be.visible");
//     cy.get(".subtitle").contains("The page you are trying to view requires sign in").should("be.visible");
//     cy.get("div > a").contains("Login with Username and Password").should("be.visible");
//   });

//   it("should display login form", () => {
//     cy.get("div > a").contains("Login with Username and Password").click();
//     // cy.get("input").should("have.length", 2);
//     cy.get("[placeholder='Username or Email']").should("be.visible");
//     cy.get("[placeholder='Password']").should("be.visible");
//     cy.get("div").contains("SIGN IN").should("be.visible");
//     cy.get("div").contains("CREATE AN ACCOUNT").should("be.visible");
//   });

//   it("should be able to login successfully", () => {
//     uiLogin();
//   });
// });
