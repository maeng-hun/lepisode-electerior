import { Component, HostListener, input, output } from '@angular/core'

import { CommonModule } from '@angular/common'

type CloseReason = 'confirm' | 'cancel' | 'backdrop' | 'escape'

@Component({
  selector: 'app-confirm-dialog',

  standalone: true,

  imports: [CommonModule],

  templateUrl: 'confirm-dialog.component.html'
})
export default class ConfirmDialogComponent {
  open = input<boolean>(false) // ex) 상품, 협력사, 포트폴리오 ... 등등

  title = input<string>('() 삭제') // 모달 제목 예-협력사 삭제

  description = input<string>('을(를) 삭제하시겠습니까?')

  confirmText = input<string>('확인')

  cancelText = input<string>('취소')

  danger = input<boolean>(false)

  loading = input<boolean>(false)

  closed = output<CloseReason>()

  @HostListener('document:keydown.escape')
  onEsc() {
    if (this.open() && !this.loading()) this.closed.emit('escape')
  }

  onBackdrop() {
    if (!this.loading()) this.closed.emit('backdrop')
  }

  onCancel() {
    if (!this.loading()) this.closed.emit('cancel')
  }

  onConfirm() {
    if (!this.loading()) this.closed.emit('confirm')
  }
}
