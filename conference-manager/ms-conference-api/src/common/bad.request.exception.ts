import { HttpException, HttpStatus } from "@nestjs/common";

export class BadRequestException extends HttpException {
  constructor(message: string,data?: object) {
      const response = {
          error: "Bad request",
          message: message,
          data
      };
      super(response, HttpStatus.BAD_REQUEST);
  }
}
