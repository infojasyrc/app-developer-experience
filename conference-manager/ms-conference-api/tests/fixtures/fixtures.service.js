'use strict'

const EventFixture = require('./event.mock')

class FixtureService {
  constructor() {}

  static getFixture(fixtureType) {
    switch (fixtureType) {
      case 'events':
      default:
        return new EventFixture()
    }
  }
}

module.exports = FixtureService
