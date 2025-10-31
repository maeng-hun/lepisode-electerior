import { Controller } from '@nestjs/common'
import { PartnerService } from '../Partner/partner.service'

@Controller('fileImage')
export class fileImageController {
  constructor(private readonly partnerService: PartnerService) {}
}
