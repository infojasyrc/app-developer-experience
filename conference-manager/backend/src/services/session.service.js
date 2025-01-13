'use strict'

const BaseService = require('./base.service')

class SetupSessionService extends BaseService {
  constructor(adminAuthInstance) {
    super()
    this.adminAuth = adminAuthInstance
  }

  async getUserSession(idToken) {
    try {
      const decodedToken = await this.adminAuth.verifyIdToken(idToken.replace('Bearer ', ''))
      return this.getSuccessResponse(
        decodedToken.uid,
        'Getting user session information successfully'
      )
    } catch (err) {
      return this.getErrorResponse('Error getting user session information')
    }
  }
}
module.exports = SetupSessionService
