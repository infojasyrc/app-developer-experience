'use strict'

class MockMongoCollectionListElement {
  constructor() {}

  static getElement(id, functionName) {
    return {
      id: id,
      data: functionName,
    }
  }
}

module.exports = MockMongoCollectionListElement
