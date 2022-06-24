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

  it("should dislay side navigation correctly", () => {
    cy.get("span").contains("Home").should("be.visible");
    cy.get("span").contains("Billing").should("be.visible");
    cy.get("span").contains("Feedback").should("be.visible");
  });

  it("should be able to navigate and display settings page correctly", () => {
    cy.getDataCy("settingIcon").should("be.visible").click();
    cy.location("pathname").should("eq", "/user/settings");
    cy.getDataCy("actionCard").should("have.length", 4);
  });

  it("should be able to logout successfully", () => {
    cy.getDataCy("settingIcon").should("be.visible").click();
    cy.location("pathname").should("eq", "/user/settings");
    cy.getDataCy("logoutBtn").click();
    cy.location("pathname").should("eq", "/user/login");
  });

  it("should be able to navigate to billing page", () => {
    cy.getDataCy("billing").should("be.visible").click();
    cy.location("pathname").should("eq", "/user/settings/billing");
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

  it("should be able to duplicate a project card", () => {
    findKebabMenuInProjectCard();
    findAndClickMenuItemInKebab("Duplicate");
    checkModalIfVisible();
    cy.get("p").contains("You’re about to start a new smart crop automation!").should("be.visible");
    cy.get("[type='checkbox']").should("have.length", 2);
    cy.get(".ant-modal-footer").children(".ant-btn").should("have.length", 2);
    cy.get(".ant-modal-footer").children(".ant-btn").first().click();
    checkModalIfNotVisible();
    cy.get(".ant-message").contains("duplicated").should("be.visible")
  });
  it("should be able to delete a project card", () => {
    findKebabMenuInProjectCard();
    findAndClickMenuItemInKebab("Delete");
    checkModalIfVisible();
    cy.get("p").contains("You will not be able to restore this project in any way. Enter delete below to confirm your delete").should("be.visible");
    cy.get("label").contains("Enter delete").should("be.visible");
    cy.get(".ant-modal-footer").children(".ant-btn").should("have.length", 2);
    cy.get(".ant-modal-footer").children(".ant-btn").first().should("not.be.enabled");
    cy.get("[placeholder='delete']").should("be.visible");
    cy.get("[type='input']").should("be.visible").type("delete");
    cy.get(".ant-modal-footer").children(".ant-btn").first().should("be.enabled").click();
    checkModalIfNotVisible();
    cy.get(".ant-message").contains("deleted").should("be.visible")
  });
});
