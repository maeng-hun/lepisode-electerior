import { Component, input } from '@angular/core'
import { IServiceItem } from '../../../../../../types/interfaces/service.interface'

@Component({
  selector: 'app-service-item',
  standalone: true,
  templateUrl: './service-item.component.html'
})
export default class ServiceItemComponent {
  item = input.required<IServiceItem>()

  index = input.required<number>()

  isEven(): boolean {
    return this.index() % 2 === 1
  }

  getFormattedDescription(description: string): string {
    return description.replace(/\n/g, '<br>')
  }
}
