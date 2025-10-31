import { Injectable, inject } from '@angular/core'
import { CanActivateFn, Router } from '@angular/router'
import { HttpClient } from '@angular/common/http'
import { catchError, map, of } from 'rxjs'
import UserStore from '../stores/user.store'
import { environment } from '../../environments/environment'

export const AuthGuard: CanActivateFn = (route, state) => {
  const router = inject(Router)
  const http = inject(HttpClient)
  const userStore = inject(UserStore)

  const token = userStore.accessToken()

  if (!token) {
    return router.parseUrl('/sign-in')
  }

  return http
    .get(`${environment.baseUrl}/auth/me`, {
      headers: userStore.authHeader()
    })
    .pipe(
      map(() => true),
      catchError(() => of(router.parseUrl('/sign-in')))
    )
}
