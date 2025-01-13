'use strict'

const BaseController = require('../base.controller')

const serviceContainer = require('../../../services/service.container')

let baseController = new BaseController()

const get = async (request, response) => {
  const userService = await serviceContainer('users')
  let errorResponse

  if (!request.params.id) {
    errorResponse = baseController.getErrorResponse('Parameter is missing')
    return response.status(400).json(errorResponse)
  }

  try {
    const { responseCode, data, message } = await userService.findById(request.params.id)
    
    const successResponse = baseController.getSuccessResponse(data, message)
    return response.status(responseCode).json(successResponse)
  } catch (err) {
    console.error('Error getting user information: ', err)
    errorResponse = baseController.getErrorResponse('Error getting user information')
    return response.status(500).json(errorResponse)
  }
}

const getByUid = async (request, response) => {
  const userService = await serviceContainer('users')

  if (!request.body.uid) {
    return response.status(400).json(baseController.getErrorResponse('Parameters are missing'))
  }

  const userData = await userService.findByUserId(request.body.uid)
  const responseData = {
    status: 'OK',
    data: userData.data,
    message: userData.message,
  }

  return response.status(userData.responseCode).json(responseData)
}
const getUserAttendance = async (request, response) => {
  const userService = await serviceContainer('users')
  const eventService = await serviceContainer('events')

  const eventId = request.params.id
  const userId = request.user.id
  let responseData

  if (!userId || !eventId) {
    return response.status(400).json(baseController.getErrorResponse('Parameters are missing'))
  }

  try {
    const { status, data, message } = await userService.checkUserAttendeeStatus(
      eventId,
      userId,
      eventService
    )

    responseData = {
      status,
      data,
      message,
    }
  } catch (err) {
    console.error('Error verifying user attendance: ', err)
    responseData = baseController.getErrorResponse('Error verifying user attendance')
  }
  return response.json(responseData)
}
const getUserEventsAttendance = async (request, response) => {
  const userService = await serviceContainer('users')
  const eventService = await serviceContainer('events')

  const userId = request.user.id
  if (!userId) {
    return response.status(400).json(baseController.getErrorResponse('Parameters are missing'))
  }

  try {
    const { status, data, message } = await userService.fetchUserEventsAttendance(
      userId,
      eventService
    )

    const responseData = {
      status,
      data,
      message,
    }
    return response.status(200).json(responseData)
  } catch (err) {
    return response
      .status(500)
      .json(baseController.getErrorResponse('Error verifying user attendance'))
  }
}

const post = async (request, response) => {
  const userService = await serviceContainer('users')

  if (!request.body.name || !request.body.lastName || !request.body.email || !request.body.uid) {
    return response.status(400).json(baseController.getErrorResponse('Parameters are missing'))
  }

  let responseCode = 500
  let responseData

  try {
    const newUserData = userService.getModel(request.body)
    const newUseDataResponse = await userService.create(newUserData)

    responseCode = newUseDataResponse.responseCode
    responseData = baseController.getSuccessResponse(
      newUseDataResponse.data,
      newUseDataResponse.message
    )
  } catch (err) {
    console.error('Error creating a new user: ', err)
    responseData = baseController.getErrorResponse('Error creating a new user')
  }

  return response.status(responseCode).json(responseData)
}

const update = async (request, response) => {
  const userService = await serviceContainer('users')

  if (!request.params.id) {
    return response.status(400).json(baseController.getErrorResponse('Parameter is missing'))
  }

  const userId = request.params.id
  let userData = {}

  if (request.body.name) {
    userData.name = request.body.name
  }

  if (request.body.lastName) {
    userData.lastName = request.body.lastName
  }

  if (request.body.email) {
    userData.email = request.body.email
  }

  if (request.body.role) {
    userData.role = request.body.role
  }

  if (Object.prototype.hasOwnProperty.call(request.body, 'isAdmin')) {
    userData.isAdmin = request.body.isAdmin
  }

  if (Object.prototype.hasOwnProperty.call(request.body, 'disabled')) {
    userData.isEnabled = request.body.disabled
  }

  if (request.body.avatarUrl) {
    userData.avatarUrl = request.body.avatarUrl
  }

  let responseCode
  let responseData

  try {
    const updatedData = await userService.update(userId, userData)

    responseCode = updatedData.responseCode
    responseData = baseController.getSuccessResponse(updatedData.data, updatedData.message)
  } catch (err) {
    responseCode = 500
    console.error('Error updating user information: ', err)
    responseData = baseController.getErrorResponse('Error updating user information')
  }

  return response.status(responseCode).json(responseData)
}

const remove = async (request, response) => {
  const userService = await serviceContainer('users')
  const authenticationService = serviceContainer('authentication')

  if (!request.params.id) {
    return response.status(400).json(baseController.getErrorResponse('Parameter is missing'))
  }

  let responseCode
  let responseData

  try {
    const userDocResponse = await userService.toggleEnable(request.params.id)

    const disabledAuthResponse = await authenticationService.changeAvailability(
      userDocResponse.data.userId,
      userDocResponse.data.isEnabled
    )

    responseCode = disabledAuthResponse.responseCode
    responseData = baseController.getSuccessResponse(
      disabledAuthResponse.data,
      disabledAuthResponse.message
    )
  } catch (err) {
    responseCode = 500
    console.error('Error removing user: ', err)
    responseData = baseController.getErrorResponse('Error removing user')
  }

  return response.status(responseCode).json(responseData)
}

const changePassword = async (request, response) => {
  const authenticationService = serviceContainer('authentication')

  if (
    !request.body.id ||
    !request.body.uid ||
    !request.body.oldPassword ||
    !request.body.newPassword ||
    !request.body.confirmPassword
  ) {
    return response.status(400).json(baseController.getErrorResponse('Parameters are missing'))
  }

  let responseCode
  let responseData

  try {
    const updatedUserData = await authenticationService.changePasswordUsingAdminSDK(
      request.body.uid,
      request.body.newPassword
    )

    if (!updatedUserData.data) {
      return response.status(401).json({
        status: 'Unauthorized',
        message: updatedUserData.message,
      })
    }

    responseCode = updatedUserData.responseCode
    responseData = baseController.getSuccessResponse(updatedUserData.data, updatedUserData.message)
  } catch (err) {
    responseCode = 500
    console.error('Error changing password: ', err)
    responseData = baseController.getErrorResponse('Error changing password')
  }

  return response.status(responseCode).json(responseData)
}

module.exports = {
  get,
  getByUid,
  getUserAttendance,
  getUserEventsAttendance,
  post,
  update,
  remove,
  changePassword,
}
