import {
  checkModalIfNotVisible,
  checkModalIfVisible,
  findAndClickMenuItemInKebab,
  findKebabMenuInProjectCard,
  uiLogin
} from "../../support/utils/common";

function makeName(length: number) {
  let result = "";
  let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

describe("Homepage ", () => {
  beforeEach(() => {
    uiLogin();
    cy.get("div").contains("No automation projects are configured yet. Go ahead, create one!").should("not.exist");
  });

  it("should be able to rename a project card", () => {
    const newName = makeName(10);
    findKebabMenuInProjectCard();
    findAndClickMenuItemInKebab("Rename");
    checkModalIfVisible();

    cy.get(".ant-modal-footer").children('[type="button"]').first().should("not.be.enabled");
    cy.get("[type='input']").type(newName);
    cy.get(".ant-modal-footer").children('[type="button"]').first().should("be.enabled");
    cy.get(".ant-modal-footer").children('[type="button"]').first().click({ force: true });
    checkModalIfNotVisible();
    cy.get(".ant-message").contains("Automation Renamed");
  });

  // it("should be able to duplicate a project card", () => {
  //   cy.findKebabMenuInProjectCard();
  //   cy.findAndClickMenuItemInKebab("Duplicate")
  //   cy.checkModalIfVisible()
  // })
});
