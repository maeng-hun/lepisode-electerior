import { IsOptional, IsString } from 'class-validator'

export class UploadFileImageDTO {
  @IsOptional()
  @IsString()
  portfolioId?: string

  @IsOptional()
  @IsString()
  partnerId?: string
}
