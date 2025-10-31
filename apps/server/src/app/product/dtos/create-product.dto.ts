import { IsString, IsBoolean, IsOptional, IsInt, IsUUID, MaxLength, Min, Max, IsEnum, IsUrl } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { Transform, Type } from 'class-transformer'
import { ProductType } from '@prisma/client'

export class CreateProductDTO {
  @ApiProperty({ description: '제품 타입', enum: ProductType })
  @IsEnum(ProductType)
  productType: ProductType

  @ApiProperty({ description: '제품 설명', example: '예시 설명', maxLength: 100 })
  @IsString()
  @MaxLength(100)
  description: string

  @ApiProperty({ description: '노출 여부', example: true })
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  isExposed: boolean

  @ApiProperty({
    description: '가격',
    example: 10000,
    required: false,
    nullable: true,
    minimum: 0,
    maximum: 100_000_000
  })
  @IsInt()
  @Min(0)
  @Max(100_000_000)
  @IsOptional()
  @Type(() => Number)
  price?: number | null

  @ApiProperty({
    description: '상품 링크 URL',
    example: 'https://example.com/product',
    required: false,
    nullable: true,
    maxLength: 200
  })
  @IsString()
  @IsOptional()
  @IsUrl()
  @MaxLength(200)
  link?: string | null

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
