export const uiLogin = () => {
  cy.visit("/user/login");
  cy.location("pathname").should("eq", "/user/login");
  cy.get("[type='email']").type(Cypress.env("username"));
  cy.get("[type='password']").type(Cypress.env("password"));
  cy.get("[type='submit']").click();
  cy.get(".ant-message").should("not.exist");
  cy.wait(5000);
  cy.location("pathname").should("eq", "/");
  cy.get(".ant-btn").contains("John");
};

export const findKebabMenuInProjectCard = () => {
  cy.getDataCy("project-card")
    .first()
    .getDataCy("project-footer")
    .first()
    .trigger("mouseover", { force: true })
    .get(".ant-btn")
    .contains("...")
    .click({ force: true });
};

export const findAndClickMenuItemInKebab = (name: string) => {
  cy.get(".ant-dropdown-menu-title-content").contains(name).click({ force: true });
};

export const checkModalIfVisible = () => {
  cy.get(".ant-modal").should("be.visible");
};

export const checkModalIfNotVisible = () => {
  cy.get(".ant-modal").should("not.exist");
};

export const navigateToSmartCropConfigPage = () => {
  cy.location("pathname").should("eq", "/");
  cy.getDataCy("card").first().click({ force: true });
  cy.location("pathname").should("eq", "/smart-crop");
};

export const navigateToResetPasswordPage = () => {
  cy.get("[type='email']").type(Cypress.env("username"));
  cy.get("[type='submit']").should("be.enabled").click({ force: true });
  cy.location("pathname").should("eq", "/user/reset-password");
  cy.location("search").should("eq", `?userId=${encodeURIComponent(Cypress.env("username"))}`);
};

export function makeId(length: number) {
  let result = "";
  let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

const resizeObserverLoopErrRe = /^[^(ResizeObserver loop limit exceeded)]/;
Cypress.on("uncaught:exception", (err, runnable) => {
  // returning false here prevents Cypress from
  // failing the test
  if (resizeObserverLoopErrRe.test(err.message)) {
    return false;
  }
});
