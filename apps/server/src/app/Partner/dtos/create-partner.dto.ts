import { IsNotEmpty, IsOptional, IsString, IsUrl, IsUUID } from 'class-validator'

export class CreatePartnerDTO {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsOptional()
  @IsUrl()
  link?: string | null

  @IsUUID()
  @IsOptional()
  @IsString()
  imageId?: string | null
}
