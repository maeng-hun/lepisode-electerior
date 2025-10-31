import { Component, input, inject, output } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Overlay, OverlayRef } from '@angular/cdk/overlay'
import { ComponentPortal } from '@angular/cdk/portal'
import DetailDropdownComponent from '../../../../inquiry/components/detail-dropdown/detail-dropdown.component'
import { Dialog } from '@angular/cdk/dialog'
import ProductFormComponent from '../product-form/product-form.component'
import { getProductTypeLabel, ToastService } from '@electerior/common'
import { CdkDrag } from '@angular/cdk/drag-drop'
import { ConfirmDialogService } from '../../../../../services/confirm-dialog.service'
import { ProductResponseDto, ProductsService } from '@api-client'

/**
 * @name ProductItemComponent
 * @description 제품 리스트에서 단일 제품 항목 표시 및 관리
 *              - 드래그 가능
 *              - 컨텍스트 메뉴로 수정/삭제 처리
 */
@Component({
  selector: 'app-product-item',
  standalone: true,
  imports: [CommonModule, CdkDrag],
  templateUrl: './product-item.component.html'
})
export class ProductItemComponent {
  private readonly dialog = inject<Dialog>(Dialog)
  private readonly overlay = inject<Overlay>(Overlay)
  private readonly confirmDialog = inject<ConfirmDialogService>(ConfirmDialogService)
  private readonly productsService = inject<ProductsService>(ProductsService)
  private readonly toastr = inject<ToastService>(ToastService)

  item = input.required<ProductResponseDto>()
  index = input.required<number>()

  deleted = output<string>()
  edited = output<void>()

  private overlayRef: OverlayRef | null = null

  get productTypeLabel(): string {
    return getProductTypeLabel(this.item()?.productType)
  }

  /**
   * @name openContextMenu
   * @description 우클릭 또는 컨텍스트 메뉴 버튼 클릭 시 메뉴 열기
   *              - 수정: ProductForm 다이얼로그 열기
   *              - 삭제: ConfirmDialog 확인 후 삭제 처리
   * @param {MouseEvent} event 클릭 이벤트
   */
  openContextMenu(event: MouseEvent) {
    event.stopPropagation()
    this.overlayRef?.dispose()

    const positionStrategy = this.overlay.position().global().left(`${event.clientX}px`).top(`${event.clientY}px`)

    this.overlayRef = this.overlay.create({ positionStrategy, hasBackdrop: true })

    // 외부 클릭 시 메뉴 닫기
    this.overlayRef.backdropClick().subscribe(() => {
      this.overlayRef?.dispose()
    })
    const portal = new ComponentPortal(DetailDropdownComponent)
    const dropdownRef = this.overlayRef.attach(portal)

    // 메뉴 액션 설정
    dropdownRef.instance.actions.set([
      {
        label: '수정',
        handler: () => {
          const dialogRef = this.dialog.open(ProductFormComponent, {
            width: '90%',
            maxWidth: '400px',
            height: 'auto',
            data: { item: this.item() }
          })

          dialogRef.closed.subscribe((updatedItem) => {
            if (updatedItem) this.edited.emit()
          })

          this.overlayRef?.dispose()
        }
      },
      {
        label: '삭제',
        handler: async () => {
          this.overlayRef?.dispose()

          // 삭제 확인 다이얼로그
          const confirmed = await this.confirmDialog.confirm({
            title: '제품 삭제',
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

          // 서버 삭제 API 호출
          this.productsService.productControllerDelete({ id: itemId }).subscribe({
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
