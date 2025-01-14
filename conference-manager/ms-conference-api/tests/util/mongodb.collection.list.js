'use strict'

const { v4: uuidGenerator } = require('uuid')

const MockMongoCollectionListElement = require('./mongodb.collection.list.element')
const FixtureService = require('../fixtures/fixtures.service')

class MockMongoCollectionList {
  constructor() {}

  static get(mockFixtureData, numberOfElements) {
    const fixtureClass = FixtureService.getFixture(mockFixtureData)

    return Promise.resolve(
      Array.from({ length: numberOfElements }).map(() =>
        MockMongoCollectionListElement.getElement(uuidGenerator(), fixtureClass.generate({}))
      )
    )
  }
}

module.exports = MockMongoCollectionList
