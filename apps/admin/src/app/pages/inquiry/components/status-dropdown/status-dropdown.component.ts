import { Component, signal } from '@angular/core'
import { CommonModule } from '@angular/common'

/**
 * @name StatusDropdownComponent
 * @description 상태 변경 드롭다운 버튼 컴포넌트
 *              - 클릭 시 signal에 지정된 핸들러 호출
 */
@Component({
  selector: 'app-status-dropdown',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './status-dropdown.component.html'
})
export default class StatusDropdownComponent {
  clickHandler = signal<(() => void) | null>(null)

  buttonText = signal<string>('상태 변경')

  /**
   * @name markComplete
   * @description 버튼 클릭 시 clickHandler에 지정된 함수 실행
   */
  markComplete(): void {
    const handler = this.clickHandler()
    if (handler) {
      handler()
    }
  }
}
