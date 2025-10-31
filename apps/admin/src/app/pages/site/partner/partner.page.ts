import { Component, inject, computed, signal } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { SearchFormComponent } from '../../../components/search-form/search-form.component'
import PaginationComponent from '../../../components/pagination/pagination.component'
import { IPartner } from '@electerior/common'
import { Paged } from '../../types/pagination.type'
import PartnerItemComponent from './partner-item/partner-item/partner-item.component'
import { Dialog } from '@angular/cdk/dialog'
import { PartnerService } from '../../../services/partner/partner.service'
import PartnerFormComponent from './partner-form/partner-form.component'
import { environment } from 'apps/admin/src/environments/environment'

@Component({
  selector: 'app-partner-page',
  standalone: true,
  imports: [SearchFormComponent, PaginationComponent, PartnerItemComponent],
  templateUrl: './partner.page.html'
})
export default class PartnerPage {
  private readonly dialog = inject(Dialog)
  private readonly http = inject(HttpClient)

  loading = signal<boolean>(true)
  isCreateOpen = signal<boolean>(false)

  // 원본 목록
  allPartners = signal<IPartner[]>([])
  totalCount = signal(0)

  // 페이지네이션 상태
  currentPage = signal<number>(1)
  itemsPerPage = signal<number>(10)
  filteredPartners = computed(() => this.allPartners())

  // 검색 키워드 (이름)
  searchKeyword = signal('')

  partners = computed(() => {
    return this.filteredPartners()
  })

  pages = computed(() => {
    const totalPages = Math.max(1, Math.ceil(this.totalCount() / this.itemsPerPage()))
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  })

  // 저장 완료 후 새로고침
  onCreated(): void {
    this.isCreateOpen.set(false)
    this.fetch() // 기존 목록 갱신 함수
  }

  onSearch(value: string): void {
    this.searchKeyword.set(value)
    this.currentPage.set(1)
    this.fetch()
  }

  // 페이지네이션
  onPageChange(page: number): void {
    this.currentPage.set(page)
    this.fetch()
  }

  onItemsPerPageChange(n: number): void {
    this.itemsPerPage.set(n)
    this.currentPage.set(1)
    this.fetch()
  }

  // 저장 후 목록 갱신
  onEdited(updated: IPartner): void {
    this.allPartners.update((list) => list.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)))
  }

  onDeleted(id: string): void {
    this.allPartners.update((list) => list.filter((p) => p.id !== id))
    this.totalCount.update((n) => Math.max(0, n - 1))

    if (this.allPartners().length === 0 && this.currentPage() > 1) {
      this.currentPage.update((p) => p - 1)
    }
  }

  openForm(partner?: IPartner): void {
    const dialogRef = this.dialog.open(PartnerFormComponent, {
      width: '400px',
      height: 'auto',
      data: partner ? { partner } : null
    })

    dialogRef.closed.subscribe((updated) => {
      if (updated) this.fetch()
    })
  }

  constructor() {
    this.fetch()
  }
  fetch(): void {
    this.loading.set(true)
    // search, pagination
    const query = this.searchKeyword().trim()
    const page = this.currentPage()
    const limit = this.itemsPerPage()
    const base = `${environment.baseUrl}/partner`
    const qs = new URLSearchParams()
    if (query) qs.set('search', query)
    qs.set('page', String(page))
    qs.set('limit', String(limit))
    const url = `${base}?${qs.toString()}`

    this.http.get<Paged<IPartner>>(url).subscribe({
      next: (res) => {
        this.allPartners.set(res.data ?? [])
        this.totalCount.set(res.meta.total)
        this.currentPage.set(res.meta.page)
        this.itemsPerPage.set(res.meta.limit)
        this.loading.set(false)
      },
      error: (err) => {
        console.error(err?.error?.message ?? '목록을 불러오지 못했습니다.')
      },
      complete: () => {
        this.loading.set(false)
      }
    })
  }
}
