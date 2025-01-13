'use strict'

const {v4: uuidGenerator} = require('uuid')

class MockHeadquarter {
  constructor() {}

  static getBuenosAires() {
    return {
      id: uuidGenerator(),
      name: 'Buenos Aires'
    }
  }

  static getAll() {
    return [
      this.getBuenosAires()
    ]
  }
}

module.exports = MockHeadquarter
