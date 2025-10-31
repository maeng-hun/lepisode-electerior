import { Injectable, inject } from '@angular/core'
import { Dialog } from '@angular/cdk/dialog'
import { firstValueFrom } from 'rxjs'
import { ConfirmDialogComponent } from '../components/dialog/confirm-dialog/confirm-dialog.component'
import { IConfirmDialogData } from '../../types/interfaces/dialog.interface'

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  private readonly dialog: Dialog = inject(Dialog)

  /**
   * @name confirm
   * @description 확인/취소 다이얼로그를 표시하고 사용자의 선택을 반환합니다.
   * @param {IConfirmDialogData} data 다이얼로그에 표시할 데이터
   * @returns {Promise<boolean>} 사용자가 확인하면 true, 취소하거나 닫으면 false
   */
  async confirm(data: IConfirmDialogData): Promise<boolean> {
    const ref = this.dialog.open<boolean, IConfirmDialogData>(ConfirmDialogComponent, {
      data,
      hasBackdrop: true,
      disableClose: data.loading ?? false
    })

    const result: boolean | undefined = await firstValueFrom(ref.closed)
    return result ?? false
  }
}
