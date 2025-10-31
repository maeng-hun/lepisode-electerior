import { Component, inject, signal, effect } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Router } from '@angular/router'
import UserStore from '../../stores/user.store'
import { MenuStateService } from '../../services/menu-state.service'

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html'
})
export class HeaderComponent {
  private readonly router = inject<Router>(Router)
  userStore = inject<UserStore>(UserStore)
  menuState = inject<MenuStateService>(MenuStateService)

  isMobileMenuOpen = signal<boolean>(false)
  nickname = signal<string | null>(null)

  constructor() {
    effect(() => {
      const user = this.userStore.currentUser()
      this.nickname.set(user ? user.nickname : null)
    })
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update((open) => !open)
  }

  onLogout(): void {
    this.userStore.logout()
  }

  onLogin(): void {
    this.router.navigate(['/sign-in'])
  }
}
