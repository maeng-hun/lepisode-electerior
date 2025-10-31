import { AbstractControl, FormBuilder } from '@angular/forms'
/**
 * diolog 에러 및 전송 등 재사용 하기 위한 추상클래스
 */
export abstract class BaseFormComponent {
  protected fb?: FormBuilder

  constructor(fb?: FormBuilder) {
    this.fb = fb
  }

  protected abstract closeWithDraft(result: any): void
  protected abstract closeClear(result: any): void

  protected getErrors(control: AbstractControl | null, label: string): string | null {
    if (!control) return null
    if (!control.touched) return null
    if (!control.invalid) return null

    if (control.hasError('required')) {
      return `${label}은(는) 필수 입력 항목입니다.`
    }
    if (control.hasError('minlength')) {
      const requiredLength = control.getError('minlength')?.requiredLength
      return `${label}은(는) 최소 ${requiredLength}자 이상 입력해주세요.`
    }
    if (control.hasError('maxlength')) {
      const maxLength = control.getError('maxlength')?.requiredLength
      return `${label}은(는) 최대 ${maxLength}자까지만 입력할 수 있습니다.`
    }
    if (control.hasError('email')) {
      return `${label} 형식이 올바르지 않습니다.`
    }
    return null
  }

  protected saveDraft(key: string, data: any): void {
    localStorage.setItem(key, JSON.stringify(data))
  }

  protected loadDraft<T = any>(key: string): T | null {
    const draft = localStorage.getItem(key)
    return draft ? (JSON.parse(draft) as T) : null
  }

  protected clearDraft(key: string): void {
    localStorage.removeItem(key)
  }
}
