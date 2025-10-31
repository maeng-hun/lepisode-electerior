import { Component, ViewChild, ElementRef, CUSTOM_ELEMENTS_SCHEMA, signal, output } from '@angular/core'
import { CommonModule } from '@angular/common'
import { PRIVACY_POLICY } from '../../../../../../data/about/policy-data'
import { IDotLottieElement } from '../../../../../../../types/interfaces/about.interface'

/**
 * @name PrivacyConsentComponent
 * @description 개인정보 수집 동의 체크박스 컴포넌트
 *              - 체크 시 Lottie 애니메이션 재생/정지
 *              - 동의 상태를 부모 컴포넌트로 전달
 */
@Component({
  selector: 'app-privacy-consent',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './privacy-consent.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export default class PrivacyConsentComponent {
  privacyConsent = signal<boolean>(false)
  consentChange = output<boolean>()
  privacyPolicy = PRIVACY_POLICY

  @ViewChild('checkLottie', { static: false })
  checkLottieEl!: ElementRef<IDotLottieElement>

  toggleConsent(): void {
    const newValue = !this.privacyConsent()
    this.privacyConsent.set(newValue)
    this.handleLottie(newValue)
    this.consentChange.emit(newValue)
  }

  private handleLottie(consent: boolean): void {
    if (!this.checkLottieEl) return
    if (consent) this.checkLottieEl.nativeElement.play()
    else this.checkLottieEl.nativeElement.stop()
  }
}
