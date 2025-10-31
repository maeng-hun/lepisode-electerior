import { ApiProperty } from '@nestjs/swagger'

export class NoticeDTO {
  //응답용 DTO
  @ApiProperty({ required: false }) // 이렇게 해줘야 스웨거 ng-openapi-gen이 타입을 만듬
  id?: string
  @ApiProperty({ required: false })
  seq?: number
  @ApiProperty({ required: false })
  isPinned?: boolean
  @ApiProperty({ required: false })
  title?: string
  @ApiProperty({ required: false })
  content?: string
  @ApiProperty({ required: false })
  views?: number
  @ApiProperty({ required: false })
  createdAt?: Date
  @ApiProperty()
  admin: string
  @ApiProperty({ description: '화면에 표시할 게시물 번호' })
  rowNumber: number
  @ApiProperty({ type: [String], description: '첨부 이미지 경로들' })
  images?: string[]

  constructor() {
    this.views = 0
  }
}
