import { inject, Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { CreatePortfolioDTO, IPortfolio } from '@electerior/common'
import { environment } from 'apps/admin/src/environments/environment'

type PortfolioForm = Partial<Pick<CreatePortfolioDTO, 'title' | 'description'>> & {
  images?: File[]
  imageIds?: string[]
}

@Injectable({ providedIn: 'root' })
export class PortfolioService {
  private readonly baseUrl = `${environment.baseUrl}/portfolios`
  private readonly http: HttpClient = inject(HttpClient)

  /**
   * @name findMany
   * @description 전체 포트폴리오 조회
   * @returns {Observable<IPortfolio[]>} 포트폴리오 목록
   */
  findMany(search?: string): Observable<IPortfolio[]> {
    const url = search ? `${this.baseUrl}?search=${encodeURIComponent(search)}` : this.baseUrl
    return this.http.get<IPortfolio[]>(url)
  }

  /**
   * @name findUnique
   * @description 단일 포트폴리오 조회
   * @returns {Observable<IPortfolio>} 조회된 포트폴리오
   */
  findUnique(id: string): Observable<IPortfolio> {
    return this.http.get<IPortfolio>(`${this.baseUrl}/${id}`)
  }

  /**
   * @name create
   * @description 포트폴리오 생성
   * @returns {Observable<IPortfolio>} 생성된 포트폴리오
   */
  create(dto: PortfolioForm): Observable<IPortfolio> {
    const formData = this.toFormData(dto)
    return this.http.post<IPortfolio>(this.baseUrl, formData)
  }

  /**
   * @name update
   * @description 포트폴리오 수정
   * @returns Observable<IPortfolio> 수정한 포트폴리오
   */
  update(id: string, dto: PortfolioForm): Observable<IPortfolio> {
    const formData = this.toFormData(dto)
    return this.http.patch<IPortfolio>(`${this.baseUrl}/${id}`, formData)
  }

  /**
   * @name incrementViews
   * @description 포트폴리오 조회수 증가
   * @returns Observable<IPortfolio> 포트폴리오 조회수
   */
  incrementViews(id: string): Observable<IPortfolio> {
    return this.http.patch<IPortfolio>(`${this.baseUrl}/${id}/views`, {})
  }

  /**
   * @name deletePortfolioImage
   * @description 포트폴리오 이미지 삭제
   * @param {string} id 상품 ID
   * @returns {Observable<void>} 삭제 완료 여부
   */
  deleteImage(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}/storage`)
  }

  /**
   * @name delete
   * @description 포트폴리오 삭제
   * @param {string} id 삭제할 상품 ID
   * @returns Observable<void> 포트폴리오 삭제 여부
   */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`)
  }

  /**
   * @name toFormData
   * @description 포트폴리오 데이터를 FormData로 변환
   * @returns {FormData} FormData 객체
   * @private
   */
  private toFormData(dto: PortfolioForm): FormData {
    const formData = new FormData()
    if (dto.title) formData.append('title', dto.title)
    if (dto.description !== undefined && dto.description !== null) {
      formData.append('description', dto.description)
    }
    if (Array.isArray(dto.images)) {
      dto.images.forEach((file: File) => formData.append('storages', file))
    }
    if (Array.isArray(dto.imageIds)) {
      dto.imageIds.forEach((id: string) => formData.append('imageIds', id))
    }
    return formData
  }
}
