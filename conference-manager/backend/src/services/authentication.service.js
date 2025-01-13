'use strict'

const UserAuthentication = require('./../models/user-authentication')

const BaseService = require('./base.service')

class AuthenticationService extends BaseService {
  constructor(adminInstance) {
    super()
    this.adminAuth = adminInstance
  }

  async updateUser(userId, userData) {
    let response

    try {
      const updateResponse = await this.adminAuth.updateUser(userId, userData)

      const successMessage = 'User information updated successfully'
      response = this.getSuccessResponse(updateResponse, successMessage)
    } catch (err) {
      const errorMessage = 'Error updating user'
      /* eslint-disable no-console */
      // console.error(errorMessage, err);
      /* eslint-enable */
      response = this.getErrorResponse(errorMessage)
    }

    return response
  }

  async changePassword(userId, newPassword) {
    return await this.updateUser(userId, {
      password: newPassword,
    })
  }

  /**
   * Enable or Disable user
   * @param {String} userId
   * @param {Boolean} availability
   */
  async changeAvailability(userId, availability) {
    return await this.updateUser(userId, {
      disabled: availability,
    })
  }

  /**
   * Create an authentication user
   * @param {Object} userData
   * @returns {Object}
   */
  async createUser(userData) {
    let response

    try {
      const authResponse = await this.adminAuth.createUser(userData)
      const successMessage = 'Authentication created successfully'
      response = this.getSuccessResponse({ ...authResponse }, successMessage)
    } catch (error) {
      const errorMessage = !error.errorInfo ? 'Error creating user auth' : error.errorInfo.message
      console.error('Error creating user auth', !error.errorInfo ? error : error.errorInfo)
      response = this.getErrorResponse(errorMessage)
    }

    return response
  }

  async createCustomToken(userId) {
    // TODO: Move additional claims
    const additionalClaims = {
      alexa: true,
    }
    return await this.adminAuth.createCustomToken(userId, additionalClaims)
  }

  getModel(data) {
    return new UserAuthentication(data)
  }

  async revokeToken(userId) {
    try {
      await this.adminAuth.revokeRefreshTokens(userId)
      const userRecord = await this.adminAuth.getUser(userId)
      const revokeTimeStamp = new Date(userRecord.tokensValidAfterTime).getTime() / 1000
      return this.getSuccessResponse({ revokeTimeStamp }, 'Sign out successfully')
    } catch (err) {
      return this.getErrorResponse('Error revoking token')
    }
  }

  async verifyToken(token) {
    let response
    let responseData = {
      verified: false,
      id: '',
    }

    try {
      const uid = await this.adminAuth.verifyIdToken(token).then(decodedToken => {
        return decodedToken.uid
      })

      if (!uid) {
        return {
          message: 'Unverified Token',
          data: responseData,
        }
      }
      responseData.verified = true
      responseData.id = uid
      response = this.getSuccessResponse(responseData, 'Successfully verified Token')
    } catch (err) {
      response = this.getErrorResponse('Error while verifying token id')
    }

    return response
  }
}

module.exports = AuthenticationService
