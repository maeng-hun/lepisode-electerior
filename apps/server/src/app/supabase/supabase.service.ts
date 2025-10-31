import { Injectable } from '@angular/core'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private readonly supabase: SupabaseClient

  constructor() {
    this.supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  }

  /** 파일 업로드 */
  async uploadFile(file: File, path: string): Promise<{ path: string }> {
    const { data, error } = await this.supabase.storage.from('products').upload(path, file)

    if (error) throw error
    return data
  }

  /** public URL 가져오기 */
  getPublicUrl(path: string): string {
    const { data } = this.supabase.storage.from('products').getPublicUrl(path)
    return data.publicUrl
  }
}
