import { inject, Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { environment } from '../../../environments/environment'
import { BusinessInfoResponseDto, CreateBusinessInfoDto, UpdateBusinessInfoDto } from '@api-client'

@Injectable({ providedIn: 'root' })
export class FileUploadBusinessInfoService {
  private readonly baseUrl: string = `${environment.baseUrl}/business-info`
  private readonly http: HttpClient = inject(HttpClient)

  createIBusinessInfo(data: CreateBusinessInfoDto | FormData): Observable<BusinessInfoResponseDto> {
    return this.http.post<BusinessInfoResponseDto>(this.baseUrl, data)
  }

  updateIBusinessInfo(data: UpdateBusinessInfoDto | FormData): Observable<BusinessInfoResponseDto> {
    return this.http.patch<BusinessInfoResponseDto>(this.baseUrl, data)
  }

  /**
   * @name deleteIBusinessInfoImage
   * @description 사업자 로고만 삭제
   * @returns {Observable<{ message: string }>} 삭제 결과 메시지
   */
  deleteIBusinessInfoImage(): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/storage`)
  }

  /**
   * @name toFormData
   * @description 객체 데이터를 FormData로 변환
   * @param {Partial<CreateBusinessInfoDTO>} data 변환할 데이터
   * @returns {FormData} FormData 객체
   * @private
   */
  toFormData<T extends Partial<CreateBusinessInfoDto> | Partial<UpdateBusinessInfoDto>>(
    data: T & { image?: File }
  ): FormData {
    const formData: FormData = new FormData()
    if (data.companyName) formData.append('companyName', data.companyName)
    if (data.ceoName) formData.append('ceoName', data.ceoName)
    if (data.address) formData.append('address', data.address)
    if (data.contactNumber) formData.append('contactNumber', data.contactNumber)
    if (data.email) formData.append('email', data.email)
    if (data.businessNumber) formData.append('businessNumber', data.businessNumber)
    if (data.image) formData.append('storage', data.image)
    return formData
  }
}
