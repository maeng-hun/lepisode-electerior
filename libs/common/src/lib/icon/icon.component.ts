import { Component, computed, HostBinding, input } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Size } from '../types/size.type'
import { Color } from '../types/color.type'

@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [CommonModule],
  template: ``,
  styleUrl: './icon.component.css',
  host: {
    '[attr.data-size]': 'size()',
    '[style]': 'style()'
  }
})
export class Icon {
  @HostBinding('class') get hostClass() {
    return this.$class()
  }

  name = input.required<string>()

  _name = computed(() => encodeURI(`https://api.iconify.design/${this.name()}.svg`))

  size = input<Size>('md')
  color = input<Color>('primary')
  $class = input<string>('', { alias: 'class' })

  style = computed(() => ({
    maskSize: 'cover',
    maskImage: `url(${this._name()})`,
    webkitMaskSize: 'cover',
    webkitMaskImage: `url(${this._name()})`,
    display: 'inline-block',
    background: 'currentColor'
  }))

  class = computed(() => `${this.size() ? `${this.size()}` : ''}  ${this.color() ? this.color() : ''}`)
}
