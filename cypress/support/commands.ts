// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
import "cypress-mailosaur";

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to select DOM element by data-cy attribute.
       * @example cy.dataCy('greeting')
       */
      getDataCy(value: string): Chainable<JQuery<HTMLElement>>;
      findDataCy(value: string): Chainable<JQuery<HTMLElement>>;
      getAndClickFirstChild(parent: string, child: string): Chainable<JQuery<HTMLElement>>;
    }
  }
}

// load type definitions that come with Cypress module
// / <reference types="cypress" />
Cypress.Commands.add("getDataCy", value => {
  return cy.get(`[data-cy=${value}]`);
});

Cypress.Commands.add("findDataCy", value => {
  return cy.find(`[data-cy=${value}]`);
});

Cypress.Commands.add("getAndClickFirstChild", (parent, child) => {
  return cy.getDataCy(`${parent}`).children(`*[data-cy^=${child}]`).first().click({ force: true });
});
