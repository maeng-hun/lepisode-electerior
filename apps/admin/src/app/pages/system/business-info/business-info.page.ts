import { Component } from '@angular/core'
import { BusinessInfoFormComponent } from './components/business-info-form/business-info-form.component'

@Component({
  selector: 'app-business-info-page',
  standalone: true,
  imports: [BusinessInfoFormComponent],
  templateUrl: './business-info.page.html'
})
export default class BusinessInfoPage {}
