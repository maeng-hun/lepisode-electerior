import { Injectable } from '@angular/core'
import { ToastrService } from 'ngx-toastr'

type ToastPositions =
  | 'toast-top-left'
  | 'toast-top-right'
  | 'toast-bottom-left'
  | 'toast-bottom-right'
  | 'toast-bottom-center'

type ToastColors = 'success' | 'info' | 'warning' | 'error'

export type ToastProps = {
  title?: string
  message: string
  type: ToastColors
  positionClass?: ToastPositions
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  constructor(private readonly toastr: ToastrService) {}

  show(props: ToastProps): void {
    const { message: text, title, type, positionClass } = props
    if (this.toastr[type])
      this.toastr[type].call(this.toastr, text, title, {
        positionClass: positionClass || 'toast-top-right'
      })
  }

  success(message: string): void
  success(props: Omit<ToastProps, 'type'>): void

  success(props: string | Omit<ToastProps, 'type'>): void {
    if (typeof props === 'string') {
      this.toastr.success(props, undefined, {
        positionClass: 'toast-top-right'
      })
      return
    }
    const { message: text, title, positionClass } = props
    this.toastr.success(text, title, {
      positionClass: positionClass || 'toast-top-right'
    })
  }

  error(message: string): void
  error(props: Omit<ToastProps, 'type'>): void

  error(props: string | Omit<ToastProps, 'type'>): void {
    if (typeof props === 'string') {
      this.toastr.error(props, undefined, {
        positionClass: 'toast-top-right'
      })
      return
    }
    const { message: text, title, positionClass } = props
    this.toastr.error(text, title, {
      positionClass: positionClass || 'toast-top-right'
    })
  }

  info(message: string): void
  info(props: Omit<ToastProps, 'type'>): void

  info(props: string | Omit<ToastProps, 'type'>): void {
    if (typeof props === 'string') {
      this.toastr.info(props, undefined, {
        positionClass: 'toast-top-right'
      })
      return
    }
    const { message: text, title, positionClass } = props
    this.toastr.info(text, title, {
      positionClass: positionClass || 'toast-top-right'
    })
  }

  warning(message: string): void
  warning(props: Omit<ToastProps, 'type'>): void

  warning(props: string | Omit<ToastProps, 'type'>): void {
    if (typeof props === 'string') {
      this.toastr.warning(props, undefined, {
        positionClass: 'toast-top-right'
      })
      return
    }
    const { message: text, title, positionClass } = props
    this.toastr.warning(text, title, {
      positionClass: positionClass || 'toast-top-right'
    })
  }
}
