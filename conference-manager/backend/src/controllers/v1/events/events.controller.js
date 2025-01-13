'use strict'

const BaseController = require('../base.controller')
const serviceContainer = require('../../../services/service.container')

let baseController = new BaseController()

const get = async (request, response) => {
  const eventsService = await serviceContainer('events')

  const eventParameters = {}
  let responseData

  eventParameters.year = !request.query.year ? null : request.query.year
  eventParameters.headquarterId = !request.query.headquarterId ? null : request.query.headquarterId
  eventParameters.isAdmin = request.query.isAdmin

  try {
    const events = await eventsService.doList(eventParameters)
    responseData = baseController.getSuccessResponse(events.data, events.message)
    return response.status(events.responseCode).json(responseData)
  } catch (error) {
    responseData = baseController.getErrorResponse('Error while listing events')
    return response.status(500).json(responseData)
  }
}

module.exports = { get }
