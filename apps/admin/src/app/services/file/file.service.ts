import { inject, Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { environment } from '../../../environments/environment'

@Injectable({ providedIn: 'root' })
export class FileService {
  private readonly baseUrl = `${environment.baseUrl}/storage`
  private readonly http = inject(HttpClient)

  upload(files: File[]): Observable<{ id: string; url: string }[]> {
    const formData = new FormData()
    for (const file of files) {
      formData.append('files', file)
    }
    return this.http.post<{ id: string; url: string }[]>(`${this.baseUrl}`, formData)
  }
}
