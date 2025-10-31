import { Routes } from '@angular/router'
import AdminLayoutLayout from './layout/admin-layout/admin-layout.layout'
import { AuthGuard } from './guards/auth.guard'
import { RoleGuard } from './guards/role.guard'

export const appRoutes: Routes = [
  {
    path: '',
    component: AdminLayoutLayout,
    canActivate: [AuthGuard, RoleGuard], // auth가드 파일 추가 로그인해야 들어갈 수 있음 roleguard도 같이 추가 가능
    children: [
      {
        path: '',
        redirectTo: 'sign-in',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.page')
      },
      {
        path: 'inquiry',
        children: [
          {
            path: '',
            loadComponent: () => import('./pages/inquiry/inquiry.page')
          },
          {
            path: ':id',
            loadComponent: () => import('./pages/inquiry/inquiry-detail.page')
          }
        ]
      },
      {
        path: 'site',
        children: [
          {
            path: 'product',
            loadComponent: () => import('./pages/site/product/product.page')
          },
          {
            path: 'recruit',
            //canActivate: [RoleGuard],  // 테스트
            //data: { roles: ['SUPER_ADMIN'] },
            loadComponent: () => import('./pages/site/recruit/recruit.page')
          },
          {
            path: 'portfolio',
            children: [
              {
                path: '',
                loadComponent: () => import('./pages/site/portfolio/portfolio.page')
              },
              {
                path: 'form',
                loadComponent: () => import('./pages/site/portfolio/portfolio-form/portfolio-form.page')
              },
              {
                path: 'form/:id',
                loadComponent: () => import('./pages/site/portfolio/portfolio-form/portfolio-form.page')
              }
            ]
          },
          {
            path: 'banner',
            loadComponent: () => import('./pages/site/banner/banner.page')
          },

          {
            path: 'partner',
            loadComponent: () => import('./pages/site/partner/partner.page')
          }
        ]
      },
      {
        path: 'system',
        children: [
          {
            path: 'policy',
            loadComponent: () => import('./pages/system/policy/policy.page')
          },
          {
            path: 'business-info',
            loadComponent: () => import('./pages/system/business-info/business-info.page')
          }
        ]
      },
      {
        path: 'admin',
        canActivate: [RoleGuard],
        data: { roles: ['SUPER_ADMIN'] },
        loadComponent: () => import('./pages/admin/admin.page')
      }
    ]
  },
  {
    path: 'sign-in',
    loadComponent: () => import('./pages/sign-in/sign-in.page')
  },
  {
    path: 'sign-up',
    loadComponent: () => import('./pages/sign-up/sign-up.page')
  }
]
