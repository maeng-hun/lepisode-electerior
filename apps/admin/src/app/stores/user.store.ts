import { computed, inject, Injectable, PLATFORM_ID } from '@angular/core'
import { isPlatformBrowser } from '@angular/common'
import { Router } from '@angular/router'
import { BaseStore } from './base.store'
import { HttpClient, HttpContext } from '@angular/common/http'
import { tap, Observable } from 'rxjs'
import { BYPASS_AUTH } from '../interceptors/adminauth.interceptor'
import { environment } from '../../environments/environment'

// 유저 데이터 타입을 정의합니다.
export type UserData = {
  id: string
  nickname: string
  email: string
  role: 'ADMIN' | 'SUPER_ADMIN' | 'USER'
}

// 로컬 스토리지 키 정의
// const LOCAL_STORAGE_USER_DATA_KEY = 'userData'  불필요: 백엔드 사용 시 DB에 저장
const SESSION_STORAGE_AUTH_TOKEN_KEY = 'accessToken'
const SESSION_STORAGE_REFRESH_TOKEN_KEY = 'refreshToken'

// 상태 타입 정의
type State = {
  user: UserData | null
  isLoggedIn: boolean
}

@Injectable({ providedIn: 'root' }) //singleton
export default class UserStore extends BaseStore<State> {
  private readonly router = inject(Router)
  private readonly http = inject(HttpClient)
  private platformId = inject(PLATFORM_ID) // 브라우저,SSR 구분/ 가드가 필요
  // 왜 서버에 실행하는거지? 랜더링을 빨리 하기 위해서?..
  private readonly baseUrl: string = `${environment.baseUrl}/auth`

  public readonly isLoggedIn = computed(() => this.get().isLoggedIn)
  public readonly currentUser = computed(() => this.get().user)

  /**
   * @name 생성자 삭제하기
   * @description
   */
  constructor() {
    // 초기 로그인 상태를 세션 스토리지 기반으로 설정
    const initialIsLoggedIn = isPlatformBrowser(inject(PLATFORM_ID)) //브라우저일 때 true, 서버일 대 false
      ? !!sessionStorage.getItem(SESSION_STORAGE_AUTH_TOKEN_KEY) // !! : 값이 있으면true
      : false

    // 초기 상태 설정
    super({ user: null, isLoggedIn: initialIsLoggedIn })

    if (isPlatformBrowser(this.platformId) && this.get().isLoggedIn) {
      // 브라우저&&로그인이면
      const storedAccessToken = sessionStorage.getItem(SESSION_STORAGE_AUTH_TOKEN_KEY)
      if (storedAccessToken) {
        const payload = this.parseJwt(storedAccessToken) //JSON 변환
        if (payload && payload.email) {
          this.setProfile({ id: payload.sub, email: payload.email, nickname: payload.nickname, role: payload.role })
        } else {
          // JWT표준에서 sub(subject): 토큰의 주체id를 뜻하는 예약 클레임(백에서도 sub함)
          //this.clearTokens()
          this.updateState({ isLoggedIn: false, user: null })
          alert('로그인 정보가 유효하지 않습니다. 다시 로그인해주세요.')
          this.router.navigate(['/sign-in'])
        }
      }
    }
  }

  // 로그인 시 백엔드로부터 받은 토큰을 저장하는 함수 세션에 저장
  setTokens(access: string, refresh: string) {
    if (!isPlatformBrowser(this.platformId)) return
    sessionStorage.setItem(SESSION_STORAGE_AUTH_TOKEN_KEY, access)
    sessionStorage.setItem(SESSION_STORAGE_REFRESH_TOKEN_KEY, refresh)
    this.updateState({ isLoggedIn: true })
  }

  // 최소 프로필 정보 저장
  setProfile(p: { id: string; email: string; nickname?: string; role: UserData['role'] }) {
    const nickname = p.nickname ?? p.email.split('@')[0] ?? 'USER'
    this.updateState({ user: { id: p.id, email: p.email, nickname, role: p.role } })
  }

  // Access Token 가져오기
  accessToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null
    return sessionStorage.getItem(SESSION_STORAGE_AUTH_TOKEN_KEY)
  }

  // Refresh Token 가져오기
  refreshToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null
    return sessionStorage.getItem(SESSION_STORAGE_REFRESH_TOKEN_KEY)
  }

  /**
   * @name authHeader
   * @description Authorization 헤더 반환 헬퍼
   */
  authHeader(): { [k: string]: string } {
    const token = this.accessToken()
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  // 토큰 제거 (로그아웃 등)
  clearTokens() {
    if (!isPlatformBrowser(this.platformId)) return
    sessionStorage.removeItem(SESSION_STORAGE_AUTH_TOKEN_KEY)
    sessionStorage.removeItem(SESSION_STORAGE_REFRESH_TOKEN_KEY)
    this.updateState({ user: null, isLoggedIn: false })
  }

  // JWT payload 파서
  private parseJwt(token: string): any | null {
    try {
      const payload = token.split('.')[1]
      const b64 = payload.replace(/-/g, '+').replace(/_/g, '/')
      const json = decodeURIComponent(
        atob(b64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      )
      return JSON.parse(json)
    } catch {
      return null
    }
  }

  //---------------------------------------------------------
  // <수정된 코드>
  // refresh 토큰을 사용하여 access 토큰을 재발급하는 함수 (인터셉터에서 호출)
  // 이 함수는 'user.store-refresh' 아티팩트에서 가져와 통합했습니다.
  refreshTokens(): Observable<{ accessToken: string; refreshToken: string }> | null {
    // SSR에서는 동작하지 않도록 가드
    if (!isPlatformBrowser(this.platformId)) return null

    const rt = this.refreshToken()
    if (!rt) return null // 여기서 logout() 호출하지 말 것 — 정리는 인터셉터가 함

    // 리프레시 호출은 인터셉터 우회(Authorization 헤더 안 붙이고, 리프레시 루프 방지)
    const ctx = new HttpContext().set(BYPASS_AUTH, true)

    return this.http
      .post<{ accessToken: string; refreshToken: string }>(
        `${this.baseUrl}/refresh`, // 나중에 environment.baseUrl로 치환 추천
        { refreshToken: rt },
        { context: ctx }
      )
      .pipe(
        // 새 토큰 저장 (원요청 재시도는 인터셉터가 수행)
        tap(({ accessToken, refreshToken }) => this.setTokens(accessToken, refreshToken))
      )
  }

  // 백엔드와 연동하는 실제 로그아웃 로직
  logout() {
    this.http.post(`${this.baseUrl}/logout`, {}).subscribe(() => {
      this.clearTokens()
      this.router.navigate(['/sign-in'])
      alert('로그아웃되었습니다.')
    })
  }
}
