import { Directive, ElementRef, HostBinding, HostListener, input, Renderer2, signal } from '@angular/core'

type TooltipPosition = 'top' | 'bottom' | 'left' | 'right'

@Directive({
  selector: '[appTooltip]'
})
export class TooltipDirective {
  text = input<string>('', { alias: 'appTooltip' })
  tooltipPosition = input<TooltipPosition>('bottom')

  private tooltipElement: HTMLElement | null = null
  private margin = signal(5)

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  @HostBinding('style.position') position = 'relative'

  @HostListener('mouseenter') onMouseEnter() {
    if (!this.text()) return

    // DOM 렌더링 후 툴팁 생성
    setTimeout(() => {
      this.createTooltip()
    }, 0)
  }

  @HostListener('mouseleave') onMouseLeave() {
    if (!this.tooltipElement) return

    this.renderer.setStyle(this.tooltipElement, 'opacity', '0')
    this.renderer.setStyle(this.tooltipElement, 'transform', 'scale(0.8)')

    setTimeout(() => {
      if (this.tooltipElement) {
        this.renderer.removeChild(document.body, this.tooltipElement)
        this.tooltipElement = null
      }
    }, 150) // 애니메이션 끝난 후 제거
  }

  private createTooltip() {
    if (!this.text()) return

    this.tooltipElement = this.renderer.createElement('div')
    this.renderer.appendChild(document.body, this.tooltipElement)
    this.renderer.addClass(this.tooltipElement, 'tooltip')

    if (!this.tooltipElement) return
    // 스타일
    Object.assign(this.tooltipElement.style, {
      position: 'fixed', // fixed로 변경
      background: 'rgba(0,0,0,0.75)',
      color: '#fff',
      padding: '5px 10px',
      borderRadius: '4px',
      zIndex: '10000', // 충분히 높게
      whiteSpace: 'nowrap',
      fontSize: '14px',
      opacity: '0',
      transform: 'scale(0.8)',
      transition: 'opacity 0.15s ease, transform 0.15s ease',
      pointerEvents: 'none' // 툴팁 자체는 마우스 이벤트 차단
    })

    this.renderer.setProperty(this.tooltipElement, 'innerText', this.text())
    this.setPosition()

    // 애니메이션
    setTimeout(() => {
      if (this.tooltipElement) {
        this.renderer.setStyle(this.tooltipElement, 'opacity', '1')
        this.renderer.setStyle(this.tooltipElement, 'transform', 'scale(1)')
      }
    }, 10)
  }

  private setPosition() {
    if (!this.tooltipElement) return

    const hostPos = this.el.nativeElement.getBoundingClientRect()
    const tooltipPos = this.tooltipElement.getBoundingClientRect()
    const margin = this.margin()

    let top = 0
    let left = 0

    switch (this.tooltipPosition()) {
      case 'top':
        top = hostPos.top - tooltipPos.height - margin
        left = hostPos.left + (hostPos.width - tooltipPos.width) / 2
        break
      case 'bottom':
        top = hostPos.bottom + margin
        left = hostPos.left + (hostPos.width - tooltipPos.width) / 2
        break
      case 'left':
        top = hostPos.top + (hostPos.height - tooltipPos.height) / 2
        left = hostPos.left - tooltipPos.width - margin
        break
      case 'right':
        top = hostPos.top + (hostPos.height - tooltipPos.height) / 2
        left = hostPos.right + margin
        break
    }

    this.renderer.setStyle(this.tooltipElement, 'top', `${top}px`)
    this.renderer.setStyle(this.tooltipElement, 'left', `${left}px`)
  }
}
