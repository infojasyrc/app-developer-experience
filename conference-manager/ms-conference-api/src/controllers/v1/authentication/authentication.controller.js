'use strict'

const BaseController = require('../base.controller')
const serviceContainer = require('../../../services/service.container')

let baseController = new BaseController()

let responseCode
let responseData

const revokeToken = async (request, response) => {
  const authenticationService = await serviceContainer('authentication')
  const sessionService = await serviceContainer('session')

  try {
    const sessionInfo = await sessionService.getUserSession(request.headers.authorization)

    if (!sessionInfo.data) {
      return response.status(sessionInfo.responseCode).json({ message: sessionInfo.message })
    }

    const loginData = await authenticationService.revokeToken(sessionInfo.data)

    responseData = baseController.getSuccessResponse(
      { timeStamp: loginData.data },
      loginData.message
    )
    return response.status(loginData.responseCode).json(responseData)
  } catch (err) {
    responseData = baseController.getErrorResponse('Error revoking token')
    return response.status(500).json(responseData)
  }
}

const resetPassword = async (request, response) => {
  const authenticationService = await serviceContainer('authentication')

  if (!request.body.email) {
    return response.status(400).json(baseController.getErrorResponse('Email parameter is missing'))
  }

  responseCode = 500
  try {
    let authenticationData = await authenticationService.resetPassword(request.body.email)

    responseCode = authenticationData.responseCode
    responseData = baseController.getSuccessResponse(
      authenticationData.data,
      authenticationData.message
    )
  } catch (err) {
    const errorMessage = 'Error resetting password'
    /* eslint-disable no-console */
    // console.error(errorMessage, err)
    /* eslint-enable */
    responseData = baseController.getErrorResponse(errorMessage)
  }

  return response.status(responseCode).json(responseData)
}

const create = async (request, response) => {
  const authenticationService = await serviceContainer('authentication')

  if (
    !request.body.email ||
    !request.body.password ||
    !request.body.name ||
    !request.body.lastName
  ) {
    return response.status(400).json(baseController.getErrorResponse('Parameters are missing'))
  }

  responseCode = 500
  try {
    const authData = authenticationService.getModel(request.body)

    const authenticationResponse = await authenticationService.createUser(authData)

    responseCode = authenticationResponse.responseCode
    responseData = baseController.getSuccessResponse(
      authenticationResponse.data,
      authenticationResponse.message
    )
  } catch (error) {
    const errorMessage = 'Error creating authorization user'
    /* eslint-disable */
    // console.error(errorMessage, error)
    /* eslint-enable */
    responseData = baseController.getErrorResponse(errorMessage)
  }

  return response.status(responseCode).json(responseData)
}

module.exports = {
  create,
  revokeToken,
  resetPassword,
}
