'use strict';

const {v4: uuidGenerator} = require('uuid')

const MockFirestoreCollectionListElement = require('./firestore.collection.list.element')
const FixtureService = require('./../fixtures/fixtures.service')

class MockFirestoreCollectionList {
  constructor() {}

  static get(mockFixtureData, numberOfElements) {
    const fixtureData = FixtureService.getFixture(mockFixtureData)
    const allData = []

    for (let i=0; i<numberOfElements; i++) {
      const uid = uuidGenerator()
      allData.push(
        MockFirestoreCollectionListElement.getElement(uid, fixtureData.generate)
      )
    }

    return Promise.resolve(allData)
  }
}

module.exports = MockFirestoreCollectionList
