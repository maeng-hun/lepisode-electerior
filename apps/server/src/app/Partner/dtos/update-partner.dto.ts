import { IsNotEmpty, IsOptional, IsString, IsUrl, IsArray, ArrayUnique } from 'class-validator'

export class UpdatePartnerDTO {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsOptional()
  @IsUrl()
  link?: string

  @IsOptional()
  @IsString()
  imageId?: string
}
