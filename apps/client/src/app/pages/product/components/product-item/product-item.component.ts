import { CommonModule } from '@angular/common'
import { Component, input, inject } from '@angular/core'
import { Router } from '@angular/router'
import { ProductResponseDto } from '@api-client'
import { getProductTypeLabel } from '@electerior/common'

@Component({
  selector: 'app-product-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-item.component.html'
})
export default class ProductItemComponent {
  private readonly router = inject<Router>(Router)
  item = input<ProductResponseDto>()

  goToDetail(): void {
    const currentItem = this.item()
    if (!currentItem?.id) return
    this.router.navigate(['/product', currentItem.id])
  }

  get productTypeLabel(): string {
    return getProductTypeLabel(this.item()?.productType)
  }
}
