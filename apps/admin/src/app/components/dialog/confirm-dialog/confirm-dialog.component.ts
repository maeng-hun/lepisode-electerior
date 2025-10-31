import { Component, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog'
import { IConfirmDialogData } from '../../../../types/interfaces/dialog.interface'

/**
 * @name ConfirmDialogComponent
 * @description 확인/취소 다이얼로그 컴포넌트
 *              - DialogRef를 통해 다이얼로그 열기/닫기 처리
 *              - DIALOG_DATA로 제목, 메시지, 로딩 상태 등 전달
 */
@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-dialog.component.html'
})
export class ConfirmDialogComponent {
  private dialogRef = inject<DialogRef<boolean>>(DialogRef)
  data = inject<IConfirmDialogData>(DIALOG_DATA)

  onCancel(): void {
    if (!this.data.loading) this.dialogRef.close(false)
  }

  onConfirm(): void {
    if (!this.data.loading) this.dialogRef.close(true)
  }
}
