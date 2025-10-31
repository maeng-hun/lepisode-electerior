import { ApiProperty } from '@nestjs/swagger'
import { FileDTO } from '../../storage/dtos/file.dto'

export class BusinessInfoResponseDTO {
  @ApiProperty({ description: '사업 정보 ID', example: 'ckxyz1234abc' })
  id: string

  @ApiProperty({ description: '회사명', example: '예시 회사명' })
  companyName: string

  @ApiProperty({ description: '대표자명', example: '홍길동' })
  ceoName: string

  @ApiProperty({ description: '주소', example: '서울특별시 강남구 테헤란로 123' })
  address: string

  @ApiProperty({ description: '연락처', example: '010-1234-5678' })
  contactNumber: string

  @ApiProperty({ description: '이메일', example: 'example@company.com' })
  email: string

  @ApiProperty({ description: '사업자 등록번호', example: '123-45-67890' })
  businessNumber: string

  @ApiProperty({
    description: '연결된 이미지 파일',
    type: () => FileDTO,
    required: false
  })
  image?: FileDTO | null

  @ApiProperty({ description: '생성일', example: '2025-09-12T09:00:00.000Z' })
  createdAt: Date

  @ApiProperty({ description: '수정일', example: '2025-09-12T09:00:00.000Z' })
  updatedAt: Date

  @ApiProperty({ description: '삭제일', required: false, example: null })
  deletedAt?: Date | null
}
