'use strict'

const BaseController = require('../base.controller')
const serviceContainer = require('../../../services/service.container')

let baseController = new BaseController()

const get = async (request, response) => {
  const userService = await serviceContainer('users')

  let responseCode
  let responseData

  try {
    const usersData = await userService.doList()

    responseCode = usersData.responseCode
    responseData = baseController.getSuccessResponse(usersData.data, usersData.message)
  } catch (err) {
    responseCode = 500
    console.error('Error getting all users: ', err)
    responseData = baseController.getErrorResponse('Error getting all users.')
  }

  return response.status(responseCode).json(responseData)
}

module.exports = {
  get,
}
