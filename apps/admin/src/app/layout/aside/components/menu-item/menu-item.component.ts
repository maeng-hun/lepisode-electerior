import { Component, inject, input, model } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MenuStateService } from '../../../../services/menu-state.service'
import { Router, RouterModule } from '@angular/router'
import { ISidebarMenu, ISubMenu } from '../../../../../types/interfaces/aside.interface'

@Component({
  selector: 'app-menu-item',
  imports: [CommonModule, RouterModule],
  templateUrl: './menu-item.component.html'
})
export class MenuItemComponent {
  private router = inject<Router>(Router)
  menuState = inject<MenuStateService>(MenuStateService)

  menu = input.required<ISidebarMenu>()
  isActive = input.required<boolean>()

  selectedMenuLabel = model<string | null>('')

  selectMenu(): void {
    this.selectedMenuLabel.set(this.menu().label === this.selectedMenuLabel() ? null : this.menu().label)
  }

  clickParentMenu(): void {
    this.selectMenu()

    const children = this.menu().children
    if (children && children.length > 0) {
      // 첫 자식으로 이동
      const firstChild = children[0]
      this.router.navigate([firstChild.route])

      // 부모 + 첫 자식 라벨 세팅
      this.menuState.setParentLabel(this.menu().label)
      this.menuState.setChildLabel(firstChild.label)
    } else {
      // 단일 메뉴
      if (this.menu().route) {
        this.router.navigate([this.menu().route])
      }
      this.menuState.setParentLabel(this.menu().label)
      this.menuState.setChildLabel(null)
    }
  }

  clickChildMenu(child: ISubMenu): void {
    this.router.navigate([child.route])
    this.menuState.setParentLabel(this.menu().label)
    this.menuState.setChildLabel(child.label)
  }
}
