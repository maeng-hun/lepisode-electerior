// storage.module.ts
import { Module } from '@nestjs/common'
import { SupabaseStorageProvider } from './supabase.storage'

@Module({
  providers: [
    {
      provide: 'IStorageProvider',
      useClass: SupabaseStorageProvider
    }
  ],
  exports: ['IStorageProvider']
})
export class StorageModule {}
