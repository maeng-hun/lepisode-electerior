import { IsString, IsNotEmpty, IsUUID, IsOptional, MaxLength, IsEmail, Matches } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateBusinessInfoDTO {
  @ApiProperty({ description: '회사명', example: '예시 회사명', maxLength: 50 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  companyName: string

  @ApiProperty({ description: '대표자명', example: '홍길동', maxLength: 20 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  ceoName: string

  @ApiProperty({ description: '주소', example: '서울특별시 강남구 테헤란로 123', maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  address: string

  @ApiProperty({ description: '연락처', example: '010-1234-5678', maxLength: 13 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(13)
  contactNumber: string

  @ApiProperty({ description: '이메일', example: 'example@company.com', maxLength: 50 })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(50)
  email: string

  @ApiProperty({ description: '사업자 등록번호', example: '123-45-67890', maxLength: 12 })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{3}-\d{2}-\d{5}$/, { message: '사업자 등록번호 형식이 올바르지 않습니다.' })
  businessNumber: string

  @ApiProperty({
    description: '연결할 이미지 File ID',
    example: 'ckxyz1234abc',
    required: false,
    nullable: true
  })
  @IsUUID()
  @IsOptional()
  imageId?: string | null
}
