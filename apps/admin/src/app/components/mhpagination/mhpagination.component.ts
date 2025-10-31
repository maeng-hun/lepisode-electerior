import { CommonModule } from '@angular/common'
import { Component, input, output } from '@angular/core'

@Component({
  selector: 'app-mhpagination',
  imports: [CommonModule],
  templateUrl: './mhpagination.component.html'
})
export class MhpaginationComponent {
  totalCount = input.required<number>() // 전체 게시글 수
  pageNo = input.required<number>() // 현재 페이지 번호
  pageSize = input.required<number>() // 페이지당 게시물 수

  pageChange = output<number>()
  pageSizeChange = output<number>()

  // 전체 페이지 수 계산
  get totalPages(): number {
    return Math.ceil(this.totalCount() / this.pageSize())
  }

  // 페이지 이동
  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return
    this.pageChange.emit(page)
  }

  // 페이지 크기 변경
  changePageSize(size: string | number): void {
    this.pageSizeChange.emit(Number(size))
  }
  onPageSizeSelect(event: Event): void {
    const value = (event.target as HTMLSelectElement).value
    this.changePageSize(value)
  }
}
