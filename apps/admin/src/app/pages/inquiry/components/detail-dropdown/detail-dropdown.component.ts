import { Component, signal } from '@angular/core'
import { IDropdownAction } from '../../../../../types/interfaces/dropdown.interface'

/**
 * @name DetailDropdownComponent
 * @description 공통 컨텍스트 메뉴 드롭다운 컴포넌트
 *              - 상위 컴포넌트에서 actions를 전달받아 표시
 *              - 각 액션은 버튼 클릭 시 handler 실행
 */
@Component({
  selector: 'app-detail-dropdown-component',
  standalone: true,
  templateUrl: './detail-dropdown.component.html'
})
export default class DetailDropdownComponent {
  actions = signal<IDropdownAction[]>([])
}
