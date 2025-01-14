'use strict'

const BaseController = require('../base.controller')
const serviceContainer = require('../../../services/service.container')

let baseController = new BaseController()

const get = async (request, response) => {
  const rolesService = await serviceContainer('roles')

  if (!request.params.id) {
    return response.status(400).json(baseController.getErrorResponse('Parameter is missing'))
  }

  let responseCode
  let responseData

  try {
    const roleData = await rolesService.getRole(request.params.id)

    responseCode = roleData.responseCode
    responseData = baseController.getSuccessResponse(roleData.data, roleData.message)
  } catch (err) {
    console.error('Error getting role information: ', err)
    responseCode = 500
    responseData = baseController.getErrorResponse('Error getting role information')
  }

  return response.status(responseCode).json(responseData)
}

module.exports = {
  get,
}
