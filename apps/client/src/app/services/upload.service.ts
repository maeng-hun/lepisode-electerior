import { Injectable } from '@angular/core'
import { FileDto } from '@api-client'
import { environment } from '../../environments/environment'

@Injectable({ providedIn: 'root' })
export class UploadService {
  async upload(file: File): Promise<FileDto[]> {
    try {
      const formData = new FormData()
      formData.append('files', file)

      const response = await fetch(`${environment.baseUrl}/storage?bucket=electerior`, {
        method: 'POST',
        body: formData
      })

      const results = (await response.json()) as FileDto[]

      return results
    } catch (error) {
      console.error('File upload failed:', error)
      throw new Error('Failed to upload file')
    }
  }

  async delete(url: string): Promise<void> {
    const encodedUrl = encodeURIComponent(url)
    await fetch(`${environment.baseUrl}/storage/${encodedUrl}`, {
      method: 'DELETE'
    })

    return
  }
}
