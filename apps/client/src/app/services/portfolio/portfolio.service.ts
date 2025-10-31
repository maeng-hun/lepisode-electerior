import { inject, Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { IPortfolio } from '@electerior/common'
import { environment } from '../../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export default class PortfolioService {
  private readonly baseUrl: string = `${environment.baseUrl}/portfolios`
  private readonly http: HttpClient = inject<HttpClient>(HttpClient)

  findMany(): Observable<IPortfolio[]> {
    return this.http.get<IPortfolio[]>(this.baseUrl)
  }

  findOne(id: string): Observable<IPortfolio> {
    return this.http.get<IPortfolio>(`${this.baseUrl}/${id}`)
  }

  incrementViews(id: string): Observable<IPortfolio> {
    return this.http.patch<IPortfolio>(`${this.baseUrl}/${id}/views`, {})
  }
}
