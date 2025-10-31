import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'

export class UploadFileDTO {
  @ApiProperty({
    description: '버킷 이름',
    example: 'test',
    required: true
  })
  @IsNotEmpty({
    message: '버킷 이름은 필수값입니다.'
  })
  container: string

  @ApiProperty({
    description: '업로드할 파일',
    required: true
  })
  @IsNotEmpty({
    message: '파일은 필수값입니다.'
  })
  file: Express.Multer.File
}

export class UploadFilesDTO {
  @ApiProperty({
    description: '버킷 이름',
    example: 'test',
    required: true
  })
  @IsNotEmpty({
    message: '버킷 이름은 필수값입니다.'
  })
  container: string

  @ApiProperty({
    description: '업로드할 파일 목록',
    required: true,
    isArray: true
  })
  @IsNotEmpty({
    message: '파일 목록은 필수값입니다.'
  })
  files: Express.Multer.File[]
}
