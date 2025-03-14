import Page from '../core/Page'
const loginFixture = require('../../fixtures/login.json')

class EventDetail extends Page {
  private url: string
  private eventStatus: string

  constructor() {
    super(loginFixture)
    this.url = '/event-info/'
    this.eventStatus =
      'div.MuiPaper-root .makeStyles-innerContainer-2 > div.MuiGrid-root:nth-child(1) button + div'
  }

  navigate() {
    cy.visit(this.url)
  }

  getEventStatus() {
    return cy.get(this.eventStatus)
  }
}

export default EventDetail
