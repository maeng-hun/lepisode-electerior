import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import TabsSectionComponent from './components/tabs-section/tabs-section.component'

@Component({
  selector: 'app-about-page',
  standalone: true,
  imports: [CommonModule, TabsSectionComponent],
  templateUrl: './about.page.html'
})
export default class AboutPage {}
