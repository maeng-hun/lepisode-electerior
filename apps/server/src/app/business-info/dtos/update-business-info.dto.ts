import { PartialType } from '@nestjs/swagger'
import { CreateBusinessInfoDTO } from './create-business-info.dto'

export class UpdateBusinessInfoDTO extends PartialType(CreateBusinessInfoDTO) {}
