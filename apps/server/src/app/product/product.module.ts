import { Module } from '@nestjs/common'
import { ProductService } from './product.service'
import { ProductController } from './product.controller'
import { StorageS3Module } from '../storage/storage.module'

@Module({
  imports: [StorageS3Module],
  controllers: [ProductController],
  providers: [ProductService]
})
export class ProductModule {}
