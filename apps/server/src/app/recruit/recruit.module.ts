import { Module } from '@nestjs/common'
import { RecruitController } from './recruit.controller'
import { RecruitService } from './recruit.service'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  controllers: [RecruitController],
  providers: [RecruitService],
  imports: [PrismaModule]
})
export class RecruitModule {}
