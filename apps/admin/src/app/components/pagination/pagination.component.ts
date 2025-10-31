import { Component, input, output, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pagination.component.html'
})
export default class PaginationComponent {
  private readonly maxButtons = signal<number>(5)
  groupStartIndex = signal<number>(0)

  currentPage = input<number>()
  totalPages = input<number[]>([])
  itemsPerPage = input<number>()

  pageChange = output<number>()
  itemsPerPageChange = output<number>()

  /**
   * @name changePage
   * @description 페이지 변경 시 호출, 선택된 페이지 emit
   * @param {number} page 변경할 페이지 번호
   */
  changePage(page: number): void {
    if (!this.totalPages() || this.totalPages().length === 0) return
    if (page < 1 || page > this.totalPages().length) return
    this.pageChange.emit(page)
  }

  /**
   * @name changeItemsPerPage
   * @description 페이지당 항목 수 변경 시 호출, 선택된 값 emit
   */
  changeItemsPerPage(value: string | number): void {
    this.itemsPerPageChange.emit(Number(value))
  }

  // 이전 페이지
  prevPage(): void {
    this.changePage((this.currentPage() ?? 1) - 1)
  }

  // 다음 페이지
  nextPage(): void {
    this.changePage((this.currentPage() ?? 1) + 1)
  }

  /** 현재 그룹의 페이지 버튼 배열 반환 */
  currentPageGroup(): number[] {
    if (!this.totalPages()) return []

    const total = this.totalPages().length
    const start = this.groupStartIndex()
    const end = Math.min(start + this.maxButtons(), total)
    return this.totalPages().slice(start, end)
  }

  /** 다음 그룹으로 이동 */
  nextGroup(): void {
    const total = this.totalPages().length
    if (this.groupStartIndex() + this.maxButtons() < total) {
      const newStart = this.groupStartIndex() + this.maxButtons()
      this.groupStartIndex.set(newStart) // 그룹 시작 인덱스 업데이트
      this.changePage(newStart + 1) // 그룹 첫 페이지로 이동 (배열 인덱스 → 페이지 번호)
    }
  }

  /** 이전 그룹으로 이동 */
  prevGroup(): void {
    if (this.groupStartIndex() - this.maxButtons() >= 0) {
      const newStart = this.groupStartIndex() - this.maxButtons()
      this.groupStartIndex.set(newStart)
      this.changePage(newStart + 1) // 그룹 첫 페이지로 이동
    } else {
      this.groupStartIndex.set(0)
      this.changePage(1)
    }
  }

  /** 현재 그룹 버튼의 시작/끝 여부 */
  hasPrevGroup(): boolean {
    return this.groupStartIndex() > 0
  }

  hasNextGroup(): boolean {
    return this.groupStartIndex() + this.maxButtons() < (this.totalPages()?.length ?? 0)
  }
}
