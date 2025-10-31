import { HttpErrorResponse, HttpInterceptorFn, HttpContextToken } from '@angular/common/http'
import { inject } from '@angular/core'
import { Router } from '@angular/router'
import { ReplaySubject, throwError } from 'rxjs'
import { catchError, finalize, switchMap, tap } from 'rxjs/operators'
import UserStore from '../stores/user.store'

// 재시도 요청이 다시 refresh를 돌지 않도록 막는 플래그
export const SKIP_REFRESH = new HttpContextToken<boolean>(() => false)
// refresh 호출은 인터셉터 로직을 우회시키기 위한 플래그 (선택적이지만 안전)
export const BYPASS_AUTH = new HttpContextToken<boolean>(() => false)

let refreshInProgress = false
let refreshDone$ = new ReplaySubject<string>(1)

export const adminAuthInterceptor: HttpInterceptorFn = (req, next) => {
  const userStore = inject(UserStore)
  const router = inject(Router)

  // 0) 완전 우회: /auth/refresh 같은 내부 호출에 붙일 수 있음
  if (req.context.get(BYPASS_AUTH)) {
    return next(req)
  }

  // 1) /auth/refresh 여부 먼저 판단
  const isRefreshCall = req.url.includes('/auth/refresh')

  // 2) Authorization 헤더 (리프레시 요청엔 붙이지 않음)
  const access = userStore.accessToken()
  if (access && !isRefreshCall) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${access}` } })
  }

  // 3) 응답 에러 처리
  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      // 조건: 401이고, refresh 호출 자체가 아니고, 재시도 요청도 아닐 때만 refresh 시도
      const shouldRefresh = err.status === 401 && !isRefreshCall && !req.context.get(SKIP_REFRESH)

      if (!shouldRefresh) return throwError(() => err)

      // 동시 다발 401 → 기존 진행중인 refresh 결과를 기다렸다 재시도
      if (refreshInProgress) {
        return refreshDone$.pipe(
          switchMap((newAccess) => {
            const retried = req.clone({
              setHeaders: { Authorization: `Bearer ${newAccess}` },
              context: req.context.set(SKIP_REFRESH, true) // 재시도는 한 번만
            })
            return next(retried)
          })
        )
      }

      // 최초 1회 refresh 실제 수행
      refreshInProgress = true
      const refresh$ = userStore.refreshTokens() // Observable | null
      if (!refresh$) {
        userStore.clearTokens()
        router.navigate(['/sign-in'])
        return throwError(() => err)
      }

      return refresh$.pipe(
        tap((res) => {
          // 대기열에 새 access 전파
          refreshDone$.next(res.accessToken)
        }),
        // 원요청 재시도 (무한 루프 방지 플래그)
        switchMap((res) => {
          const retried = req.clone({
            setHeaders: { Authorization: `Bearer ${res.accessToken}` },
            context: req.context.set(SKIP_REFRESH, true)
          })
          return next(retried)
        }),
        catchError((refreshErr) => {
          userStore.clearTokens()
          router.navigate(['/sign-in'])
          return throwError(() => refreshErr)
        }),
        finalize(() => {
          refreshInProgress = false
          refreshDone$.complete()
          refreshDone$ = new ReplaySubject<string>(1) // 다음 라운드 대비
        })
      )
    })
  )
}
