import { Component, input, model, output } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

@Component({
  selector: 'app-search-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-form.component.html'
})
export class SearchFormComponent {
  placeholder = input<string>('제목, 성명, 연락처로 검색해주세요.')
  keyword = model<string>('')
  searchItems = output<string>()
  keywordSearch = output<string>() // 키워드 검색용 시그널

  /**
   * @name onInput
   * @description 입력창에서 값이 변경될 때 호출
   *              - keyword 모델 업데이트
   *              - searchItems 이벤트 emit
   * @param {Event} event input 이벤트
   */
  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value
    this.keyword.set(value)
    this.searchItems.emit(value.trim())
  }

  /**
   * @name onEnter
   * @description Enter 키 입력 시 검색 이벤트 emit
   * @param {Event} event 키보드 이벤트
   */
  onEnter(event: Event): void {
    event.preventDefault()
    const keyboardEvent = event as KeyboardEvent
    if (keyboardEvent.key === 'Enter') {
      this.searchItems.emit(this.keyword().trim())
    }
  }

  /**
   * @description 검색 버튼 클릭 시 emit
   */
  onSearchClick(): void {
    this.keywordSearch.emit(this.keyword().trim())
  }
}
