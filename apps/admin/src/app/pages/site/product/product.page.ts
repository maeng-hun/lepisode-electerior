import { Component, computed, inject, OnInit, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop'
import { ProductService } from '../../../services/product/product.service'
import { ProductItemComponent } from './components/product-item/product-item.component'
import ProductFormComponent from './components/product-form/product-form.component'
import PaginationComponent from '../../../components/pagination/pagination.component'
import { SearchFormComponent } from '../../../components/search-form/search-form.component'
import { Dialog, DialogModule } from '@angular/cdk/dialog'
import { ProductResponseDto, ProductsService } from '@api-client'

export const PRODUCT_PAGE_CATEGORIES = ['순번', '상태', '이미지', '제품 유형', '설명', '가격', '링크', '등록일시']

export const PRODUCT_TYPE_LABELS: Record<string, string> = {
  GPU_SERVER: 'GPU 서버 구축',
  MOBILE_APP: '모바일 앱 개발',
  WEB_APP_MAINT: '웹/앱 유지보수',
  CLOUD_INFRA: '클라우드 인프라',
  TECH_CONSULT: '기술 컨설팅'
}

@Component({
  selector: 'app-product-page',
  imports: [
    CommonModule,
    FormsModule,
    SearchFormComponent,
    PaginationComponent,
    DialogModule,
    ProductItemComponent,
    CdkDropList
  ],
  templateUrl: './product.page.html'
})
export default class ProductPage implements OnInit {
  private dialog = inject<Dialog>(Dialog)
  private productService = inject<ProductService>(ProductService)
  private apiService = inject<ProductsService>(ProductsService)

  sortedProducts = signal<ProductResponseDto[]>([])
  searchKeyword = signal<string>('')
  itemsPerPage = signal<number>(5)
  currentPage = signal<number>(1)

  private products: ProductResponseDto[] = []

  categories: readonly string[] = PRODUCT_PAGE_CATEGORIES

  /**
   * @name filteredProducts
   * @description 검색 키워드 기반으로 제품 목록 필터링
   */
  filteredProducts = computed<ProductResponseDto[]>(() => {
    const keyword = this.searchKeyword().trim().toLowerCase()
    if (!keyword) return this.sortedProducts()

    return this.sortedProducts().filter((p) => {
      const typeLabel = PRODUCT_TYPE_LABELS[p.productType] ?? p.productType
      return p.description.toLowerCase().includes(keyword) || typeLabel.toLowerCase().includes(keyword)
    })
  })

  /**
   * @name pagedProducts
   * @description 현재 페이지에 맞춰 잘린 제품 목록 반환
   */
  pagedProducts = computed<ProductResponseDto[]>(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage()
    return this.filteredProducts().slice(start, start + this.itemsPerPage())
  })

  /**
   * @name totalPages
   * @description 전체 페이지 수 계산, 페이지 배열 반환
   */
  totalPages = computed<number[]>(() => {
    const count = Math.max(1, Math.ceil(this.filteredProducts().length / this.itemsPerPage()))
    return Array.from({ length: count }, (_, i) => i + 1)
  })

  ngOnInit(): void {
    this.loadProducts()
  }

  // API 데이터 로드
  loadProducts(): void {
    this.apiService.productControllerGetAll().subscribe((res: ProductResponseDto[]) => {
      this.products = res
      this.sortedProducts.set([...this.products])
    })
  }

  /**
   * @name drop
   * @description 드래그앤드롭 후 UI 상 순서 변경
   */
  drop(event: CdkDragDrop<ProductResponseDto[]>): void {
    const list = [...this.sortedProducts()]
    moveItemInArray(list, event.previousIndex, event.currentIndex)
    this.sortedProducts.set(list)
    this.saveOrder()
  }

  /**
   * @name saveOrder
   * @description 서버에 제품 순서 저장 후 목록 새로 로드
   */
  private saveOrder(): void {
    const orders = this.sortedProducts().map((p, idx) => ({
      id: p.id ?? '',
      order: this.sortedProducts().length - idx
    }))

    this.productService.updateProductOrders(orders).subscribe(() => this.loadProducts())
  }

  // 검색
  onSearch(keyword: string): void {
    this.searchKeyword.set(keyword)
    this.currentPage.set(1)
  }

  // 페이지네이션 이벤트 처리
  onPageChange(page: number): void {
    this.currentPage.set(page)
  }

  onItemsPerPageChange(size: number): void {
    this.itemsPerPage.set(size)
    this.currentPage.set(1)
  }

  /**
   * @name openForm
   * @description 제품 추가/수정 다이얼로그 열기
   * @param {IProductItem} [product] 수정할 제품 정보 (없으면 새 제품)
   */
  openForm(product?: ProductResponseDto): void {
    const dialogRef = this.dialog.open(ProductFormComponent, {
      width: '90%',
      maxWidth: '400px',
      height: 'auto',
      data: product ? { item: product } : null
    })

    dialogRef.closed.subscribe(() => this.loadProducts())
  }

  /**
   * @name onProductDeleted
   * @description 제품 삭제 시 UI 업데이트
   * @param {string} productId 삭제된 제품 ID
   */
  onProductDeleted(productId: string): void {
    this.products = this.products.filter((p) => p.id !== productId)
    this.sortedProducts.set([...this.products])
  }
}
