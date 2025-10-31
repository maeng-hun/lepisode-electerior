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
  UseGuards,
  UseInterceptors
} from '@nestjs/common'
import { PortfolioService } from './portfolio.service'
import { CreatePortfolioDTO } from './dtos/create-portfolio.dto'
import { UpdatePortfolioDTO } from './dtos/update-portfolio.dto'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { FileInterceptor } from '@nestjs/platform-express'
import { PortfolioResponseDTO } from './dtos/portfolio-response.dto'
import { Roles } from '../guards/roles.decorator'
import { JwtAuthGuard } from '../guards/jwt-auth.guard'
import { RolesGuard } from '../guards/roles.guard'

@ApiTags('Portfolios')
@Controller('portfolios')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Get()
  @ApiOperation({ summary: '모든 포트폴리오 조회, 포트폴리오 검색', description: '포트폴리오 전체 목록 반환' })
  @ApiOkResponse({ type: PortfolioResponseDTO, isArray: true })
  async findMany(@Query('search') search?: string) {
    return this.portfolioService.findMany({ search })
  }

  @Get(':id')
  @ApiOperation({ summary: '포트폴리오 상세 조회', description: '포티폴리오 상세 정보 반환' })
  @ApiOkResponse({ type: PortfolioResponseDTO })
  async findUnique(@Param('id') id: string) {
    return await this.portfolioService.findUnique(id)
  }

  @Post()
  @ApiOperation({ summary: '포트폴리오 등록11111', description: '새로운 포트폴리오 등록 및 이미지 업로드' })
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async create(@Body() dto: CreatePortfolioDTO) {
    console.log(dto, '<<<')
    return await this.portfolioService.create(dto)
  }

  @Patch('orders')
  @ApiOperation({ summary: '포트폴리오 순서 변경', description: '여러 포트폴리오의 노출 순서를 일괄적으로 변경' })
  @ApiOkResponse({ type: Boolean })
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async updateOrders(@Body() body: { orders: { id: string; order: number }[] }) {
    return await this.portfolioService.updateOrders(body.orders)
  }

  @Patch(':id')
  @ApiOperation({ summary: '포트폴리오 수정', description: '해당 id 포트폴리오 수정 및 이미지 교체' })
  @ApiOkResponse({ type: Boolean })
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async update(@Param('id') id: string, @Body() dto: UpdatePortfolioDTO) {
    return await this.portfolioService.update(id, dto)
  }

  @Patch(':id/views')
  @ApiOperation({ summary: '포트폴리오 조회수 증가', description: '해당 id 포트폴리오 조회수를 증가' })
  async incrementViews(@Param('id') id: string) {
    return await this.portfolioService.incrementViews(id)
  }

  @Delete(':id/storage')
  @ApiOperation({ summary: '포트폴리오 이미지 삭제', description: '해당 id 포트폴리오 이미지 삭제' })
  @ApiOkResponse({ type: Boolean })
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async deleteImage(@Param('id') id: string) {
    return await this.portfolioService.deleteImage(id)
  }

  @Delete(':id')
  @ApiOperation({ summary: '포트폴리오 삭제', description: '해당 id 포트폴리오를 삭제' })
  @ApiOkResponse({ type: Boolean })
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async delete(@Param('id') id: string) {
    return await this.portfolioService.delete(id)
  }
}
