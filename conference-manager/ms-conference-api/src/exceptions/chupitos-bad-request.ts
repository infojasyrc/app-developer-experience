import { Catch, HttpException, HttpStatus } from '@nestjs/common';

@Catch(HttpException)
export class ChupitosBadRequestException extends HttpException {
  constructor(message: string) {
    super(`Bad request exception: ${message}`, HttpStatus.BAD_REQUEST)
  }
}