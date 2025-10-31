import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import InquiryFormComponent from './components/inquiry-form/inquiry-form.component'

@Component({
  selector: 'app-inquiry-component',
  standalone: true,
  imports: [CommonModule, InquiryFormComponent],
  templateUrl: './inquiry.component.html'
})
export default class InquiryComponent {}
