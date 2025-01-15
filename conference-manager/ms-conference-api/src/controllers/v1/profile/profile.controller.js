'use strict'

const BaseController = require('../base.controller')
const serviceContainer = require('../../../services/service.container')

const baseController = new BaseController()

let responseCode
let responseData

const get = async (request, response) => {
  const sessionService = await serviceContainer('session')
  const userService = await serviceContainer('users')

  // Access forbidden
  if (!baseController.isTokenInHeader(request)) {
    return response.status(403).json(baseController.getErrorResponse('No session information'))
  }

  try {
    const sessionInfo = await sessionService.getUserSession(request.headers.authorization)

    if (!sessionInfo.status || sessionInfo.responseCode !== 200) {
      return response
        .status(sessionInfo.responseCode)
        .json(baseController.getErrorResponse(sessionInfo.message))
    }

    const userResponse = await userService.findByUserId(sessionInfo.data)

    responseCode = userResponse.responseCode
    responseData = baseController.getSuccessResponse(userResponse.data, userResponse.message)
  } catch (err) {
    const errorMessage = 'Error getting user profile'
    console.error(errorMessage, err)
    responseCode = 500
    responseData = baseController.getErrorResponse(errorMessage)
  }

  return response.status(responseCode).json(responseData)
}

module.exports = {
  get,
}
