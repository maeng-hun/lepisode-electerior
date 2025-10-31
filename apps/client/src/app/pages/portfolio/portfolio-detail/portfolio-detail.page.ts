import { CommonModule, Location } from '@angular/common'
import { Component, computed, effect, inject, signal } from '@angular/core'
import { injectParams } from 'ngxtension/inject-params'
import HeroSectionComponent from '../../../components/hero-section/hero-section.component'
import PortfolioService from '../../../services/portfolio/portfolio.service'
import { IPortfolio } from '@electerior/common'
import { ToastrService } from 'ngx-toastr'
import { RouterLink } from '@angular/router'

@Component({
  selector: 'app-portfolio-detail',
  standalone: true,
  imports: [CommonModule, HeroSectionComponent, RouterLink],
  templateUrl: './portfolio-detail.page.html'
})
export default class PortfolioDetailPage {
  public readonly location = inject(Location)
  private readonly portfolioService = inject(PortfolioService)
  private readonly toastr = inject(ToastrService)

  id = injectParams('portfolioId')
  portfolioId = computed(() => this.id() || '')
  portfolio = signal<IPortfolio | null>(null)
  portfolios = signal<IPortfolio[]>([])
  expanded = signal<boolean>(false)
  loading = signal<boolean>(false)

  // 포트폴리오 추천 (category 추가해야할 듯/..)
  currentIndex = computed(() => {
    const id = this.portfolioId()
    const list = this.portfolios()
    if (!id || !list.length) return -1
    return list.findIndex((p) => p.id === id)
  })

  // 포트폴리오 조회수
  constructor() {
    // 추천용 목록
    this.portfolioService.findMany().subscribe((list) => this.portfolios.set(list ?? []))

    effect(() => {
      const id = this.id()
      console.log('PortfolioDetailPage: id changed', id)
      if (!id) return

      this.loading.set(true)

      this.portfolioService.incrementViews(id).subscribe({
        next: (updated) => {
          console.log('Incremented views and fetched portfolio', updated)
          this.portfolio.set(updated)
          this.loading.set(false)

          this.portfolioService.findOne(id).subscribe({
            next: (res) => {
              console.log(' portfolio', res)
              this.portfolio.set(res)
              this.loading.set(false)
            },
            error: () => {
              this.toastr.error('포트폴리오를 불러오지 못했습니다.')
            }
          })
        },
        error: () => {}
      })
    })
  }

  // 다음 index 3개
  recommendPortfolio = computed(() => {
    const list = this.portfolios()
    const idx = this.currentIndex()
    const n = list.length
    if (idx < 0 || n <= 1) return []
    const take = Math.min(3, n - 1)
    return Array.from({ length: take }, (_, k) => list[(idx + 1 + k) % n])
  })
}
