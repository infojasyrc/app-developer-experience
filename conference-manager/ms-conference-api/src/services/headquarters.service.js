'use strict'

const BaseService = require('./base.service')

class HeadquarterService extends BaseService {
  constructor(dbInstance) {
    super()
    this.collection = dbInstance.collection('headquarters')
  }

  async doList() {
    let allData = []
    let response

    try {
      const headquartersData = await this.collection.find().toArray()

      const message = 'Getting all headquarters successfully'
      response = this.getSuccessResponse(headquartersData, message)
    } catch (err) {
      const errorMessage = 'Error getting all headquarters information'
      /* eslint-disable no-console */
      console.error(errorMessage, err)
      /* eslint-enable */
      response = this.getErrorResponse(errorMessage)
    }

    return response
  }

  async getHeadquarter(docId) {
    let response

    try {
      const headquarterRef = await this.collection.doc(docId).get()
      let headquarterData = {}
      if (headquarterRef.exists) {
        headquarterData = { ...headquarterRef.data(), id: docId }
      }

      const message = 'Getting headquarter information successfully'
      response = this.getSuccessResponse(headquarterData, message)
    } catch (err) {
      const errorMessage = 'Error getting headquarter information'
      /* eslint-disable no-console */
      // console.log(errorMessage, err)
      /* eslint-enable */
      response = this.getErrorResponse(errorMessage)
    }

    return response
  }
}

module.exports = HeadquarterService
