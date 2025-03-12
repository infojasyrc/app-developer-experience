import { createEvent, updatEventStatus } from "./core/utils"
// import EventDetail from "./page-objects/EventDetail"
import Login from "./page-objects/login"

before(() => {
  cy.clearAllSiteData()
  cy.visit("")
})

describe("Events Test Suite", () => {
  let loginPage: Login
  // let eventDetailPage: EventDetail
  let eventData: any

  before(() => {
    loginPage = new Login()
    // eventDetailPage = new EventDetail()
    loginPage.navigate()
  })
  after(() =>{
    cy.logOut()
  })

  it("Admin should be able to create an event", () => {
    loginPage.navigate()
    // TODO: this should be refactor because we are NOT using this as env variables
    loginPage.loginToApp(`${Cypress.env("ADMIN_USER_EMAIL")}`,`${Cypress.env("ADMIN_USER_PWD")}`)
    cy.wait(3000)
    cy.window().its("localStorage").invoke('getItem', 'token').then(token => {
      cy.request({
        method: "POST",
        url: `${Cypress.env("EVENTS_ENDPOINT")}`,
        body: createEvent(),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token?.replace(/"(.+)"/g, '$1')}`,
        },
      }).then((response)=>{
        eventData = response.body.data
        expect(response.body).to.have.property('message', 'Event was successfully created.')
      })
    })
  })

  it("Admin should be able to active an event", () => {
    cy.wait(3000)
    cy.visit(`/event-info/${eventData._id}`)
    cy.window().its("localStorage").invoke('getItem', 'token').then(token => {
      cy.request({
        method: "PUT",
        url: `${Cypress.env("EVENTS_ENDPOINT")}/${eventData._id}`,
        body: updatEventStatus(),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token?.replace(/"(.+)"/g, '$1')}`,
        },
      }).then((response)=>{
        eventData = response.body.data
        expect(response.body).to.have.property('message', 'Event was updated successfully')
      })
    })
    cy.visit(`/event-info/${eventData._id}`)
  })

  it("User should be able to see the active event", () => {
    cy.logOut()
    loginPage.navigate()
    loginPage.loginToApp(`${Cypress.env("TEST_USER_EMAIL")}`,`${Cypress.env("TEST_USER_PWD")}`)
    cy.wait(1000)
    cy.visit(`/event-info/${eventData._id}`)
  })

})
