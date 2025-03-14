/// <reference types="cypress" />
declare global {
  namespace Cypress {
    interface Chainable {
      clearAllSiteData(): Chainable
      logOut(): Chainable
    }
  }
  interface Window {
    Cypress?: Cypress.Cypress
    store: any
  }
}

Cypress.Commands.add('clearAllSiteData', () => {
  cy.clearAllLocalStorage()
  cy.clearAllCookies()
  cy.clearAllSessionStorage()
})

Cypress.Commands.add('logOut', () => {
  cy.get("[data-testid='header'] button").click()
  cy.get('#menu-appbar .MuiMenu-paper li:nth-child(3)').click()
})

export {}
