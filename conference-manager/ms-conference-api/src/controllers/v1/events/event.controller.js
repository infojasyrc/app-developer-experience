'use strict'

const BaseController = require('../base.controller')
const serviceContainer = require('../../../services/service.container')

const { isObjectEmpty } = require('../../../helpers/utils')

let baseController = new BaseController()

const get = async (request, response) => {
  const eventsService = await serviceContainer('events')

  if (!request.params.id) {
    return response.status(400).json(baseController.getErrorResponse('Missing eventId parameter'))
  }

  const id = request.params.id
  let responseCode = 500
  let responseData

  try {
    let eventResponse = await eventsService.findById(id)
    responseCode = eventResponse.responseCode
    responseData = baseController.getSuccessResponse(eventResponse.data, eventResponse.message)
  } catch (err) {
    const errorMessage = `Error while getting event with id: ${id}`
    /* eslint-disable no-console */
    // console.error(errorMessage, err)
    /* eslint-enable */
    responseData = baseController.getErrorResponse(errorMessage)
  }
  return response.status(responseCode).json(responseData)
}

const post = async (request, response) => {
  const eventsService = await serviceContainer('events')

  let eventData = {}
  let responseData

  eventData = {
    images: [],
    name: request.body.name,
    eventDate: request.body.eventDate,
    owner: request.user.id,
    type: request.body.type,
    tags: request.body.tags,
    headquarter: request.body.headquarter,
    description: request.body.description,
    address: request.body.address ? request.body.address : '',
    phoneNumber: request.body.phoneNumber ? request.body.phoneNumber : '',
  }

  try {
    const eventResponse = await eventsService.create(eventData)
    responseData = baseController.getSuccessResponse(eventResponse.data, eventResponse.message)
    return response.status(eventResponse.responseCode).json(responseData)
  } catch (err) {
    responseData = baseController.getErrorResponse('Error adding an event.')
    return response.status(500).json(responseData)
  }
}

const update = async (request, response) => {
  const eventsService = await serviceContainer('events')
  let responseData
  try {
    const eventResponse = await eventsService.update(request.params.id, request.body)
    responseData = baseController.getSuccessResponse(eventResponse.data, eventResponse.message)
    return response.status(eventResponse.responseCode).json(responseData)
  } catch (err) {
    responseData = baseController.getErrorResponse('Error updating event')
    return response.status(500).json(responseData)
  }
}

const updateImages = async (request, response) => {
  const eventsService = await serviceContainer('events')

  if (!request.body.images) {
    return response.status(400).json(baseController.getErrorResponse('No images sent'))
  }

  let responseCode
  let responseData

  const id = request.params.id

  try {
    const eventResponse = await eventsService.updateImages(id, request.body.images)

    responseCode = eventResponse.responseCode
    responseData = baseController.getSuccessResponse(eventResponse.data, eventResponse.message)
  } catch (err) {
    responseCode = 500
    console.error('Error updating images: ', err)
    responseData = baseController.getErrorResponse('Error updating images')
  }

  return response.status(responseCode).json(responseData)
}

const deleteImage = async (request, response) => {
  const eventsService = await serviceContainer('events')

  if (!request.params.id || !request.params.idImage) {
    return response.status(400).json(baseController.getErrorResponse('Wrong parameters'))
  }

  const id = request.params.id
  const idImage = request.params.idImage
  let responseData
  let responseCode = 500

  try {
    const deleteResponse = await eventsService.deleteImage(id, idImage)

    responseCode = deleteResponse.responseCode
    responseData = baseController.getSuccessResponse(deleteResponse.data, deleteResponse.message)
  } catch (err) {
    const errorMessage = 'Error while deleting image'
    /* eslint-disable no-console */
    // console.error(errorMessage, err);
    /* eslint-enable */
    responseData = baseController.getErrorResponse(errorMessage)
  }

  return response.status(responseCode).json(responseData)
}

const open = async (request, response) => {
  const eventsService = await serviceContainer('events')

  if (!request.params.id) {
    return response.status(400).json(baseController.getErrorResponse('Wrong parameters'))
  }

  let responseCode
  let responseData

  const id = request.params.id

  try {
    const openResponse = await eventsService.open(id)

    responseCode = openResponse.responseCode
    responseData = baseController.getSuccessResponse(openResponse.data, openResponse.message)
  } catch (error) {
    responseCode = 500
    console.error('Error while opening event: ', error)
    responseData = baseController.getErrorResponse('Error while opening event')
  }

  return response.status(responseCode).json(responseData)
}

const pause = async (request, response) => {
  const eventsService = await serviceContainer('events')

  if (!request.params.id) {
    return response.status(400).json(baseController.getErrorResponse('Wrong parameters'))
  }

  const id = request.params.id
  let responseCode
  let responseData

  try {
    const pauseResponse = await eventsService.pause(id)

    responseCode = pauseResponse.responseCode
    responseData = baseController.getSuccessResponse(pauseResponse.data, pauseResponse.message)
  } catch (error) {
    responseCode = 500
    console.error('Error while pausing event: ', error)
    responseData = baseController.getErrorResponse('Error while pausing event')
  }

  return response.status(responseCode).json(responseData)
}

const close = async (request, response) => {
  const eventsService = await serviceContainer('events')

  if (!request.params.id) {
    return response.status(400).json(baseController.getErrorResponse('Wrong parameters'))
  }

  const id = request.params.id

  let responseCode
  let responseData

  try {
    const closeResponse = await eventsService.close(id)

    responseCode = closeResponse.responseCode
    responseData = baseController.getSuccessResponse(closeResponse.data, closeResponse.message)
  } catch (error) {
    let errorMessage = `Error while closing event with id: ${id}`
    console.error(errorMessage, error)
    responseCode = 500
    responseData = baseController.getErrorResponse('Error while closing event')
  }

  return response.status(responseCode).json(responseData)
}

const addAttendees = async (request, response) => {
  const eventsService = await serviceContainer('events')
  const authService = await serviceContainer('authentication')
  if (!request.params.id || !request.body.attendees || isObjectEmpty(request.body.attendees)) {
    return response.status(400).json(baseController.getErrorResponse('Wrong parameters'))
  }

  const id = request.params.id

  const token = request.headers.authorization.replace('Bearer ', '')

  let responseCode
  let responseData

  try {
    const authVerifyResponse = await authService.verifyToken(token)

    if (!authVerifyResponse.status) {
      return response
        .status(400)
        .json(baseController.getErrorResponse('Error while verifying token id'))
    }
    const addAttendeesResponse = await eventsService.addAttendees(id, authVerifyResponse.data.id)

    responseCode = addAttendeesResponse.responseCode
    responseData = baseController.getSuccessResponse(
      addAttendeesResponse.data,
      addAttendeesResponse.message
    )
  } catch (error) {
    let errorMessage = `Error while adding attendees to event with id: ${id}`
    console.error(errorMessage, error)
    responseCode = 500
    responseData = baseController.getErrorResponse(errorMessage)
  }

  return response.status(responseCode).json(responseData)
}

const remove = async (request, response) => {
  const eventsService = await serviceContainer('events')
  const { id } = request.params

  let responseData

  try {
    const eventResponse = await eventsService.remove(id)
    responseData = baseController.getSuccessResponse(eventResponse.data, eventResponse.message)
    return response.status(eventResponse.responseCode).json(responseData)
  } catch (err) {
    responseData = baseController.getErrorResponse(`Error while removing event with id: ${id}`)
    return response.status(500).json(responseData)
  }
}

module.exports = {
  get,
  post,
  update,
  updateImages,
  deleteImage,
  open,
  pause,
  close,
  addAttendees,
  remove,
}
