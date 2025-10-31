import { Transform } from 'class-transformer'
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator'

export class PaginatePartnerDTO {
  @IsOptional()
  @IsString()
  search?: string

  @Transform(({ value }) => Number.parseInt(value ?? '1', 10))
  @IsInt()
  @Min(1)
  page: number = 1

  @Transform(({ value }) => Number.parseInt(value ?? '1', 10))
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 10

  @IsOptional()
  @IsIn(['createdAt', 'name'])
  orderBy: 'createdAt' | 'name' = 'createdAt'

  @IsOptional()
  @IsIn(['asc', 'desc'])
  order: 'asc' | 'desc' = 'desc'
}
