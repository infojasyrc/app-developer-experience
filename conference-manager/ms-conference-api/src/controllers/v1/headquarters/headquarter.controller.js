'use strict'

const BaseController = require('../base.controller')
const serviceContainer = require('../../../services/service.container')

let baseController = new BaseController()

const get = async (request, response) => {
  const headquartersService = await serviceContainer('headquarters')

  if (!request.params.id) {
    return response.status(400).json(baseController.getErrorResponse('Parameter is missing'))
  }

  let responseCode = 500
  let responseData

  try {
    const headquarterData = await headquartersService.getHeadquarter(request.params.id)
    responseCode = headquarterData.responseCode
    // prettier-ignore
    responseData = baseController.getSuccessResponse(
      headquarterData.data,
      headquarterData.message
    )
  } catch (err) {
    const errorMessage = 'Error getting headquarter information'
    /* eslint-disable no-console */
    console.error(errorMessage, err)
    /* eslint-enable */
    responseData = baseController.getErrorResponse(errorMessage)
  }

  return response.status(responseCode).json(responseData)
}

module.exports = {
  get,
}
