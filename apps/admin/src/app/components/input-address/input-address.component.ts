import { CommonModule } from '@angular/common'
import { Component, input } from '@angular/core'
import { ControlValueAccessorAdapter, controlValueAccessorProvider } from '@electerior/common'
import { IDaum, IDaumAddress } from '../../../types/interfaces/address.interface'

declare const daum: IDaum

/**
 * @name InputAddressComponent
 * @description 다음 우편번호 서비스를 이용한 주소 입력 컴포넌트
 *              - ControlValueAccessorAdapter를 상속하여 폼 제어 가능
 *              - 클릭 시 주소 검색 팝업 열기
 */
@Component({
  selector: 'app-input-address',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './input-address.component.html',
  providers: [controlValueAccessorProvider(InputAddressComponent)]
})
export class InputAddressComponent extends ControlValueAccessorAdapter<string> {
  placeholder = input<string>('주소를 입력해 주세요.')
  id = input<string>('')

  async handleAddress(ev?: Event): Promise<void> {
    ev?.stopPropagation()
    ev?.preventDefault()

    new daum.Postcode({
      oncomplete: (data: IDaumAddress) => {
        const address = data.jibunAddress ?? data.autoJibunAddress
        this.value.set(address)
      },
      width: '100%',
      height: '100%'
    }).open({ popupName: 'daumpostcode' })
  }
}
