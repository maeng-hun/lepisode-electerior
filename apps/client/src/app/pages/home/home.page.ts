import { CommonModule } from '@angular/common'
import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, inject, signal, viewChild } from '@angular/core'
import { SwiperContainer } from 'swiper/element'
import UpButtonComponent from '../../components/up-btn/up-btn.component'
import BusinessAreaComponent from './components/business-area/business-area.component'
import PortfolioComponent from './components/portfolio/portfolio.component'
import PartnersComponent from './components/partners/partners.component'
import ContactComponent from './components/contact/contact.component'
import { Swiper } from 'swiper/types'

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    UpButtonComponent,
    BusinessAreaComponent,
    PortfolioComponent,
    PartnersComponent,
    ContactComponent
  ],
  templateUrl: './home.page.html',
  styleUrl: './home.page.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export default class HomePage {
  swiper = viewChild.required<ElementRef<SwiperContainer>>('swiper')

  totalSlides = signal<number>(3)
  activeSlide = signal<number>(1)
  percentage = signal<number>(1)

  handleSlideChange(ev: any) {
    const swiper = ev.detail.at(0) as Swiper
    this.activeSlide.set(swiper.realIndex + 1)
  }

  // 슬라이드 진행률
  handleProgress(ev: any) {
    const percentage = ev.detail[2] as number
    if (isNaN(percentage)) {
      this.percentage.set(0)
      return
    }
    this.percentage.set((this.activeSlide() / this.totalSlides()) * 100)
  }
}
