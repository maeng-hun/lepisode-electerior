import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreatePortfolioDTO {
  @ApiProperty({
    description: '제목'
  })
  @IsNotEmpty({ message: 'title is required' })
  title: string

  @ApiProperty({
    description: '설명'
  })
  @IsOptional()
  description?: string

  @ApiPropertyOptional({})
  @IsOptional()
  imageIds?: string[]

  @ApiPropertyOptional({
    description: '이미지 URL'
  })
  @IsOptional()
  imageUrls?: string[]
}
