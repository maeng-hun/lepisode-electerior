import { HttpClient } from '@angular/common/http'
import { inject, Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { IPartner } from '@electerior/common'
import { environment } from 'apps/admin/src/environments/environment'

@Injectable({ providedIn: 'root' })
export class PartnerService {
  private readonly baseUrl = `${environment.baseUrl}/partner`
  private readonly http = inject(HttpClient)

  /**
   * @name getAllPartners
   * @description 전체 협력사 조회
   * @returns Observable<IPartner[]> 협력사 목록
   */
  findMany(search?: string): Observable<IPartner[]> {
    const url = search ? `${this.baseUrl}?search=${encodeURIComponent(search)}` : this.baseUrl
    return this.http.get<IPartner[]>(url)
  }

  /**
   * @name findOne
   * @description 단일 협력사 조회
   * @returns Observable<IPartner> 조회된 협력사
   */
  findUnique(id: string): Observable<IPartner> {
    return this.http.get<IPartner>(`${this.baseUrl}/${id}`)
  }

  /**
   * @name create
   * @description 협력사 생성
   * @returns Observable<IPartner> 생성된 협력사
   */
  create(payload: { name: string; link?: string; imageId?: string | null }): Observable<IPartner> {
    return this.http.post<IPartner>(this.baseUrl, payload)
  }

  /**
   * @name update
   * @description 협력사 수정
   * @returns Observable<IPartner> 수정한 협력사
   */
  update(id: string, payload: { name: string; link?: string; imageId?: string | null }): Observable<IPartner> {
    return this.http.patch<IPartner>(`${this.baseUrl}/${id}`, payload)
  }

  /**
   * @name delete
   * @description 협력사 삭제
   * @returns Observable<void> 협력사 삭제 여부
   */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`)
  }
}
