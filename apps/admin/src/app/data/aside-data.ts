import { ISidebarMenu } from '../../types/interfaces/aside.interface'

export const SIDEBAR_MENUS: ISidebarMenu[] = [
  {
    label: '대시보드',
    icon: 'https://api.iconify.design/lucide:layout-dashboard.svg',
    route: '/dashboard'
  },
  {
    label: '견적 문의 관리',
    icon: 'https://api.iconify.design/lucide:messages-square.svg',
    route: '/inquiry'
  },
  {
    label: '사이트 관리',
    icon: 'https://api.iconify.design/lucide:globe.svg',
    children: [
      { label: '제품 관리', route: '/site/product' },
      { label: '채용 공고 관리', route: '/site/recruit' },
      { label: '포트폴리오 관리', route: '/site/portfolio' },
      { label: '배너 관리', route: '/site/banner' },
      { label: '협력사 관리', route: '/site/partner' }
    ]
  },
  {
    label: '시스템 정보 관리',
    icon: 'https://api.iconify.design/lucide:shield-check.svg',
    children: [
      { label: '약관 관리', route: '/system/policy' },
      { label: '사업자 정보 관리', route: '/system/business-info' }
    ]
  },
  {
    label: '관리자 관리',
    icon: 'https://api.iconify.design/lucide:user-circle.svg',
    route: '/admin'
  }
]
