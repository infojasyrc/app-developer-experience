import { Catch, HttpException, HttpStatus } from '@nestjs/common'

@Catch(HttpException)
export class NotFoundException extends HttpException {
  constructor(message: string) {
    super(`Not found exception: ${message}`, HttpStatus.NOT_FOUND)
  }
}
