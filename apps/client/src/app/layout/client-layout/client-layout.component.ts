import { Component, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { trigger, style, animate, transition } from '@angular/animations'
import { RouterModule } from '@angular/router'
import HeaderComponent from '../header/header.component'
import FooterComponent from '../footer/footer/footer.component'
import { NAV_ITEMS } from '../../data/layout/nav-data'

@Component({
  selector: 'app-client-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, FooterComponent],
  templateUrl: './client-layout.component.html',
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateY(-100%)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ]),
      transition(':leave', [animate('300ms ease-in', style({ transform: 'translateY(-100%)', opacity: 0 }))])
    ])
  ]
})
export default class ClientLayoutComponent {
  menuOpen = signal<boolean>(false)
  navItems = NAV_ITEMS

  toggleMenu(): void {
    this.menuOpen.set(!this.menuOpen())
  }
}
