import { Component, HostListener, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import InquiryButtonComponent from '../inquiry-btn/inquiry-btn.component'
import { fadeUp } from '../../animations/animations'

@Component({
  selector: 'app-up-btn',
  standalone: true,
  imports: [CommonModule, InquiryButtonComponent],
  templateUrl: './up-btn.component.html',
  animations: [fadeUp]
})
export default class UpButtonComponent {
  isVisible = signal<boolean>(false)

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.isVisible.set(window.scrollY > 200)
  }

  handleScrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}
