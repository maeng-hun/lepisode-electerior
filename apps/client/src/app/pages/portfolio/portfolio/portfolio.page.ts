import { CommonModule } from '@angular/common'
import { AfterViewInit, Component, computed, inject, signal } from '@angular/core'
import { RouterLink } from '@angular/router'
import PaginationComponent from '../../../components/pagination/pagination.component'
import HeroSectionComponent from '../../../components/hero-section/hero-section.component'
import { injectQueryParams } from 'ngxtension/inject-query-params'
import { finalize } from 'rxjs'
import { IPortfolio } from '@electerior/common'
import PortfolioService from '../../../services/portfolio/portfolio.service'

@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [CommonModule, RouterLink, PaginationComponent, HeroSectionComponent],
  templateUrl: './portfolio.page.html'
})
export default class PortfolioPage implements AfterViewInit {
  private readonly portfolioService = inject(PortfolioService)
  private readonly params = injectQueryParams()

  portfolios = signal<IPortfolio[]>([])
  private readonly loading = signal<boolean>(false)

  currentPage = signal<number>(1)
  itemsPerPage = signal<number>(9)
  visibleCount = signal<number>(3)

  ngAfterViewInit(): void {
    const params = this.params()

    if (params['pageNo']) {
      this.currentPage.set(Number(params['pageNo']))
    }
    this.fetch()
  }

  fetch(): void {
    this.loading.set(true)
    this.portfolioService
      .findMany()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (res) => this.portfolios.set(res ?? [])
      })
  }

  // 더보기(모바일 전용)
  showMore() {
    this.visibleCount.set(this.portfolios().length)
  }

  pagedItems = computed(() => {
    const list = this.portfolios()
    const perPage = this.itemsPerPage()
    const start = (this.currentPage() - 1) * perPage
    const end = start + perPage
    return list.slice(start, end)
  })

  totalPages = computed(() => {
    const count = Math.ceil(this.portfolios().length / this.itemsPerPage())
    return Array.from({ length: count }, (_, i) => i + 1)
  })

  onPageChange(page: number): void {
    this.currentPage.set(page)
  }

  onItemsPerPageChange(size: number): void {
    this.itemsPerPage.set(size)
    this.currentPage.set(1)
  }
}
