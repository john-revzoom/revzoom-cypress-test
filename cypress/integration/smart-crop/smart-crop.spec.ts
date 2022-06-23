import { navigateToSmartCropConfigPage, uiLogin } from "../../support/utils/common";

describe("Smart Crop", () => {
  beforeEach(() => {
    uiLogin();
  });

  it("should be able to setup configuration options in /smartcrop", () => {
    navigateToSmartCropConfigPage();
    cy.getDataCy("crop-header-title").contains("Configuration");
    cy.get(".ant-radio").should("not.exist");
    cy.get("[type='search']").should("not.be.enabled");
    cy.getDataCy("crop-marker-label").contains("Crop marker");
    cy.getDataCy("crop-wrapper-image").should("be.visible");
    cy.get(".ant-select-selection-placeholder").contains("Select a marker").should("be.visible");
    cy.get("[type='search']").should("be.enabled").click();
    cy.get(".ant-select-dropdown").should("be.visible");
    cy.getDataCy("marker-option").contains("nose").should("be.visible").click({ force: true });
    cy.get(".ant-select-selection-item").contains("nose").should("be.visible");
    cy.getDataCy("continueButton").should("not.be.enabled");
    cy.get("div").contains("Crop side").should("not.exist");

    //selecting crop from
    cy.get(".ant-radio").should("have.length", 2).first().click();
    cy.getDataCy("configNextButton").should("not.be.enabled");
    cy.getDataCy("continueButton").should("be.enabled").click();
    cy.get("div").contains("Crop side").should("be.visible");
    cy.getDataCy("cropTypeLabel").contains("Crop from").should("be.visible");
    cy.getDataCy("selectedCropSide").contains("Bottom").should("be.visible");
    cy.getDataCy("unSelectedCropSide").should("have.length", 3).first().click();
    cy.getDataCy("selectedCropSide").contains("Top").should("be.visible");

    //going back to select crop around
    cy.get("span").contains("Edit crop type").should("be.visible").click();
    cy.get("div").contains("Crop side").should("not.exist");
    cy.get("div").contains("Crop type").should("be.visible");
    cy.get(".ant-radio").should("have.length", 2).last().click();
    cy.getDataCy("continueButton").should("be.enabled").click();
    cy.getDataCy("cropTypeLabel").contains("Crop around").should("be.visible");
    cy.get("div").contains("Crop size").should("be.visible");
    cy.getDataCy("configNextButton").should("be.enabled").click();

    //upload page
    cy.get(".ant-breadcrumb-link").contains("Select Media").should("be.visible");
    cy.getDataCy("uploadNextButton").should("not.be.enabled")
    cy.get(".ant-upload-drag-container").should("be.visible");
    cy.get("span").contains("Drag and drop your media").should("be.visible");
    cy.get("span").contains("Feel free to drop multiple files in one go.").should("be.visible");
    cy.get("span").contains("Feel free to drop multiple files in one go.").should("be.visible");
    cy.get("span").contains("Our media uploader is designed for ingesting large").should("be.visible");
    cy.get("span").contains("batches of files quickly from your desktop.").should("be.visible");
    cy.getDataCy("uploadMediaInput").selectFile("cypress/fixtures/girl.jpg", { force: true });
    cy.wait(3000);
    cy.getDataCy("uploadMediaInput").should("not.exist");
    cy.get(".ant-image-img").should("have.length", 1)
    cy.get("div").contains("1 file").should("be.visible");
    cy.getDataCy("uploadNextButton").should("be.enabled");
  });
});
