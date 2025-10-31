import { Component, computed, inject, OnInit, signal } from '@angular/core'
import { firstValueFrom } from 'rxjs'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { InquiryItemComponent } from '../inquiry/components/inquiry-item/inquiry-item.component'
import PaginationComponent from '../../components/pagination/pagination.component'
import { SearchFormComponent } from '../../components/search-form/search-form.component'
import { InquiriesService, InquiryResponseDto } from '@api-client'

export const INQUIRY_PAGE_CATEGORIES: readonly string[] = [
  '순번',
  '상태',
  '문의유형',
  '이름',
  '이메일',
  '연락처',
  '문의 일시'
]

@Component({
  selector: 'app-inquiry-page',
  standalone: true,
  imports: [CommonModule, FormsModule, InquiryItemComponent, SearchFormComponent, PaginationComponent],
  templateUrl: './inquiry.page.html'
})
export default class InquiryPage implements OnInit {
  private readonly inquiriesService = inject<InquiriesService>(InquiriesService)

  inquiries = signal<InquiryResponseDto[]>([])
  searchKeyword = signal<string>('')
  itemsPerPage = signal<number>(5)
  currentPage = signal<number>(1)

  readonly categories: readonly string[] = INQUIRY_PAGE_CATEGORIES
  sortOrder: 'asc' | 'desc' = 'desc'

  filteredInquiries = computed<InquiryResponseDto[]>(() => {
    const keyword = this.searchKeyword().trim().toLowerCase()
    const list = keyword ? this.inquiries().filter((item) => this.matchesKeyword(item, keyword)) : [...this.inquiries()]
    return this.sortInquiries(list)
  })

  pagedInquiries = computed<InquiryResponseDto[]>(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage()
    return this.filteredInquiries().slice(start, start + this.itemsPerPage())
  })

  totalPages = computed<number[]>(() => {
    const count = Math.max(1, Math.ceil(this.filteredInquiries().length / this.itemsPerPage()))
    return Array.from({ length: count }, (_, i) => i + 1)
  })

  ngOnInit(): void {
    this.fetchInquiries()
  }

  async fetchInquiries(): Promise<void> {
    try {
      const response: InquiryResponseDto[] = await firstValueFrom(this.inquiriesService.inquiryControllerGetAll())
      this.inquiries.set(response)
    } catch (error) {
      console.error('문의 불러오기 실패:', error)
    }
  }

  onPageChange(page: number): void {
    this.currentPage.set(page)
  }

  onItemsPerPageChange(size: number): void {
    this.itemsPerPage.set(size)
    this.currentPage.set(1)
  }

  onSearch(keyword: string): void {
    this.searchKeyword.set(keyword)
    this.currentPage.set(1)
  }

  private sortInquiries(list: InquiryResponseDto[]): InquiryResponseDto[] {
    return [...list].sort((a, b) =>
      this.sortOrder === 'asc'
        ? new Date(a.createdAt ?? '').getTime() - new Date(b.createdAt ?? '').getTime()
        : new Date(b.createdAt ?? '').getTime() - new Date(a.createdAt ?? '').getTime()
    )
  }

  private matchesKeyword(item: InquiryResponseDto, keyword: string): boolean {
    return (
      item.name.toLowerCase().includes(keyword) ||
      item.contact.toLowerCase().includes(keyword) ||
      item.content.toLowerCase().includes(keyword)
    )
  }
}
