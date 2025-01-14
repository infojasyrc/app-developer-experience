import { Controller, Get, HttpCode, Logger, Param } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { HeadquarterService } from './headquarter.service'
import { HeadquarterResponse } from './interfaces/headquarter-response'
import { ListHeadquartersSwaggerDecorator } from './../../infrastructure/swagger/v2/list-headquarters.decorator'
import { GetHeadquarterByIdSwaggerDecorator } from './../../infrastructure/swagger/v2/list-headquarter-by-id.decorator'

@ApiTags('HeadquarterController')
@Controller('v2/headquarters')
export class HeadquarterController {
  constructor(private readonly headquarterService: HeadquarterService, private logger: Logger) {}

  @Get()
  @ListHeadquartersSwaggerDecorator()
  @HttpCode(200)
  async getAll(): Promise<HeadquarterResponse[]> {
    this.logger.log('Get all headquarter controller')
    return this.headquarterService.getAll()
  }

  @Get('/:headquarterId')
  @GetHeadquarterByIdSwaggerDecorator()
  @HttpCode(200)
  async getById(@Param('headquarterId') headquarterId: string): Promise<HeadquarterResponse> {
    this.logger.log(`Get headquarter with id: ${headquarterId} controller`)
    return this.headquarterService.getById(headquarterId)
  }
}
