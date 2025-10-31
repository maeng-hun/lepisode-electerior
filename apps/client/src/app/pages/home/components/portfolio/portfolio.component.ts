import { Component, signal, CUSTOM_ELEMENTS_SCHEMA, inject, afterNextRender } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterLink } from '@angular/router'
import Portfoliodata from '../../../../data/portfolio/portfolio-data'

@Component({
  selector: 'app-portfolio',
  imports: [CommonModule, RouterLink],
  standalone: true,
  templateUrl: './portfolio.component.html',
  styleUrl: './portfolio.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export default class PortfolioComponent {
  // 슬라이드2에 사용할 portfolio data 가져오기
  slideIndex = signal(0)

  private data = inject(Portfoliodata)

  portfolioList = this.data.portfolioList
}
