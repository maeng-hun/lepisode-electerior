import { Controller, Get, Post, Patch, Delete, Body, UploadedFile, UseInterceptors, UseGuards } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { FileInterceptor } from '@nestjs/platform-express'
import { BusinessInfoService } from './business-info.service'
import { CreateBusinessInfoDTO } from './dtos/create-business-info.dto'
import { UpdateBusinessInfoDTO } from './dtos/update-business-info.dto'
import { JwtAuthGuard } from '../guards/jwt-auth.guard'
import { RolesGuard } from '../guards/roles.guard'
import { Roles } from '../guards/roles.decorator'
import { BusinessInfoResponseDTO } from './dtos/business-info-response.dto'

@ApiTags('Business Info')
@Controller('business-info')
export class BusinessInfoController {
  constructor(private readonly service: BusinessInfoService) {}

  @Get()
  @ApiOperation({
    summary: '사업자 정보 조회',
    description: '등록된 사업자 정보를 조회합니다.'
  })
  @ApiOkResponse({ type: BusinessInfoResponseDTO, isArray: false })
  async get() {
    return this.service.find()
  }

  @Post()
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(FileInterceptor('storage'))
  @ApiOperation({
    summary: '사업자 정보 생성',
    description: '관리자 권한으로 사업자 정보를 생성합니다. 필요 시 로고 이미지도 업로드 가능합니다.'
  })
  async create(@Body() data: CreateBusinessInfoDTO, @UploadedFile() file?: Express.Multer.File) {
    return this.service.create(data, file)
  }

  @Patch()
  @ApiOperation({
    summary: '사업자 정보 수정',
    description: '관리자 권한으로 사업자 정보를 수정합니다. 필요 시 로고 이미지도 교체 가능합니다.'
  })
  @ApiOkResponse({ type: Boolean })
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(FileInterceptor('storage'))
  async update(@Body() data: UpdateBusinessInfoDTO, @UploadedFile() file?: Express.Multer.File) {
    return this.service.update(data, file)
  }

  @Delete()
  @ApiOperation({
    summary: '사업자 정보 삭제',
    description: '관리자 권한으로 등록된 사업자 정보를 삭제합니다.'
  })
  @ApiOkResponse({ type: Boolean })
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async delete() {
    return this.service.remove()
  }

  @Delete('storage')
  @ApiOperation({
    summary: '사업자 로고 삭제',
    description: '관리자 권한으로 유일한 사업자 로고 이미지를 삭제합니다.'
  })
  @ApiOkResponse({ schema: { type: 'object', properties: { message: { type: 'string' } } } })
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async deleteLogo() {
    return this.service.removeImage()
  }
}
