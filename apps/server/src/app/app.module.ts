import { Module } from '@nestjs/common'
import { AppService } from './app.service'
import { AdminModule } from './admin/admin.module'
import { PrismaModule } from './prisma/prisma.module'
import { AppController } from './app.controller'
import { InquiryModule } from './inquiry/inquiry.module'
import { PartnerModule } from './Partner/partner.module'
import { AuthModule } from './auth/auth.module'
import { JwtModule } from '@nestjs/jwt'
import { BusinessInfoModule } from './business-info/business-info.module'
import { ProductModule } from './product/product.module'
import { PortfolioModule } from './portfolio/portfolio.module'
import { RecruitModule } from './recruit/recruit.module'
import { FileImageModule } from './fileImage/fileImage.module'
import { StorageS3Module } from './storage/storage.module'
import { StorageModule } from './providers/storage/storage.module'

@Module({
  imports: [
    AdminModule,
    PrismaModule,
    InquiryModule,
    BusinessInfoModule,
    FileImageModule,
    ProductModule,
    PartnerModule,
    AuthModule,
    PortfolioModule,
    RecruitModule,
    StorageS3Module.forRoot({
      accessKey: process.env.STORAGE_ACCESS_KEY,
      secretKey: process.env.STORAGE_SECRET_KEY,
      region: process.env.STORAGE_REGION,
      bucketName: process.env.STORAGE_BUCKET_NAME,
      endpoint: process.env.STORAGE_ENDPOINT
    }),
    StorageModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET_KEY
      //signOptions: { expiresIn: '60s' }
    })
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
