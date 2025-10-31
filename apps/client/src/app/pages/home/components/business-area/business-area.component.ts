import { CommonModule } from '@angular/common'
import { Component, signal, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { SwiperContainer } from 'swiper/element'
import { RepeatPipe } from 'ngxtension/repeat-pipe'

@Component({
  selector: 'app-business-area',
  imports: [CommonModule, RepeatPipe],
  standalone: true,
  templateUrl: './business-area.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export default class BusinessAreaPage {
  // 슬라이드1 data
  slideIndex = signal(0)
  slideItems = [
    {
      src: 'assets/portfolio/TopNavigator1.svg',
      title: 'B2B & B2B·B2G',
      title2: ' IT 구매 솔루션',
      description: '서비스에 대한 설명공간입니다.',
      button: '바로가기'
    },
    {
      src: 'assets/portfolio/TopNavigator2.svg',
      title: '상업 공간 인테리어',
      description: '서비스에 대한 설명공간입니다.',
      button: '바로가기'
    },
    {
      src: 'assets/portfolio/TopNavigator3.svg',
      title: 'B2B & B2B·B2G',
      description: '서비스에 대한 설명공간입니다.',
      button: '바로가기'
    }
  ]
}
