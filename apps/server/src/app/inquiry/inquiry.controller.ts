import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFiles
} from '@nestjs/common'
import { CreateInquiryDTO } from './dtos/create-inquiry.dto'
import { UpdateInquiryDTO } from './dtos/update-inquiry.dto'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { InquiryService } from './inquiry.service'
import { Roles } from '../guards/roles.decorator'
import { JwtAuthGuard } from '../guards/jwt-auth.guard'
import { RolesGuard } from '../guards/roles.guard'
import { FilesInterceptor } from '@nestjs/platform-express'
import { InquiryResponseDTO } from './dtos/inquiry-response.dto'

@ApiTags('Inquiries')
@Controller('inquiries')
export class InquiryController {
  constructor(private readonly inquiryService: InquiryService) {}

  // 전체 문의 조회
  @Get()
  @ApiOperation({
    summary: '전체 문의 조회',
    description: '관리자 권한으로 모든 문의 내역을 최신순으로 조회합니다.'
  })
  @ApiOkResponse({ type: InquiryResponseDTO, isArray: true })
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getAll() {
    return this.inquiryService.findAll()
  }

  // 단일 문의 조회
  @Get(':id')
  @ApiOperation({
    summary: '단일 문의 조회',
    description: '관리자 권한으로 특정 문의 ID를 이용해 문의 내용을 조회합니다.'
  })
  @ApiOkResponse({ type: InquiryResponseDTO })
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async get(@Param('id') id: string) {
    return this.inquiryService.findOne(id)
  }

  // 사용자 문의 등록 (여러 파일 업로드 가능)
  @Post()
  @ApiOperation({
    summary: '사용자 문의 등록',
    description: '사용자가 문의 내용을 등록하고, 필요 시 여러 이미지 파일을 업로드할 수 있습니다.'
  })
  @ApiOkResponse({ type: Boolean })
  @UseInterceptors(FilesInterceptor('storage'))
  async create(@Body() data: CreateInquiryDTO, @UploadedFiles() files?: Express.Multer.File[]) {
    return this.inquiryService.create(data, files)
  }

  // 상태 변경
  @Patch(':id')
  @ApiOperation({
    summary: '문의 상태 업데이트',
    description: '관리자 권한으로 특정 문의의 상태를 변경합니다 (isPending).'
  })
  @ApiOkResponse({ type: Boolean })
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateInquiryDTO) {
    return this.inquiryService.updateStatus(id, dto)
  }

  // 삭제
  @Delete(':id')
  @ApiOperation({
    summary: '문의 삭제',
    description: '관리자 권한으로 특정 문의를 삭제합니다.'
  })
  @ApiOkResponse({ type: Boolean })
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async delete(@Param('id') id: string) {
    return this.inquiryService.remove(id)
  }
}
