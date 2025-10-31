import { inject, Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { environment } from '../../../environments/environment'
import { CreateInquiryDto, InquiryResponseDto } from '@api-client'

/**
 * FormData 변환용 타입
 * - 업로드용 이미지 File[]
 */
export type InquiryForm = Omit<CreateInquiryDto, 'images'> & {
  uploadImages?: File[] // 업로드할 이미지 File 배열
}

@Injectable({
  providedIn: 'root'
})
export default class InquiryService {
  private readonly baseUrl: string = `${environment.baseUrl}/inquiries`
  private readonly http: HttpClient = inject(HttpClient)

  /** 사용자 문의 등록 */
  createInquiry(data: CreateInquiryDto, uploadImages?: File[]): Observable<InquiryResponseDto> {
    const formData = this.toFormData({ ...data, uploadImages })
    return this.http.post<InquiryResponseDto>(this.baseUrl, formData)
  }

  /** FormData 변환 */
  private toFormData(data: InquiryForm): FormData {
    const formData = new FormData()

    if (data.name) formData.append('name', data.name)
    if (data.email) formData.append('email', data.email)
    if (data.contact) formData.append('contact', data.contact)
    if (data.content) formData.append('content', data.content)

    if (data.type) formData.append('type', data.type)
    if (data.productType) formData.append('productType', data.productType)
    if (data.companyName) formData.append('companyName', data.companyName)
    if (data.availableTime) formData.append('availableTime', data.availableTime)

    if (data.uploadImages) {
      data.uploadImages.forEach((file) => formData.append('storage', file))
    }

    return formData
  }
}
/** CreateInquiryDto → InquiryForm 변환
 *  - 서버에서 내려오는 string[] images를 File[]로 변환할 필요는 없음
 *  - 업로드용 File[]만 toFormData에서 처리
 */
