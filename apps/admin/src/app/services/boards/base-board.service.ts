import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'

export abstract class BaseBoardService<T> {
  constructor(
    protected http: HttpClient,
    private baseUrl: string
  ) {}

  getAll(): Observable<T[]> {
    return this.http.get<T[]>(this.baseUrl)
  }

  getOne(id: string): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${id}`)
  }

  create(data: T): Observable<T> {
    return this.http.post<T>(this.baseUrl, data)
  }

  patch(id: string, data: T): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}/${id}`, data)
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`)
  }
}
