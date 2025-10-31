import { inject, Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { environment } from '../../../environments/environment'
import { CreateProductDto, ProductResponseDto } from '@api-client'

export type ProductForm = Partial<Omit<CreateProductDto, 'imageId'>> & {
  image?: File | null
}
@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly baseUrl: string = `${environment.baseUrl}/products`
  private readonly http: HttpClient = inject(HttpClient)

  /**
   * @name createProduct
   * @description 상품 생성 (파일 업로드 지원)
   * @param {CreateProductDTO} data 생성할 상품 데이터
   * @returns {Observable<IProductItem>} 생성된 상품
   */
  createProduct(data: CreateProductDto): Observable<ProductResponseDto> {
    const formData = this.toFormData(data)
    return this.http.post<ProductResponseDto>(this.baseUrl, formData)
  }

  /**
   * @name updateProduct
   * @description 상품 수정 (파일 업로드 지원)
   * @param {string} id 수정할 상품 ID
   * @param {Partial<CreateProductDTO>} data 수정할 상품 데이터
   * @returns {Observable<IProductItem>} 수정된 상품
   */
  updateProduct(id: string, data: Partial<CreateProductDto>): Observable<ProductResponseDto> {
    const formData = this.toFormData(data)
    return this.http.patch<ProductResponseDto>(`${this.baseUrl}/${id}`, formData)
  }

  /**
   * @name updateProductOrders
   * @description 상품 순서 업데이트
   * @param {{ id: string; order: number }[]} orders 상품 ID와 순서 정보 배열
   * @returns {Observable<void>} 완료 여부
   */
  updateProductOrders(orders: { id: string; order: number }[]): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/orders`, { orders })
  }

  /**
   * @name deleteProductImage
   * @description 상품 이미지 삭제
   * @param {string} id 상품 ID
   * @returns {Observable<void>} 삭제 완료 여부
   */
  deleteProductImage(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}/storage`)
  }

  /**
   * @name toFormData
   * @description 상품 데이터를 FormData로 변환
   * @param {Partial<CreateProductDTO>} data 변환할 데이터
   * @returns {FormData} FormData 객체
   * @private
   */
  private toFormData(data: ProductForm): FormData {
    const formData = new FormData()
    if (data.productType) formData.append('productType', data.productType)
    if (data.description) formData.append('description', data.description)
    if (data.isExposed !== undefined) formData.append('isExposed', String(data.isExposed))
    if (data.price !== undefined && data.price !== null) formData.append('price', String(data.price))
    if (data.link) formData.append('link', data.link)
    if (data.image) formData.append('storage', data.image)
    return formData
  }
}
