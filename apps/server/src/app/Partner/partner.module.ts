import { Module } from '@nestjs/common'
import { PartnerController } from './partner.controller'
import { PartnerService } from './partner.service'
import { StorageModule } from '../providers/storage/storage.module'
import { S3Module } from '../aws-s3/s3.module'
@Module({
  imports: [S3Module],
  controllers: [PartnerController],
  providers: [PartnerService]
})
export class PartnerModule {}
