import { Body, Controller, Delete, Get, HttpCode, Logger, Param, Post, Put, UseGuards } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { AuthGuard } from '@nestjs/passport'

import { HeadquarterService } from './headquarter.service'
import { HeadquarterResponse } from './interfaces/headquarter-response'
import { CreateHeadquarterDto } from './dto/create-headquarter.dto'
import { UpdateHeadquarterDto } from './dto/update-headquarter.dto'
import { RolesGuard } from '../guard/roles.guard'
import { Roles } from '../guard/roles.guard.decorator'
import { ADMIN_ROLE } from '../../common/constants'
import { ListHeadquartersSwaggerDecorator } from '../../infrastructure/swagger/v2/list-headquarters.decorator'
import { GetHeadquarterByIdSwaggerDecorator } from '../../infrastructure/swagger/v2/list-headquarter-by-id.decorator'
import { CreateHeadquarterSwaggerDecorator } from '../../infrastructure/swagger/v2/create-headquarter.decorator'
import { UpdateHeadquarterSwaggerDecorator } from '../../infrastructure/swagger/v2/update-headquarter.decorator'
import { DeleteHeadquarterSwaggerDecorator } from '../../infrastructure/swagger/v2/delete-headquarter.decorator'

@ApiTags('headquarters')
@Controller('v2/headquarters')
export class HeadquarterController {
  constructor(private readonly headquarterService: HeadquarterService, private logger: Logger) { }

  @Post()
  @CreateHeadquarterSwaggerDecorator()
  @Roles(ADMIN_ROLE)
  @UseGuards(AuthGuard('firebase-auth'), RolesGuard)
  @HttpCode(201)
  async create(@Body() dto: CreateHeadquarterDto): Promise<HeadquarterResponse> {
    this.logger.log('Create headquarter controller')
    return this.headquarterService.create(dto)
  }

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

  @Put('/:headquarterId')
  @UpdateHeadquarterSwaggerDecorator()
  @Roles(ADMIN_ROLE)
  @UseGuards(AuthGuard('firebase-auth'), RolesGuard)
  @HttpCode(200)
  async update(
    @Param('headquarterId') headquarterId: string,
    @Body() dto: UpdateHeadquarterDto,
  ): Promise<HeadquarterResponse> {
    this.logger.log(`Update headquarter with id: ${headquarterId} controller`)
    return this.headquarterService.update(headquarterId, dto)
  }

  @Delete('/:headquarterId')
  @DeleteHeadquarterSwaggerDecorator()
  @Roles(ADMIN_ROLE)
  @UseGuards(AuthGuard('firebase-auth'), RolesGuard)
  @HttpCode(204)
  async delete(@Param('headquarterId') headquarterId: string): Promise<void> {
    this.logger.log(`Delete headquarter with id: ${headquarterId} controller`)
    return this.headquarterService.delete(headquarterId)
  }
}
