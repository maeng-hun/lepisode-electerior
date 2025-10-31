import { Component, effect, model } from '@angular/core'
import { toObservable } from '@angular/core/rxjs-interop'
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms'
import { Observable } from 'rxjs'

export const controlValueAccessorProvider = (component: any) => ({
  provide: NG_VALUE_ACCESSOR,
  useExisting: component,
  multi: true
})

@Component({
  selector: 'app-value-accessor-adapter',
  template: ''
})
export class ControlValueAccessorAdapter<T = any> implements ControlValueAccessor {
  value = model<T | null>(null)
  value$: Observable<T | null> = toObservable(this.value)
  disabled = model(false)

  private onChange: (value: T | null) => void = () => {}
  private onTouched: () => void = () => {}

  constructor() {
    effect(() => {
      const val = this.value()
      if (val !== undefined) this.onChange(val)
    })
  }

  writeValue(obj: T | null): void {
    this.value.set(obj)
  }

  registerOnChange(fn: (value: T | null) => void): void {
    this.onChange = fn
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled)
  }

  markAsTouched() {
    this.onTouched()
  }
}
