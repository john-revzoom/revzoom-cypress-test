export const uiLogin = () => {
  cy.get("div > a").contains("Login with Username and Password").click();
  cy.wait(1000);
  cy.get("[placeholder='Username or Email']").type("cypress");
  cy.get("[type='password']").type("28oHuKvyucctHrnN8xGuVfXk");
  cy.get("div").contains("SIGN IN").click();
  cy.wait(5000);
  cy.get("span").contains("Evolphin Software, Inc.").should("be.visible");
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
