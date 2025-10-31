import { inject } from '@angular/core'
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router'
import UserStore from '../stores/user.store' // 경로 주의

// 사용법: 라우트에 data: { roles: ['SUPER_ADMIN'] } 같이 적고 canActivate:[RoleGuard]
export const RoleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const router = inject(Router)
  const userStore = inject(UserStore)

  // 라우트가 요구하는 역할들
  const required: Array<'ADMIN' | 'SUPER_ADMIN' | 'USER'> = route.data?.['roles'] ?? []
  if (required.length === 0) return true

  // 현재 로그인 사용자
  const user = userStore.currentUser()
  if (!user) {
    alert('로그인이 필요합니다.')
    return router.parseUrl('/sign-in')
  }

  if (!required.includes(user.role)) {
    alert(`접근 권한이 없습니다. (현재 role=${user.role})`)
    return router.parseUrl('/dashboard')
  }

  return true
}
