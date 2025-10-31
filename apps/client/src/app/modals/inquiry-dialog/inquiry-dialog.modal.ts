import { Component, inject, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog'
import InquiryFormComponent from '../../pages/about/components/inquiry/components/inquiry-form/inquiry-form.component'
import { fadeUp } from '../../animations/animations'
import { ProductType } from '../../../types/types/label.type'
/**
 * @name InquiryDialogModal
 * @description 제품 문의 모달
 *              - fadeUp 애니메이션 적용
 *              - InquiryFormComponent 포함
 *              - 모달 닫기 시 signal 이용해 트랜지션 처리
 */
@Component({
  selector: 'app-inquiry-dialog',
  standalone: true,
  imports: [CommonModule, InquiryFormComponent],
  templateUrl: './inquiry-dialog.modal.html',
  animations: [fadeUp],
  styleUrls: ['./inquiry-dialog.modal.css']
})
export default class InquiryDialogModal {
  private readonly dialogRef = inject(DialogRef<InquiryDialogModal>)
  readonly data = inject(DIALOG_DATA) as { productType?: ProductType }

  productType = signal<ProductType | undefined>(this.data?.productType)
  isVisible = signal(true)

  closeRequest(): void {
    this.isVisible.set(false)
    setTimeout(() => this.dialogRef.close(), 500)
  }
}
