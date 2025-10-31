// providers/storage/supabase.storage.ts
import { Injectable } from '@nestjs/common'
import { createClient } from '@supabase/supabase-js'
import { IStorageProvider } from '../../../types/interfaces/storage.interface'

@Injectable()
export class SupabaseStorageProvider implements IStorageProvider {
  private supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

  async upload(file: Express.Multer.File, folder: string): Promise<{ url: string; path: string }> {
    const path = `${folder}/${Date.now()}-${file.originalname}`

    const { error } = await this.supabase.storage
      .from('images')
      .upload(path, file.buffer, { contentType: file.mimetype })

    if (error) throw error

    const { data } = this.supabase.storage.from('images').getPublicUrl(path)

    return { url: data.publicUrl, path }
  }

  async delete(bucket: string, path: string): Promise<void> {
    const { error } = await this.supabase.storage.from(bucket).remove([path])
    if (error) throw error
  }
}
