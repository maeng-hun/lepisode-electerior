import { Component, inject, input, output, signal } from '@angular/core'
import { IPortfolio } from '@electerior/common'
import { CommonModule } from '@angular/common'
import { Overlay, OverlayRef } from '@angular/cdk/overlay'
import { ConfirmDialogService } from 'apps/admin/src/app/services/confirm-dialog.service'
import { PortfolioService } from 'apps/admin/src/app/services/portfolio/portfolio.service'
import DetailDropdownComponent from '../../../../inquiry/components/detail-dropdown/detail-dropdown.component'
import { ComponentPortal } from '@angular/cdk/portal'
import { ToastrService } from 'ngx-toastr'
import { Router } from '@angular/router'

@Component({
  selector: 'app-portfolio-item',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './portfolio-item.component.html'
})
export default class PortfolioItemComponent {
  private readonly toastr = inject(ToastrService)
  private readonly overlay = inject(Overlay)
  private readonly confirmDialog = inject(ConfirmDialogService)
  private readonly portfolioService = inject(PortfolioService)
  private readonly router = inject(Router)
  private readonly clientBaseUrl = 'http://localhost:4201'

  private overlayRef: OverlayRef | null = null

  item = input.required<IPortfolio>()
  rowNumber = input.required<number>()

  deleted = output<string>()
  edited = output<void>()

  menuOpen = signal<boolean>(false)

  searchKeyword = signal<string>('')
  currentPage = signal<number>(1)
  itemsPerPage = signal<number>(10)

  openContextMenu(event: MouseEvent): void {
    event.preventDefault()
    event.stopPropagation()

    this.closeMenu()

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
          this.closeMenu()
          this.oepnEdit()
        }
      },
      {
        label: '삭제',
        handler: async () => {
          this.closeMenu()
          this.handleDelete()
        }
      }
    ])
    this.menuOpen.set(true)
  }

  private closeMenu(): void {
    this.overlayRef?.dispose()
    this.overlayRef = null
    this.menuOpen.set(false)
  }

  private oepnEdit(): void {
    const id = this.item().id
    this.router.navigate(['/site/portfolio/form', id])
  }

  private async handleDelete(): Promise<void> {
    const confirmed = await this.confirmDialog.confirm({
      title: '포트폴리오 삭제',
      description: `'${this.item().title}'을(를) 삭제하시겠습니까?`,
      confirmText: '삭제',
      cancelText: '취소',
      danger: true
    })
    if (!confirmed) return

    this.portfolioService.delete(this.item().id).subscribe({
      next: () => {
        this.toastr.success('포트폴리오가 삭제되었습니다.')
        this.deleted.emit('this.item().id')
      },
      error: (err) => {
        console.error(err)
        this.toastr.error('삭제에 실패했습니다.')
      }
    })
  }

  portfolioDetail(event: MouseEvent): void {
    if (event.button !== 0) return
    const id = this.item().id

    window.open(`${this.clientBaseUrl}/portfolios/${id}`, '_blank', 'noopener')
  }
}
