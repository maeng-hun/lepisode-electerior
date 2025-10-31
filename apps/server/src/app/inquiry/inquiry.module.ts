import { Module } from '@nestjs/common'
import { InquiryController } from './inquiry.controller'
import { InquiryService } from './inquiry.service'
import { StorageS3Module } from '../storage/storage.module'

@Module({
  imports: [StorageS3Module],
  controllers: [InquiryController],
  providers: [InquiryService]
})
export class InquiryModule {}
