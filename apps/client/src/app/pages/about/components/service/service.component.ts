import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import ServiceItemComponent from './service-item/service-item.component'
import { SERVICE_ITEMS } from '../../../../data/about/service-data'

@Component({
  selector: 'app-service-component',
  standalone: true,
  imports: [CommonModule, ServiceItemComponent],
  templateUrl: './service.component.html'
})
export default class ServiceComponent {
  serviceItems = SERVICE_ITEMS
}
