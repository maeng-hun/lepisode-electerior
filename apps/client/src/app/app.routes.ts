import { Route } from '@angular/router'
import ClientLayoutComponent from './layout/client-layout/client-layout.component'

export const appRoutes: Route[] = [
  {
    path: '',
    component: ClientLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/home/home.page')
      },
      {
        path: 'about',
        loadComponent: () => import('./pages/about/about.page')
      },
      {
        path: 'portfolio',
        children: [
          {
            path: '', // 포트폴리오 리스트
            loadComponent: () => import('./pages/portfolio/portfolio/portfolio.page')
          },
          {
            path: ':portfolioId', // 포트폴리오 상세 페이지
            loadComponent: () => import('./pages/portfolio/portfolio-detail/portfolio-detail.page')
          }
        ]
      },
      {
        path: 'recruit',
        loadComponent: () => import('./pages/recruit/recruitment.page')
      },
      {
        path: 'recruit/:id',
        loadComponent: () => import('./pages/recruit/components/content/content.component')
      },
      {
        path: 'lounge',
        loadComponent: () => import('./pages/lounge/lounge.page')
      },
      {
        path: 'partner',
        loadComponent: () => import('./pages/partner/partner.page')
      },
      {
        path: 'product',
        children: [
          {
            path: '',
            loadComponent: () => import('./pages/product/product.page')
          },
          {
            path: ':id',
            loadComponent: () => import('./pages/product/product-detail.page')
          }
        ]
      },
      {
        path: 'policies/term',
        loadComponent: () => import('./pages/policies/term/term.page')
      },
      {
        path: 'policies/privacy',
        loadComponent: () => import('./pages/policies/privacy/privacy.page')
      }
    ]
  }
]
