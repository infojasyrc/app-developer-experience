'use strict';

class BaseService {

  constructor() {
    this.successResponseCode = 200;
    this.errorResponseCode = 500;
    this.returnData = {
      status: false,
      data: {},
      message: '',
      responseCode: this.successResponseCode
    };
  }

  getSuccessResponse(data, message) {
    this.returnData.data = data;
    this.returnData.responseCode = this.successResponseCode;
    this.returnData.message = message;
    this.returnData.status = true;

    return this.returnData;
  }

  getErrorResponse(message) {
    this.returnData.data = {};
    this.returnData.responseCode = this.errorResponseCode;
    this.returnData.message = message;
    this.returnData.status = false;

    return this.returnData;
  }
}

module.exports = BaseService;
