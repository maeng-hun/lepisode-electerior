import { Component, inject, input } from '@angular/core'
import { Dialog } from '@angular/cdk/dialog'
import { CommonModule } from '@angular/common'
import InquiryDialogModal from '../../modals/inquiry-dialog/inquiry-dialog.modal'
import { ProductType } from '../../../types/types/label.type'
@Component({
  selector: 'app-inquiry-btn',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inquiry-btn.component.html'
})
export default class InquiryButtonComponent {
  private dialog: Dialog = inject<Dialog>(Dialog)

  productType = input<ProductType | undefined>()

  openModal(): void {
    const pt = this.productType?.()
    this.dialog.open(InquiryDialogModal, {
      disableClose: true,
      width: '90vw',
      maxWidth: '1024px',
      height: '90vh',
      maxHeight: '90vh',
      data: { productType: pt ?? undefined }
    })
  }
}
