import { Component, inject, signal, OnInit } from '@angular/core'
import { ActivatedRoute, Router, RouterModule } from '@angular/router'
import { CommonModule } from '@angular/common'
import { FlexibleConnectedPositionStrategy, Overlay, OverlayRef } from '@angular/cdk/overlay'
import { ComponentPortal } from '@angular/cdk/portal'
import { firstValueFrom } from 'rxjs'
import DetailDropdownComponent from './components/detail-dropdown/detail-dropdown.component'
import { getProductTypeLabel, ToastService } from '@electerior/common'
import { ConfirmDialogService } from '../../services/confirm-dialog.service'
import { FormsModule } from '@angular/forms'
import { DomSanitizer, SafeHtml } from '@angular/platform-browser'
import { IConfirmDialogData } from '../../../types/interfaces/dialog.interface'
import { getInquiryTypeLabel } from '@electerior/common'
import { InquiriesService, InquiryResponseDto } from '@api-client'

export const INQUIRY_DETAIL_CATEGORIES: readonly string[] = [
  '상태',
  '이름',
  '이메일',
  '회사명',
  '연락처',
  '연락 가능 시간대',
  '등록일시'
]

/**
 * @name InquiryDetailPage
 * @description 단일 문의 상세 페이지
 *              - 문의 내용 조회
 *              - HTML 안전하게 렌더링
 *              - 상태 변경, 삭제 등 드롭다운 메뉴 기능 제공
 */
@Component({
  selector: 'app-inquiry-detail-page',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './inquiry-detail.page.html'
})
export default class InquiryDetailPage implements OnInit {
  /** DomSanitizer 서비스 (HTML 안전 렌더링용) */
  private sanitizer = inject<DomSanitizer>(DomSanitizer)
  private route = inject<ActivatedRoute>(ActivatedRoute)
  private router = inject<Router>(Router)
  private overlay = inject<Overlay>(Overlay)
  private inquiriesService = inject<InquiriesService>(InquiriesService)
  private toastr = inject<ToastService>(ToastService)
  private confirmDialog = inject<ConfirmDialogService>(ConfirmDialogService)

  private overlayRef: OverlayRef | null = null
  inquiry = signal<InquiryResponseDto | null>(null)

  readonly categories = INQUIRY_DETAIL_CATEGORIES

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')
    if (id) {
      firstValueFrom(this.inquiriesService.inquiryControllerGet({ id }))
        .then((data) => this.inquiry.set(data))
        .catch((err) => console.error('문의 조회 실패', err))
    }
  }

  /**
   * @name getSafeHtml
   * @description HTML 문자열을 안전하게 렌더링
   * @param content 원본 HTML 문자열
   * @returns SafeHtml
   */
  getSafeHtml(content: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(content)
  }

  /** 문의 제품 유형 라벨 반환 */
  get productTypeLabel(): string {
    return getProductTypeLabel(this.inquiry()?.productType)
  }

  /** 문의 유형 라벨 반환 */
  get inquiryTypeLabel(): string {
    const type = this.inquiry()?.type
    return type ? getInquiryTypeLabel(type) : ''
  }

  getDisplayValue(value?: string | null): string {
    return value?.trim() || '-'
  }

  /**
   * @name openDropdown
   * @description 문의 상세 페이지에서 컨텍스트 메뉴 드롭다운 열기
   *              - 상태 변경
   *              - 삭제 처리
   */
  openDropdown(event: MouseEvent): void {
    event.stopPropagation()
    this.overlayRef?.dispose()

    const target: HTMLElement = event.currentTarget as HTMLElement
    const positionStrategy: FlexibleConnectedPositionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(target)
      .withPositions([{ originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' }])

    this.overlayRef = this.overlay.create({ positionStrategy, hasBackdrop: true })
    const portal = new ComponentPortal<DetailDropdownComponent>(DetailDropdownComponent)
    const modalRef = this.overlayRef.attach(portal)

    // 외부 클릭 시 드롭다운 닫기
    const clickListener = (e: MouseEvent): void => {
      if (!this.overlayRef?.overlayElement.contains(e.target as HTMLElement)) {
        this.overlayRef?.dispose()
        document.removeEventListener('click', clickListener)
      }
    }
    document.addEventListener('click', clickListener)

    const currentItem = this.inquiry()
    if (!currentItem) return

    // 드롭다운 액션 설정
    modalRef.instance.actions.set([
      {
        label: '상태 변경',
        handler: async (): Promise<void> => {
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
              this.toastr.success('상태가 변경되었습니다.')
            } catch {
              currentItem.isPending = !newStatus
              this.toastr.error('상태 변경에 실패했습니다.')
            }
          }

          this.overlayRef?.dispose()
          document.removeEventListener('click', clickListener)
        }
      },
      {
        label: '삭제',
        handler: async (): Promise<void> => {
          if (!currentItem.id) return

          const confirmed: boolean = await this.confirmDialog.confirm({
            title: '견적 문의 삭제',
            description: '정말 삭제하시겠습니까?',
            confirmText: '삭제',
            cancelText: '취소',
            danger: true
          } as IConfirmDialogData)

          if (!confirmed) return

          try {
            await firstValueFrom(this.inquiriesService.inquiryControllerDelete({ id: currentItem.id }))
            this.toastr.success('삭제되었습니다.')
            this.router.navigate(['/inquiry'])
          } catch (err: unknown) {
            console.error('삭제 실패', err)
            this.toastr.error('삭제 실패했습니다.')
          } finally {
            this.overlayRef?.dispose()
            document.removeEventListener('click', clickListener)
          }
        }
      }
    ])

    this.overlayRef.overlayElement.style.minWidth = '120px'
  }
}
