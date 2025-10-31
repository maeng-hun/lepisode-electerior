import { CommonModule } from '@angular/common'
import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, signal } from '@angular/core'
import { RouterLink } from '@angular/router'
import Portfoliodata from '../../../../data/portfolio/portfolio-data'

@Component({
  selector: 'app-partners',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './partners.component.html',
  styleUrl: './partners.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export default class PartnersComponent {
  // 슬라이드에 사용할 portfolio data 가져오기
  private data = inject(Portfoliodata)
  portfolioList = this.data.portfolioList

  slideIndex = signal(0)

  partnersIndex = signal(0)

  partnersList = [
    {
      src: 'assets/portfolio/EclLogics.svg'
    },
    {
      src: 'assets/portfolio/Zeno.svg'
    },
    {
      src: 'assets/portfolio/NextMotion.svg'
    },
    {
      src: 'assets/portfolio/LogiAble.svg'
    },
    {
      src: 'assets/portfolio/NextMotion2.svg'
    },
    {
      src: 'assets/portfolio/AirLink.svg'
    }
  ]
}
