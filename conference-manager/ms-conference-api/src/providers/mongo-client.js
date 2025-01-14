'use strict'

const { MongoClient } = require('mongodb')
const getEnvironmentVariables = require('./../infrastructure/environment')

let mongoClient = null

module.exports = class Mongo {
  constructor() {
    const { MONGODB_URI, DEFAULT_DB } = getEnvironmentVariables()
    this.db_connection = MONGODB_URI
    this.default_db = DEFAULT_DB

    if (!mongoClient) {
      mongoClient = new MongoClient(this.db_connection)
      mongoClient.connect()
    }
    this.mongoClient = mongoClient
  }

  async dbInstance() {
    try {
      const db = await this.mongoClient.db(this.default_db)
      return db
    } catch (error) {
      throw new Error('Error trying to get Mongo database instance', error)
    }
  }
}
