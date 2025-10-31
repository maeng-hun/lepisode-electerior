import { CommonModule } from '@angular/common'
import { Component, computed, inject, input, output } from '@angular/core'
import { Router } from '@angular/router'

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.component.html'
})
export default class PaginationComponent {
  private readonly router: Router = inject<Router>(Router)

  currentPage = input<number>()
  totalPages = input<number[]>()
  itemsPerPage = input<number>()
  pageChange = output<number>()
  itemsPerPageChange = output<number>()

  // 현재 페이지 기준 엘리시스 페이지 계산
  visiblePages = computed<(number | '...')[]>(() => {
    const total = this.totalPages()?.length ?? 1
    const current = this.currentPage() ?? 1
    const pages: (number | '...')[] = []
    const maxVisible = 5 // 중앙에 표시할 페이지 수

    if (total <= maxVisible + 2) {
      // 전체 페이지가 충분히 작으면 모두 표시
      for (let i = 1; i <= total; i++) pages.push(i)
    } else {
      pages.push(1) // 첫 페이지

      // 중앙 범위 계산
      let start = Math.max(current - Math.floor(maxVisible / 2), 2)
      let end = start + maxVisible - 1

      // 끝 페이지를 넘어가는 경우 조정
      if (end >= total) {
        end = total - 1
        start = end - maxVisible + 1
      }

      if (start > 2) pages.push('...')
      for (let i = start; i <= end; i++) pages.push(i)
      if (end < total - 1) pages.push('...')

      pages.push(total) // 마지막 페이지
    }

    return pages
  })

  changePage(page: number): void {
    const totalPagesArray: number[] | undefined = this.totalPages()
    if (!totalPagesArray || page < 1 || page > totalPagesArray.length) return

    this.router.navigate([], { queryParams: { pageNo: page } })
    this.pageChange.emit(page)
  }

  changeItemsPerPage(size: number): void {
    this.router.navigate([], { queryParams: { pageNo: size } })
    this.itemsPerPageChange.emit(size)
  }
}
