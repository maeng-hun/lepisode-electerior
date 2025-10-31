import { HttpModule } from '@nestjs/axios'
import { DynamicModule, Module } from '@nestjs/common'
import { S3StorageController } from './storage.controller'
import { STORAGE_MODULE_CONFIG } from './storage.module.const'
import { StorageModuleConfig } from './storage.module.type'
import { S3StorageService } from './storage.service'

@Module({})
export class StorageS3Module {
  static forRoot(options: StorageModuleConfig): DynamicModule {
    return {
      module: StorageS3Module,
      global: true,
      imports: [HttpModule],
      controllers: [S3StorageController],
      providers: [
        {
          provide: STORAGE_MODULE_CONFIG,
          useValue: options
        },
        S3StorageService
      ],
      exports: [S3StorageService]
    }
  }
}
