'use strict'

class BaseController {
  constructor() {
    this.successStatus = 'OK'
    this.errorStatus = 'ERROR'
    this.responseData = {
      status: '',
      data: {},
      message: '',
    }
  }

  getSuccessResponse(data, message) {
    this.responseData.status = this.successStatus
    this.responseData.data = data
    this.responseData.message = message
    return this.responseData
  }

  getErrorResponse(message) {
    this.responseData.status = this.errorStatus
    this.responseData.data = {}
    this.responseData.message = message
    return this.responseData
  }

  isTokenInHeader(request) {
    return request.headers.authorization
  }
}

module.exports = BaseController
