import { Component, inject, signal, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { CommonModule } from '@angular/common'
import HeroSectionComponent from '../../components/hero-section/hero-section.component'
import InquiryButtonComponent from '../../components/inquiry-btn/inquiry-btn.component'
import { getProductTypeLabel } from '@electerior/common'
import { ProductResponseDto, ProductsService } from '@api-client'
import { ProductType } from '../../../types/types/label.type'

export const PRODUCT_TYPES: ProductType[] = ['GPU_SERVER', 'MOBILE_APP', 'WEB_APP_MAINT', 'CLOUD_INFRA', 'TECH_CONSULT']

@Component({
  selector: 'app-product-detail-page',
  standalone: true,
  imports: [HeroSectionComponent, CommonModule, InquiryButtonComponent],
  templateUrl: './product-detail.page.html'
})
export default class ProductDetailPage implements OnInit {
  private route = inject<ActivatedRoute>(ActivatedRoute)
  private productService = inject<ProductsService>(ProductsService)

  product = signal<ProductResponseDto | null>(null)
  productType = signal<ProductType | undefined>(undefined)

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')
    if (!id) return

    this.productService.productControllerGet$Response({ id }).subscribe({
      next: (res) => this.product.set(res.body ?? null),
      error: () => this.product.set(null)
    })
  }

  isProductType(value: unknown): value is ProductType {
    return typeof value === 'string' && PRODUCT_TYPES.includes(value as ProductType)
  }

  get productTypeForButton(): ProductType | undefined {
    const p = this.product()
    return p && this.isProductType(p.productType) ? p.productType : undefined
  }

  get productTypeLabel(): string {
    return getProductTypeLabel(this.product()?.productType)
  }
}
