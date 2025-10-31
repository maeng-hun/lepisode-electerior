import { Component, HostListener, signal, output } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterLink } from '@angular/router'
import { NAV_ITEMS } from '../../data/layout/nav-data'

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.component.html'
})
export default class HeaderComponent {
  isScrolled = signal<boolean>(false)

  menuToggle = output<void>()

  navItems = NAV_ITEMS

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.isScrolled.set(window.scrollY > 50)
  }

  onMenuClick(): void {
    this.menuToggle.emit()
  }
}
