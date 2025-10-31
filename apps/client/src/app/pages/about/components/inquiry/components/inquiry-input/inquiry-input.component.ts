// inquiry-input.component.ts
import { Component, input, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { ControlValueAccessorAdapter, controlValueAccessorProvider, formatContactNumber } from '@electerior/common'

let nextUniqueId = 0

/**
 * @name InquiryInputComponent
 * @description
 *   - Angular FormControl과 호환되는 입력 컴포넌트
 *   - 텍스트, 이메일, 전화번호 입력 지원
 *   - 전화번호 입력 시 자동 포맷(formatContactNumber) 적용
 *   - ControlValueAccessorAdapter를 상속하여 ngModel 또는 FormControl과 바인딩 가능
 */
@Component({
  selector: 'app-inquiry-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './inquiry-input.component.html',
  providers: [controlValueAccessorProvider(InquiryInputComponent)]
})
export default class InquiryInputComponent extends ControlValueAccessorAdapter implements OnInit {
  label = input<string>('')
  required = input<boolean>(false)
  type = input<'text' | 'email' | 'tel'>('text')
  placeholder = input<string>('')
  maxlength = input<number>(30)

  uniqueId = ''

  ngOnInit(): void {
    // 각 인풋 필드마다 고유 id 생성
    this.uniqueId = `inquiry-input-${nextUniqueId++}`
  }

  /**
   * @name onInput
   * @description
   *   - 사용자가 입력 시 value signal 업데이트
   *   - type이 'tel'이면 formatContactNumber 함수로 전화번호 포맷 적용
   * @param {Event} event input 이벤트
   */
  onInput(event: Event): void {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement
    const inputValue = target.value

    if (this.type() === 'tel') {
      const formatted = formatContactNumber(inputValue)
      this.value.set(formatted)
      target.value = formatted
    } else {
      this.value.set(inputValue)
    }
  }
}
