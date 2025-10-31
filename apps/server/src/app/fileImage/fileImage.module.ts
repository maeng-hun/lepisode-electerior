import { Module } from '@nestjs/common'
import { FileImageService } from './fileImage.service'
import { PrismaModule } from '../prisma/prisma.module'
import { S3Module } from '../aws-s3/s3.module'

@Module({
  imports: [PrismaModule, S3Module],
  providers: [FileImageService],
  exports: [FileImageService]
})
export class FileImageModule {}
