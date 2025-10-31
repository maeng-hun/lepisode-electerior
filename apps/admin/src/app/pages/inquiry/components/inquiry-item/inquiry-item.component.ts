import { Component, input, inject, ComponentRef, signal, HostListener } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Router } from '@angular/router'
import { FlexibleConnectedPositionStrategy, Overlay, OverlayRef } from '@angular/cdk/overlay'
import { ComponentPortal } from '@angular/cdk/portal'
import { firstValueFrom } from 'rxjs'
import StatusDropdownComponent from '../status-dropdown/status-dropdown.component'
import { getInquiryTypeLabel, ToastService } from '@electerior/common'
import { InquiryResponseDto, InquiriesService } from '@api-client'

/**
 * @name InquiryItemComponent
 * @description 문의 목록에서 단일 문의 항목 표시 및 관리
 *              - 항목 클릭 시 상세 페이지 이동
 *              - 상태 드롭다운으로 상태 변경 가능
 */
@Component({
  selector: 'app-inquiry-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inquiry-item.component.html'
})
export class InquiryItemComponent {
  private overlay = inject<Overlay>(Overlay)
  private router = inject<Router>(Router)
  private inquiriesService = inject<InquiriesService>(InquiriesService)
  private toastr = inject<ToastService>(ToastService)

  screenWidth = signal<number>(window.innerWidth)

  item = input<InquiryResponseDto>()
  index = input<number>()

  private overlayRef: OverlayRef | null = null

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.screenWidth.set((event.target as Window).innerWidth)
  }

  get inquiryTypeLabel(): string {
    const type = this.item()?.type
    return type ? getInquiryTypeLabel(type) : ''
  }

  isMobile(): boolean {
    return this.screenWidth() < 768
  }

  /**
   * @name goToDetail
   * @description 해당 문의의 상세 페이지로 이동
   */
  goToDetail(): void {
    const currentItem = this.item()
    if (!currentItem?.id) return
    this.router.navigate(['/inquiry', currentItem.id])
  }

  /**
   * @name openStatusDropdown
   * @description 상태 변경 드롭다운 오버레이 열기
   *              - 클릭 시 상태 변경 API 호출
   *              - 외부 클릭 시 메뉴 자동 닫기
   * @param {MouseEvent} event 클릭 이벤트
   */
  openStatusDropdown(event: MouseEvent): void {
    event.stopPropagation()
    this.overlayRef?.dispose()

    const positionStrategy: FlexibleConnectedPositionStrategy = this.isMobile()
      ? this.overlay
          .position()
          .flexibleConnectedTo(event.target as HTMLElement)
          .withPositions([{ originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' }])
      : this.overlay
          .position()
          .flexibleConnectedTo({ x: event.clientX, y: event.clientY })
          .withPositions([{ originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'top' }])

    this.overlayRef = this.overlay.create({ positionStrategy, hasBackdrop: true })
    const portal: ComponentPortal<StatusDropdownComponent> = new ComponentPortal(StatusDropdownComponent)
    const menuRef: ComponentRef<StatusDropdownComponent> = this.overlayRef.attach(portal)

    // 외부 클릭 시 드롭다운 닫기
    const clickListener = (e: MouseEvent): void => {
      if (!this.overlayRef?.overlayElement.contains(e.target as HTMLElement)) {
        this.overlayRef?.dispose()
        document.removeEventListener('click', clickListener)
      }
    }
    document.addEventListener('click', clickListener)

    const currentItem = this.item()
    if (!currentItem) return

    // 드롭다운 버튼 레이블 및 클릭 핸들러 설정
    menuRef.instance.buttonText.set(currentItem.isPending ? '완료로 변경' : '대기로 변경')
    menuRef.instance.clickHandler.set(async (): Promise<void> => {
      const newStatus = !currentItem.isPending
      currentItem.isPending = newStatus

      if (currentItem.id) {
        try {
          await firstValueFrom(
            this.inquiriesService.inquiryControllerUpdateStatus({
              id: currentItem.id,
              body: { isPending: newStatus }
            })
          )
          this.toastr.success('상태가 변경되었습니다!')
        } catch {
          // 실패 시 상태 원복
          currentItem.isPending = !newStatus
          this.toastr.error('상태 변경에 실패했습니다.')
        }
      }

      this.overlayRef?.dispose()
      document.removeEventListener('click', clickListener)
    })
  }
}
