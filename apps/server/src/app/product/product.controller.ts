import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UploadedFile,
  UseInterceptors,
  UseGuards
} from '@nestjs/common'
import { ProductService } from './product.service'
import { CreateProductDTO } from './dtos/create-product.dto'
import { UpdateProductDTO } from './dtos/update-product.dto'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { FileInterceptor } from '@nestjs/platform-express'
import { RolesGuard } from '../guards/roles.guard'
import { Roles } from '../guards/roles.decorator'
import { JwtAuthGuard } from '../guards/jwt-auth.guard'
import { ProductResponseDTO } from './dtos/product-response.dto'

@ApiTags('Products')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @ApiOperation({ summary: '모든 제품 조회', description: '등록된 모든 제품 목록을 반환합니다.' })
  @ApiOkResponse({
    type: ProductResponseDTO,
    isArray: true
  })
  async getAll() {
    return await this.productService.findAll()
  }

  @Get(':id')
  @ApiOperation({ summary: '제품 상세 조회', description: '제품 ID를 이용해 해당 제품 상세 정보를 반환합니다.' })
  @ApiOkResponse({ type: ProductResponseDTO })
  async get(@Param('id') id: string) {
    return await this.productService.findOne(id)
  }

  @Post()
  @ApiOperation({ summary: '새 제품 등록', description: '새로운 제품 등록 및 이미지 업로드 가능' })
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(FileInterceptor('storage'))
  async create(@Body() data: CreateProductDTO, @UploadedFile() file?: Express.Multer.File) {
    return await this.productService.create(data, file)
  }

  @Patch('orders')
  @ApiOperation({ summary: '제품 순서 변경', description: '여러 제품의 노출 순서를 일괄적으로 변경합니다.' })
  @ApiOkResponse({ type: Boolean })
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async updateOrders(@Body() body: { orders: { id: string; order: number }[] }) {
    return await this.productService.updateOrders(body.orders)
  }

  @Patch(':id')
  @ApiOperation({ summary: '제품 수정', description: '제품 ID를 이용해 특정 제품 수정 및 이미지 교체 가능' })
  @ApiOkResponse({ type: Boolean })
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(FileInterceptor('storage'))
  async update(@Param('id') id: string, @Body() data: UpdateProductDTO, @UploadedFile() file?: Express.Multer.File) {
    return await this.productService.update(id, data, file)
  }

  @Delete(':id/storage')
  @ApiOperation({ summary: '제품 이미지 삭제', description: '제품 ID를 이용해 연결된 이미지 삭제' })
  @ApiOkResponse({ type: Boolean })
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async deleteImage(@Param('id') id: string) {
    return await this.productService.removeImage(id)
  }

  @Delete(':id')
  @ApiOperation({ summary: '제품 삭제', description: '제품 ID를 이용해 특정 제품 삭제' })
  @ApiOkResponse({ type: Boolean })
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async delete(@Param('id') id: string) {
    return await this.productService.remove(id)
  }
}
