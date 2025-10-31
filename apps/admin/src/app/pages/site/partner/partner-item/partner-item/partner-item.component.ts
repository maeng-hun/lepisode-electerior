import { Component, computed, inject, input, output } from '@angular/core'
import { CommonModule } from '@angular/common'
import DetailDropdownComponent from '../../../../inquiry/components/detail-dropdown/detail-dropdown.component'
import { IPartner } from '@electerior/common'
import { ToastrService } from 'ngx-toastr'
import { Dialog } from '@angular/cdk/dialog'
import { Overlay, OverlayRef } from '@angular/cdk/overlay'
import { ConfirmDialogService } from 'apps/admin/src/app/services/confirm-dialog.service'
import { PartnerService } from 'apps/admin/src/app/services/partner/partner.service'
import PartnerFormComponent from '../../partner-form/partner-form.component'
import { ComponentPortal } from '@angular/cdk/portal'

@Component({
  selector: 'app-partner-item',
  imports: [CommonModule],
  templateUrl: './partner-item.component.html'
})
export default class PartnerItemComponent {
  private readonly toastr = inject(ToastrService)
  private readonly dialog = inject(Dialog)
  private readonly overlay = inject(Overlay)
  private readonly confirmDialog = inject(ConfirmDialogService)
  private readonly partnerService = inject(PartnerService)
  private overlayRef: OverlayRef | null = null

  item = input.required<IPartner>()
  rowNumber = input.required<number>()
  edited = output<IPartner>()
  deleted = output<string>()

  open(link?: string | null): void {
    if (!link) return
    const href = /^(https?:)?\/\//i.test(link) ? link : `https://${link}`
    window.open(href, '_blank')
  }

  openContextMenu(event: MouseEvent): void {
    event.preventDefault()
    event.stopPropagation()

    this.overlayRef?.dispose()

    const positionStrategy = this.overlay.position().global().left(`${event.clientX}px`).top(`${event.clientY}px`)

    this.overlayRef = this.overlay.create({ positionStrategy, hasBackdrop: true })

    this.overlayRef.backdropClick().subscribe(() => {
      this.overlayRef?.dispose()
    })
    const portal = new ComponentPortal(DetailDropdownComponent)
    const dropdownRef = this.overlayRef.attach(portal)

    dropdownRef.instance.actions.set([
      {
        label: '수정',
        handler: () => {
          const dialogRef = this.dialog.open(PartnerFormComponent, {
            width: '400px',
            height: 'auto',
            data: { partner: this.item() }
          })

          dialogRef.closed.subscribe()

          this.overlayRef?.dispose()
        }
      },
      {
        label: '삭제',
        handler: async () => {
          this.overlayRef?.dispose()

          const confirmed = await this.confirmDialog.confirm({
            title: '협력사 삭제',
            description: '정말 삭제하시겠습니까?',
            confirmText: '삭제',
            cancelText: '취소',
            danger: true
          })

          if (!confirmed) return

          const itemId = this.item().id
          if (!itemId) {
            this.toastr.error('제품 ID가 없어 삭제할 수 없습니다.')
            return
          }

          this.partnerService.delete(itemId).subscribe({
            next: () => {
              this.deleted.emit(itemId)
              this.toastr.success('제품이 삭제되었습니다!')
            },
            error: (err) => {
              console.error('삭제 실패', err)
              this.toastr.error('삭제 실패했습니다.')
            }
          })

          this.overlayRef?.dispose()
        }
      }
    ])
  }
}
