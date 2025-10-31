import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean } from 'class-validator'

export class UpdateInquiryDTO {
  @ApiProperty({ description: '관리자가 확인 처리하면 false로 변경' })
  @IsBoolean()
  isPending: boolean
}
