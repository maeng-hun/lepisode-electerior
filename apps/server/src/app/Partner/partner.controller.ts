import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
  UseGuards
} from '@nestjs/common'
import { CreatePartnerDTO } from './dtos/create-partner.dto'
import { PartnerService } from './partner.service'
import { UpdatePartnerDTO } from './dtos/update-partner.dto'
import { PaginatePartnerDTO } from './dtos/paginate-partner.dto'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiOperation } from '@nestjs/swagger'

@Controller('partner')
export class PartnerController {
  constructor(private readonly partnerService: PartnerService) {}

  @Get()
  @ApiOperation({
    summary: '협력사 목록 전체 조회',
    description: '협력사 목록 전체를 조회합니다.'
  })
  async findMany(@Query() dto: PaginatePartnerDTO) {
    return await this.partnerService.findMany(dto)
  }

  @Get(':id')
  async findUnique(@Param('id') id: string) {
    return await this.partnerService.findUnique(id)
  }

  // 협력사 등록
  @Post()
  @ApiOperation({
    summary: '협력사 정보 등록',
    description: '협력사를 등록합니다.'
  })
  @UseInterceptors(FileInterceptor('image'))
  async create(@Body() dto: CreatePartnerDTO, @UploadedFile() file?: Express.Multer.File) {
    return await this.partnerService.create(dto, file)
  }

  // 협력사 수정
  @Patch(':id')
  @ApiOperation({
    summary: '협력사 정보 수정',
    description: '협력사 정보를 수정합니다.'
  })
  @UseInterceptors(FileInterceptor('image'))
  async update(@Param('id') id: string, @Body() dto: UpdatePartnerDTO, @UploadedFile() file?: Express.Multer.File) {
    return await this.partnerService.update(id, dto, file)
  }

  // 협력사 삭제
  @Delete(':id')
  @ApiOperation({
    summary: '협력사 정보 삭제',
    description: '협력사 정보를 삭제합니다.'
  })
  async delete(@Param('id') id: string) {
    return await this.partnerService.delete(id)
  }

  /** 제품 이미지 삭제 */
  // @Delete(':id/image')
  // async deleteProductImage(@Param('id') id: string) {
  //   return this.partnerService.deletePartnerImage(id)
  // }
}
