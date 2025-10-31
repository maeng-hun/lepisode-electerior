import { Component, input, output } from '@angular/core'
import { CommonModule } from '@angular/common'
import { getInquiryTypeLabel } from '@electerior/common'
import type { InquiryResponseDto } from '@api-client'

export type InquiryType = InquiryResponseDto['type']

@Component({
  selector: 'app-inquiry-type',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inquiry-type.component.html'
})
export default class InquiryTypeComponent {
  selectedType = input<InquiryType>('PRODUCT')
  checkedSrc = input<string>('/assets/about/check-box-checked.svg')
  uncheckedSrc = input<string>('/assets/about/check-box.svg')

  selectedTypeChange = output<InquiryType>()

  readonly inquiryTypes: InquiryType[] = ['PRODUCT', 'APP', 'ETC']

  selectType(type: InquiryType): void {
    this.selectedTypeChange.emit(type)
  }

  typeLabel(type: InquiryType): string {
    return getInquiryTypeLabel(type)
  }
}
