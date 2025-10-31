import { ApiProperty } from '@nestjs/swagger'

export class FileDTO {
  @ApiProperty({ description: '파일 ID' })
  id: string
  @ApiProperty({ description: '파일명' })
  name: string
  @ApiProperty({ description: 'URL' })
  url: string
  @ApiProperty({ description: '파일 크기' })
  size: number
}
