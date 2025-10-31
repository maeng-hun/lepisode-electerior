import { CommonModule } from '@angular/common'
import { Component, computed, signal, inject } from '@angular/core'
import PaginationComponent from '../../components/pagination/pagination.component'
import HeroSectionComponent from '../../components/hero-section/hero-section.component'
import ProductItemComponent from './components/product-item/product-item.component'
import InfiniteScrollComponent from '../../components/infinite-scroll/infinite-scroll.component'
import { ProductResponseDto, ProductsService } from '@api-client'
import { HttpErrorResponse } from '@angular/common/http'

@Component({
  selector: 'app-product-page',
  standalone: true,
  imports: [CommonModule, PaginationComponent, HeroSectionComponent, ProductItemComponent, InfiniteScrollComponent],
  templateUrl: './product.page.html'
})
export default class ProductPage {
  private readonly productsService = inject<ProductsService>(ProductsService)

  productItems = signal<ProductResponseDto[]>([])
  currentPage = signal<number>(1)
  itemsPerPage = signal<number>(3)
  isFetching = signal<boolean>(true)

  /** isExposed=true 제품만, order 기준으로 내림차순 정렬 */
  sortedProductItems = computed<ProductResponseDto[]>((): ProductResponseDto[] => {
    return [...this.productItems()].filter((item) => item.isExposed).sort((a, b) => (b.order ?? 0) - (a.order ?? 0))
  })

  /** PC용: 페이지 단위로 보여주기 */
  pagedItems = computed<ProductResponseDto[]>((): ProductResponseDto[] => {
    const perPage = this.itemsPerPage()
    const start = (this.currentPage() - 1) * perPage
    const end = start + perPage
    return this.sortedProductItems().slice(start, end)
  })

  totalPages = computed<number[]>((): number[] => {
    const count = Math.max(1, Math.ceil(this.sortedProductItems().length / this.itemsPerPage()))
    return Array.from({ length: count }, (_, i) => i + 1)
  })

  constructor() {
    this.fetchProducts()
  }

  /**
   * @name fetchProducts
   * @description 서버에서 전체 제품 데이터 가져오기
   * @returns {void}
   */
  fetchProducts(): void {
    this.isFetching.set(true)
    this.productsService.productControllerGetAll().subscribe({
      next: (items: ProductResponseDto[]) => {
        this.productItems.set(items)
      },

      error: (error: HttpErrorResponse) => console.error('제품 목록을 불러오는 데 실패했습니다.', error),
      complete: () => this.isFetching.set(false)
    })
  }

  onPageChange(page: number): void {
    this.currentPage.set(page)
    const anchor = document.getElementById('topSection')
    if (anchor) anchor.scrollIntoView()
  }

  onItemsPerPageChange(size: number): void {
    this.itemsPerPage.set(size)
    this.currentPage.set(1)
    const anchor = document.getElementById('topSection')
    if (anchor) anchor.scrollIntoView()
  }
}
