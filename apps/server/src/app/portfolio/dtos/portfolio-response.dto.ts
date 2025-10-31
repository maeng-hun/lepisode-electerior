import { ApiProperty } from '@nestjs/swagger'
import { FileDTO } from '../../storage/dtos/file.dto'

export class PortfolioResponseDTO {
  @ApiProperty({ description: '포트폴리오 ID', example: 'ckxyz1234abc' })
  id: string

  @ApiProperty({ description: '포트폴리오 제목', example: '포트폴리오' })
  title: string

  @ApiProperty({ description: '포트폴리오 설명', example: '예시 설명', nullable: true })
  description?: string | null
0
  @ApiProperty({ description: '포트폴리오 조회수', example: 1 })
  views: number

  @ApiProperty({ description: '생성일시', example: '2025-09-11T09:00:00.000Z' })
  createdAt: Date

  @ApiProperty({ description: '수정일시', example: '2025-09-11T09:00:00.000Z' })
  updatedAt: Date

  @ApiProperty({ description: '삭제일시', example: '2025-09-12T09:00:00.000Z', required: false })
  deletedAt?: Date | null

  @ApiProperty({ description: '정렬 순서', example: 1 })
  order: number

  @ApiProperty({ description: '연결된 이미지 정보', type: () => FileDTO, required: false })
  images?: FileDTO[] | null
}
