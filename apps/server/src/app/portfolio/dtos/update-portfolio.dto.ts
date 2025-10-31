import { IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class UpdatePortfolioDTO {
  @IsString()
  @IsNotEmpty()
  title: string

  @IsString()
  @IsOptional()
  description?: string | null

  @IsOptional()
  imageIds?: string[]

  @IsOptional()
  imageUrls?: string[]
}
