import { Component, inject, output, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms'
import { Router } from '@angular/router'
import UserStore, { UserData } from '../../stores/user.store'
import { HttpClient, HttpErrorResponse } from '@angular/common/http'
import { environment } from '../../../environments/environment'
import { AuthService } from '@api-client'

/* JWT 기본적으로 .으로 구분된 세 부분 : <헤더>.<페이로드>.<서명>
  header : 알고리즘, 타입,jwt,alg 등 | payload: 실제 데이터, email, role 등 | signature : 검증용 서명
     jwt 문자열 -> payload(json) 객체로 변환이지만 이것보다 auth/me api를 두고 서버에서 사용자 정보 가져오기   
     이것도 다른 곳에 옮기기     */
function decodeJwt<T = any>(token: string): T | null {
  try {
    const payload = token.split('.')[1]
    const b64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(
      atob(b64) // 바이너리 데이터로 디코딩
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(json)
  } catch {
    return null
  }
}

@Component({
  selector: 'app-signin-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './sign-in.page.html'
})
export default class SignInPage {
  private fb = inject(FormBuilder)
  private router = inject(Router)
  private userStore = inject(UserStore)
  private readonly http = inject(HttpClient)
  private readonly authService = inject(AuthService)

  isSubmitting = signal(false)
  /**
   * FormGroup : FormControl의 모음
   * FormControl : 사용자가 입력한 데이터를 저장 및 검증하는 객체다
   * Validator : FormControl의 상태를 '오류 있음'으로 만드는 단순한 함수이다
   */
  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  })

  loginEvent = output<{ email: string }>() //비밀번호 보안 때문에 지웠습니다

  get emailErrors() {
    const c = this.form.controls.email // FormControl
    /**
     * touched: 사용자가 해당 컴포넌트와 상호작용했음
     */
    const touched = c.touched
    const invalid = c.invalid // c.error !== undefined
    const errors = c.errors
    if (touched && invalid) {
      return errors
    } else {
      return null
    }
  }

  get passwordErrors() {
    const c = this.form.get('password')
    return c?.touched && c.invalid ? c.errors : null
  }

  constructor() {
    console.debug(environment.baseUrl)
  }

  onSubmit() {
    if (this.isSubmitting()) return
    if (this.form.invalid) {
      this.form.markAllAsTouched()
      console.log('로그인 실패: 유효하지 않은 폼 입력입니다.')
      return
    }
    this.isSubmitting.set(true)

    const { email, password } = this.form.getRawValue() as { email: string; password: string }

    this.authService.authControllerSignin({ body: { email, password } }).subscribe({
      next: ({ accessToken, refreshToken }) => {
        this.userStore.setTokens(accessToken, refreshToken)

        const payload = decodeJwt<{
          sub: string
          email: string
          role: 'ADMIN' | 'SUPER_ADMIN' | 'USER'
          nickname?: string
        }>(accessToken)

        if (!payload || !payload.sub || !payload.email || !payload.role) {
          alert('로그인 정보가 올바르지 않습니다. 다시 시도해주세요.')
          this.isSubmitting.set(false)
          return
        }

        this.userStore.setProfile({
          id: payload.sub,
          email: payload.email,
          role: payload.role,
          nickname: payload.nickname
        })

        this.router.navigate(['/dashboard'])
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 401) {
          alert('이메일 또는 비밀번호가 올바르지 않습니다.')
        } else {
          alert('로그인 처리 중 문제가 발생했습니다.')
        }

        console.log(`로그인 실패:${err.status}, ${err.message}, ${err.error}`)

        this.isSubmitting.set(false)
      }
    })
  }

  goToSignUp() {
    this.router.navigate(['/sign-up'])
  }
}
