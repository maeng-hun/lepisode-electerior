import { CommonModule } from '@angular/common'
import { Component, computed, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core'
import { RepeatPipe } from 'ngxtension/repeat-pipe'
import { RouterLink } from '@angular/router'

import HeroSectionComponent from '../../components/hero-section/hero-section.component'
import { Card, RECRUIT_CARDS } from '../../data/recruit/card-data'
import { Recruit, RECRUITS } from '../../data/recruit/recruit-data'

// 채용공고

@Component({
  selector: 'app-recruitment',
  standalone: true,
  imports: [CommonModule, RepeatPipe, RouterLink, HeroSectionComponent],
  templateUrl: './recruitment.page.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export default class RecruitmentPage {
  cards = signal<Card[]>(RECRUIT_CARDS)

  slideIndex = signal(0)
  slideImages = [
    '/assets/recruitment/bottompic.jpg',
    '/assets/recruitment/re_samu.png',
    '/assets/recruitment/re_marke.png',
    '/assets/recruitment/re_sol.png',
    'https://picsum.photos/400/400'
  ]

  isExpanded = signal(false)

  Recruits = computed<Recruit[]>(() => (this.isExpanded() ? RECRUITS : RECRUITS.slice(0, 6)))
  totlaRecruits = RECRUITS.length
  buttonRecruits() {
    this.isExpanded.update((c) => !c)
  }
}
