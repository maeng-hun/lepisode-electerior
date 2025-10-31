import { ApiProperty } from '@nestjs/swagger'
import { ProductType } from '@prisma/client'
import { FileDTO } from '../../storage/dtos/file.dto'

export class ProductResponseDTO {
  @ApiProperty({ description: '제품 ID', example: 'ckxyz1234abc' })
  id: string

  @ApiProperty({ description: '제품 타입', enum: ProductType })
  productType: ProductType

  @ApiProperty({ description: '제품 설명', example: '예시 설명' })
  description: string

  @ApiProperty({ description: '노출 여부', example: true })
  isExposed: boolean

  @ApiProperty({ description: '가격', example: 10000, nullable: true })
  price?: number | null

  @ApiProperty({ description: '상품 링크 URL', example: 'https://example.com/product', nullable: true })
  link?: string | null

  @ApiProperty({ description: '생성일시', example: '2025-09-11T09:00:00.000Z' })
  createdAt: Date

  @ApiProperty({ description: '수정일시', example: '2025-09-11T09:00:00.000Z' })
  updatedAt: Date

  @ApiProperty({ description: '삭제일시', example: '2025-09-12T09:00:00.000Z', required: false })
  deletedAt?: Date | null

  @ApiProperty({ description: '정렬 순서', example: 1 })
  order: number

  @ApiProperty({ description: '이미지 File ID', example: 'ckxyz1234abc', nullable: true })
  imageId?: string | null

  @ApiProperty({ description: '연결된 이미지 정보', type: () => FileDTO, required: false })
  image?: FileDTO | null
}
