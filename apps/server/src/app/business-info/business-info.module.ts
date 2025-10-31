import { Module } from '@nestjs/common'
import { BusinessInfoController } from './business-info.controller'
import { BusinessInfoService } from './business-info.service'
import { StorageS3Module } from '../storage/storage.module'

@Module({
  imports: [StorageS3Module],
  controllers: [BusinessInfoController],
  providers: [BusinessInfoService]
})
export class BusinessInfoModule {}
