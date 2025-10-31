import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsNotEmpty, IsUrl } from 'class-validator'

export class DeleteFileDTO {
  @ApiProperty({
    description: '파일 URL',
    required: true
  })
  @IsNotEmpty({
    message: '파일 URL은 필수값입니다.'
  })
  @IsUrl()
  url: string
}

export class DeleteFilesDTO {
  @ApiProperty({
    description: '파일 URL 목록',
    required: true,
    isArray: true,
    type: 'string'
  })
  @IsNotEmpty({
    message: '파일 URL 목록은 필수값입니다.'
  })
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  urls: string[]
}
