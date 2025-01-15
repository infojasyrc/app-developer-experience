'use strict';

class MockFirestoreCollectionListElement {
  constructor() {}

  static getElement(id, functionName) {
    return {
      id: id,
      data: functionName
    };
  }
}

module.exports = MockFirestoreCollectionListElement;
