import { Component, inject, OnInit, signal } from '@angular/core'
import { SearchFormComponent } from '../../../components/search-form/search-form.component'
import { CommonModule } from '@angular/common'
import { RouterLink } from '@angular/router'
import { IPortfolio } from '@electerior/common'
import PaginationComponent from '../../../components/pagination/pagination.component'
import PortfolioItemComponent from './components/portfolio-item/portfolio-item.component'
import { PortfolioService } from '../../../services/portfolio/portfolio.service'
import { finalize } from 'rxjs'

@Component({
  selector: 'app-portfolio-page',
  standalone: true,
  imports: [SearchFormComponent, PaginationComponent, CommonModule, RouterLink, PortfolioItemComponent],
  templateUrl: './portfolio.page.html'
})
export default class PortfolioPage {
  private readonly portfolioService = inject(PortfolioService)

  portfolios = signal<IPortfolio[]>([])
  loading = signal<boolean>(false)
  error = signal<string>('')

  searchKeyword = signal<string>('')
  currentPage = signal<number>(1)
  itemsPerPage = signal<number>(10)

  constructor() {
    this.fetch()
  }

  fetch(): void {
    const query = this.searchKeyword()?.trim() || undefined
    this.loading.set(true)
    this.portfolioService
      .findMany(query)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (res) => {
          this.portfolios.set(res ?? [])
        },
        error: () => {
          this.error.set('목록을 불러오지 못했습니다.')
        },
        complete: () => {
          this.loading.set(false)
        }
      })
  }

  onSearch(keyword: string): void {
    const next = keyword?.trim()
    if (next === this.searchKeyword()) return
    this.searchKeyword.set(next)
    this.currentPage.set(1)
    this.fetch()
  }

  onDeleted(id: string): void {
    this.portfolios.update((list) => list.filter((p) => p.id !== id))
  }
}
