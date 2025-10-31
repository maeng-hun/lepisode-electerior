import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsInt, IsOptional, IsString, Min } from 'class-validator'

export class JobSearchDTO {
  @ApiProperty({ example: 1, required: true })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageNo: number

  @ApiProperty({ example: 5, required: true })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize: number

  @ApiProperty({ example: 'search', required: false, description: '검색 기능' })
  @IsOptional()
  @IsString()
  keyword?: string
}
