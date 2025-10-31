import { Component, inject, signal } from '@angular/core'
import CompanyComponent from '../company/company.component'
import ServiceComponent from '../service/service.component'
import InquiryComponent from '../inquiry/inquiry.component'
import { Router } from '@angular/router'
import { ITab } from '../../../../../types/interfaces/about.interface'

export const TABS: readonly ITab[] = [
  { key: 'company', label: '회사소개' },
  { key: 'service', label: '서비스 소개' },
  { key: 'inquiry', label: '견적 문의' }
]
@Component({
  selector: 'app-tabs-section',
  standalone: true,
  imports: [CompanyComponent, ServiceComponent, InquiryComponent],
  templateUrl: './tabs-section.component.html'
})
export default class TabsSectionComponent {
  private readonly router = inject<Router>(Router)

  activeTab = signal<ITab['key']>('company')

  readonly tabs = TABS

  setActiveTab(tabKey: ITab['key']): void {
    this.activeTab.set(tabKey)
    this.router.navigate([], { queryParams: { tab: tabKey } })
  }
}
