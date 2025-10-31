import { ApiProperty } from '@nestjs/swagger'
import { JobNoitceDTO } from './jobnotice.dto'

export class JobNoticeResponseDTO {
  @ApiProperty({ type: [JobNoitceDTO] })
  items: JobNoitceDTO[]
  @ApiProperty()
  totalCount: number
}
