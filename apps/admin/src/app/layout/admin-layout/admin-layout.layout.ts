import { Component } from '@angular/core'
import { RouterModule } from '@angular/router'
import { CommonModule } from '@angular/common'
import { AsideComponent } from '../aside/aside.component'
import { HeaderComponent } from '../header/header.component'

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterModule, CommonModule, AsideComponent, HeaderComponent],
  templateUrl: './admin-layout.layout.html'
})
export default class AdminLayoutLayout {}
