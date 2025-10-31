import { Component, inject, output } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms'
import { Router } from '@angular/router'
import { HttpClient, HttpErrorResponse } from '@angular/common/http'
import { AuthService } from '@api-client'
@Component({
  selector: 'app-signup-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './sign-up.page.html'
})
export default class SignUpPage {
  private fb = inject(FormBuilder)
  private router = inject(Router)
  private readonly http = inject(HttpClient)
  private readonly authService = inject(AuthService)

  form = this.fb.group({
    nickname: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  })

  signUpEvent = output<{ nickname: string; email: string; password: string }>()

  get nicknameErrors() {
    const c = this.form.get('nickname')
    return c?.touched && c.invalid ? c.errors : null
  }

  get emailErrors() {
    const c = this.form.get('email')
    return c?.touched && c.invalid ? c.errors : null
  }

  get passwordErrors() {
    const c = this.form.get('password')
    return c?.touched && c.invalid ? c.errors : null
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched()
      return
    }

    const { nickname, email, password } = this.form.getRawValue() as {
      nickname: string
      email: string
      password: string
    }
    const body = { email, nickname, password }
    this.authService
      .authControllerSignup({
        body
      })
      .subscribe({
        next: (res: any) => {
          this.signUpEvent.emit({ nickname, email, password })
          alert('회원가입이 완료되었습니다!')
          this.router.navigate(['/sign-in'])
        },
        error: (err: HttpErrorResponse) => {
          if (err.status === 409) {
            alert('이미 사용 중인 이메일 또는 닉네임입니다.')
          } else if (err.status === 400) {
            alert('입력 값을 다시 확인해 주세요.')
          } else {
            alert('처리 중 문제가 발생했습니다.')
          }
          console.log('⛔️ 회원가입 실패:', {
            status: err.status,
            message: err.message,
            error: err.error
          })
        }
      })
  


  goToSignIn() {
    this.router.navigate(['/sign-in'])
  }
}
