import { Module } from '@nestjs/common'
import { PortfolioController } from './portfolio.controller'
import { PortfolioService } from './portfolio.service'
import { StorageS3Module } from '../storage/storage.module'

@Module({
  imports: [StorageS3Module],
  controllers: [PortfolioController],
  providers: [PortfolioService]
})
export class PortfolioModule {}
