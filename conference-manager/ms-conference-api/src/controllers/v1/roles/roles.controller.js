'use strict'

const BaseController = require('../base.controller')
const serviceContainer = require('../../../services/service.container')

let baseController = new BaseController()

const get = async (request, response) => {
  const rolesService = await serviceContainer('roles')

  let responseCode
  let responseData

  try {
    const rolesData = await rolesService.doList()

    responseCode = rolesData.responseCode
    responseData = baseController.getSuccessResponse(rolesData.data, rolesData.message)
  } catch (err) {
    console.error('Error getting all roles: ', err)
    responseCode = 500
    responseData = baseController.getErrorResponse('Error getting all roles')
  }

  return response.status(responseCode).json(responseData)
}

module.exports = {
  get,
}
