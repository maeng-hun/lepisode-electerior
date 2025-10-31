import { ApiProperty } from '@nestjs/swagger'
import { InquiryType, ProductType } from '@prisma/client'
import { IsString, IsEmail, IsNotEmpty, IsOptional, MaxLength, IsUUID, ArrayUnique, IsEnum } from 'class-validator'

export class CreateInquiryDTO {
  @ApiProperty({ description: '작성자 이름', example: '홍길동', maxLength: 20 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  name: string

  @ApiProperty({ description: '이메일', example: 'example@email.com', maxLength: 50 })
  @IsEmail()
  @MaxLength(50)
  email: string

  @ApiProperty({ description: '연락처', example: '010-1234-5678', maxLength: 13 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(13)
  contact: string

  @ApiProperty({ description: '문의 내용', example: '제품 관련 문의입니다.', maxLength: 10000 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(10000)
  content: string

  @ApiProperty({
    description: '문의 유형',
    required: false,
    enum: InquiryType,
    example: InquiryType.PRODUCT
  })
  @IsOptional()
  @IsEnum(InquiryType)
  type?: InquiryType

  @ApiProperty({
    description: '제품 유형',
    required: false,
    enum: ProductType,
    example: ProductType.GPU_SERVER
  })
  @IsOptional()
  @IsEnum(ProductType)
  productType?: ProductType

  @ApiProperty({ description: '회사명', required: false, example: '예시 회사명', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  companyName?: string

  @ApiProperty({ description: '연락 가능 시간대', required: false, example: '평일 10:00~18:00', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  availableTime?: string

  @ApiProperty({
    description: '연결할 이미지 File ID 배열',
    example: ['ckxyz1234abc', 'ckxyz5678def'],
    required: false,
    nullable: true,
    type: [String]
  })
  @IsUUID('4', { each: true })
  @ArrayUnique()
  @IsOptional()
  images?: string[] | null
}
