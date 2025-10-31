import { Component, input, output } from '@angular/core'
import { CommonModule } from '@angular/common'
import { getProductTypeLabel } from '@electerior/common'
import { ProductType } from '../../../../../../../types/types/label.type'

export const PRODUCT_TYPES: readonly ProductType[] = [
  'GPU_SERVER',
  'MOBILE_APP',
  'WEB_APP_MAINT',
  'CLOUD_INFRA',
  'TECH_CONSULT'
] as const

/**
 * @name ProductTypeComponent
 * @description
 *   - 제품 유형을 선택할 수 있는 체크박스 그룹
 *   - 단일 선택(Single Selection)만 가능
 *   - 선택된 값 변경 시 이벤트 발생
 */
@Component({
  selector: 'app-product-type',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-type.component.html'
})
export default class ProductTypeComponent {
  selectedProductType = input<ProductType>('GPU_SERVER')
  checkedSrc = input<string>('/assets/about/check-box-checked.svg')
  uncheckedSrc = input<string>('/assets/about/check-box.svg')

  selectedProductTypeChange = output<ProductType>()

  readonly productTypes = PRODUCT_TYPES

  /**
   * @name selectType
   * @description 선택한 제품 유형을 상위 컴포넌트로 전달
   * @param {ProductType} type 선택된 제품 유형
   */
  selectType(type: ProductType): void {
    this.selectedProductTypeChange.emit(type)
  }

  /**
   * @name typeLabel
   * @description 제품 유형에 대한 UI 라벨 반환
   * @param {ProductType} type 제품 유형
   * @returns {string} 라벨
   */
  typeLabel(type: ProductType): string {
    return getProductTypeLabel(type)
  }
}
