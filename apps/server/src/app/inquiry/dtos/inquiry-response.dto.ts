import { ApiProperty } from '@nestjs/swagger'
import { InquiryType, ProductType } from '@prisma/client'
import { FileDTO } from '../../storage/dtos/file.dto'

export class InquiryResponseDTO {
  @ApiProperty({ description: '문의 ID', example: 'ckxyz1234abc' })
  id: string

  @ApiProperty({ description: '처리 대기 여부', example: true })
  isPending: boolean

  @ApiProperty({ description: '작성자 이름', example: '홍길동' })
  name: string

  @ApiProperty({ description: '이메일', example: 'example@email.com' })
  email: string

  @ApiProperty({ description: '연락처', example: '010-1234-5678' })
  contact: string

  @ApiProperty({ description: '문의 내용', example: '제품 관련 문의입니다.' })
  content: string

  @ApiProperty({
    description: '문의 유형',
    required: false,
    enum: InquiryType,
    example: InquiryType.PRODUCT
  })
  type?: InquiryType | null

  @ApiProperty({
    description: '제품 유형',
    required: false,
    enum: ProductType,
    example: ProductType.GPU_SERVER
  })
  productType?: ProductType | null

  @ApiProperty({ description: '회사명', required: false, example: '예시 회사명' })
  companyName?: string | null

  @ApiProperty({ description: '연락 가능 시간대', required: false, example: '평일 10:00~18:00' })
  availableTime?: string | null

  @ApiProperty({
    description: '연결된 이미지 파일 목록',
    type: () => [FileDTO],
    required: false
  })
  images?: FileDTO[]

  @ApiProperty({ description: '생성일', example: '2025-09-12T09:00:00.000Z' })
  createdAt: Date

  @ApiProperty({ description: '수정일', example: '2025-09-12T09:00:00.000Z' })
  updatedAt: Date

  @ApiProperty({ description: '삭제일', required: false, example: null })
  deletedAt?: Date | null
}
