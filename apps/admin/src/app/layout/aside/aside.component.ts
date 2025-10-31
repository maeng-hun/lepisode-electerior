// aside.component.ts

import { Component, HostListener, inject, signal } from '@angular/core'
import { Router, RouterModule, NavigationEnd } from '@angular/router'
import { CommonModule } from '@angular/common'
import { filter } from 'rxjs/operators'
import { ISidebarMenu, ISubMenu } from '../../../types/interfaces/aside.interface'
import { SIDEBAR_MENUS } from '../../data/aside-data'
import { MenuStateService } from '../../services/menu-state.service'
import { MenuItemComponent } from './components/menu-item/menu-item.component'

@Component({
  selector: 'app-aside',
  standalone: true,
  imports: [RouterModule, CommonModule, MenuItemComponent],
  templateUrl: './aside.component.html'
})
export class AsideComponent {
  menuState = inject<MenuStateService>(MenuStateService)
  router = inject<Router>(Router)

  openMenuLabel = signal<string | null>(null)
  screenWidth = signal<number>(window.innerWidth)

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.screenWidth.set((event.target as Window).innerWidth)
  }

  menus: ISidebarMenu[] = SIDEBAR_MENUS

  constructor() {
    this.router.events.pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd)).subscribe(() => {
      this.updateOpenMenuLabelByUrl()
      this.menuState.closeMobileMenu()
    })
  }

  isMobile() {
    return this.screenWidth() < 768
  }

  toggleMenu() {
    this.menuState.toggleMobileMenu()
  }

  private updateOpenMenuLabelByUrl(): void {
    const currentUrl = this.router.url
    const activeMenu = this.menus.find((menu) => menu.children?.some((child) => currentUrl.startsWith(child.route)))

    if (activeMenu) {
      this.openMenuLabel.set(activeMenu.label)
    } else {
      this.openMenuLabel.set(null)
    }
  }

  isMenuOpen(label: string): boolean {
    return this.openMenuLabel() === label
  }

  isActiveMenu(menu: ISidebarMenu): boolean {
    const currentUrl = this.router.url
    return (
      (menu.route ? currentUrl.startsWith(menu.route) : false) ||
      !!menu.children?.some((child) => currentUrl.startsWith(child.route))
    )
  }

  clickMenu(menu: ISidebarMenu | ISubMenu, parent?: ISidebarMenu): void {
    this.openMenuLabel.set(null)

    if (parent) {
      // 자식 메뉴 클릭 → 부모 + 자식 라벨 세팅
      this.menuState.setParentLabel(parent.label)
      this.menuState.setChildLabel(menu.label)
    } else {
      // 부모/단일 메뉴 클릭 → 부모만 세팅
      this.menuState.setParentLabel(menu.label)
      this.menuState.setChildLabel(null)
    }
  }

  navigateToDashboard(): void {
    this.router.navigate(['/dashboard'])
    this.openMenuLabel.set(null)
    this.menuState.setParentLabel('대시보드')
    this.menuState.setChildLabel(null)
    this.menuState.closeMobileMenu()
  }
}
