import { toSignal } from '@angular/core/rxjs-interop'
import { Subject } from 'rxjs'

export class BaseStore<T = any> {
  protected readonly state$ = new Subject<T>()
  //Subject = 확성기: next()로 “새 상태”를 외친다. (Observable 스트림)
  protected readonly state = toSignal(this.state$)
  // toSignal = 통역기: Observable을 Angular signal로 바꿔 컴포넌트에서 반응형으로 쓰게 해준다.
  // state() = 현재 상태 스냅샷: signal을 함수처럼 호출하면 “현재 값”이 나온다

  constructor(initialState: T) {
    this.state$.next(initialState)
  }
  // 수정해서 보여주기
  protected updateState(partialState: Partial<T>) {
    this.state$.next({
      ...this.state()!, //현재상태 복사
      ...partialState // 바뀐 부분마 덮어쓰기
    })
  }
  // 현재상태 반환
  protected get(): T {
    return {
      ...this.state()!
    }
  }
}
