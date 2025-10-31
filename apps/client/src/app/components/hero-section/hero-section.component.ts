import { CommonModule } from '@angular/common'
import { Component, input } from '@angular/core'

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero-section.component.html'
})
export default class HeroSectionComponent {
  title = input<string>()
  line1 = input<string | undefined>()
  line2 = input<string | undefined>()
}
