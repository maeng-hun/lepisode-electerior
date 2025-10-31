import { Dialog } from '@angular/cdk/dialog'
import { CommonModule } from '@angular/common'
import { Component, inject } from '@angular/core'
import InquiryDialogModal from '../../modals/inquiry-dialog/inquiry-dialog.modal'
import { STEPS_ITEMS } from '../../data/partner/partner-data'
import { IStepItem } from '../../../types/interfaces/partner.interface'
@Component({
  selector: 'app-partner-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './partner.page.html',
  styleUrls: ['partner.page.css']
})
export default class PartnerPage {
  private dialog = inject<Dialog>(Dialog)

  steps: IStepItem[] = STEPS_ITEMS

  openModal(): void {
    const dialogRef = this.dialog.open(InquiryDialogModal, {
      disableClose: true,
      width: '90vw',
      maxWidth: '1024px',
      height: '90vh',
      maxHeight: '90vh',
      data: { productType: undefined }
    })

    dialogRef.closed.subscribe()
  }
}
