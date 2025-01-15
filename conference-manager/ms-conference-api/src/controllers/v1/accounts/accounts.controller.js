'use strict'

const BaseController = require('../base.controller')
const serviceContainer = require('../../../services/service.container')

const baseController = new BaseController()

let responseCode
let responseData

const checkBalance = async (request, response) => {
  const accountsService = await serviceContainer('accounts')
  const sessionService = await serviceContainer('session')

  if (!baseController.isTokenInHeader(request)) {
    // prettier-ignore
    return response.status(403).json(
      baseController.getErrorResponse('No session information')
    )
  }

  responseCode = 500

  try {
    const sessionInfo = await sessionService.getUserSession(request.headers.authorization)

    if (sessionInfo.data) {
      const balanceResponse = await accountsService.checkBalance(sessionInfo.data)

      responseCode = balanceResponse.responseCode
      responseData = baseController.getSuccessResponse(
        balanceResponse.data,
        balanceResponse.message
      )
    } else {
      responseCode = sessionInfo.responseCode
      responseData = baseController.getErrorResponse(sessionInfo.message)
    }
  } catch (err) {
    const errorMessage = 'Error getting balance information'
    /* eslint-disable no-console */
    // console.error(errorMessage, err)
    /* eslint-enable */
    responseData = baseController.getErrorResponse(errorMessage)
  }

  return response.status(responseCode).json(responseData)
}

const getAll = async (request, response) => {
  const accountsService = await serviceContainer('accounts')
  const sessionService = await serviceContainer('session')

  if (!baseController.isTokenInHeader(request)) {
    // prettier-ignore
    return response.status(400).json(
      baseController.getErrorResponse('No session information')
    )
  }

  responseCode = 500

  try {
    const sessionInfo = await sessionService.getUserSession(request.headers.authorization)

    if (sessionInfo.data) {
      const balanceResponse = await accountsService.getAll(sessionInfo.data)

      responseCode = balanceResponse.responseCode
      responseData = baseController.getSuccessResponse(
        balanceResponse.data,
        balanceResponse.message
      )
    } else {
      responseCode = sessionInfo.responseCode
      responseData = baseController.getErrorResponse(sessionInfo.message)
    }
  } catch (err) {
    const errorMessage = 'Error getting accounts information'
    /* eslint-disable no-console */
    // console.error(errorMessage, err)
    /* eslint-enable */
    responseData = baseController.getErrorResponse(errorMessage)
  }

  return response.status(responseCode).json(responseData)
}

module.exports = {
  checkBalance,
  getAll,
}
