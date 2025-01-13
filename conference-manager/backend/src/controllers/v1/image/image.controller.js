'use strict'

const BaseController = require('../base.controller')
const serviceContainer = require('../../../services/service.container')

const baseController = new BaseController()

const post = async (request, response) => {
  const storageService = await serviceContainer('storage')

  if (!request.files || request.files.length === 0) {
    return response.status(400).json(baseController.getErrorResponse('No files were uploaded'))
  }

  const urls = []

  for (const key in request.files) {
    if (!Object.prototype.hasOwnProperty.call(request.files, key)) {
      continue
    }

    const file = request.files[key]
    try {
      const result = await storageService.upload(file)

      if (result.data.url === '') {
        const errorMessage =
          'There was an error while uploading the files, ' +
          'no Url was returned by Storage service'
        return response.status(400).json(baseController.getErrorResponse(errorMessage))
      }

      urls.push(result.data)
    } catch (error) {
      console.error('There was an error while uploading the files: ', error)
      return response
        .status(500)
        .json(baseController.getErrorResponse('There was an error while uploading the files'))
    }
  }

  return response.status(200).json(baseController.getSuccessResponse(urls, 'Success'))
}

const erase = async (request, response) => {
  const storageService = await serviceContainer('storage')

  if (!request.params.id) {
    return response
      .status(400)
      .json(baseController.getErrorResponse('You must provide the id to delete'))
  }

  let responseCode
  let responseData

  try {
    const result = await storageService.erase(request.params.id)

    responseCode = result.responseCode
    responseData = baseController.getSuccessResponse({}, result.message)
  } catch (error) {
    console.error('Error while deleting image', error)
    responseCode = 500
    responseData = baseController.getErrorResponse('Error while deleting image')
  }

  return response.status(responseCode).json(responseData)
}

module.exports = {
  post,
  erase,
}
