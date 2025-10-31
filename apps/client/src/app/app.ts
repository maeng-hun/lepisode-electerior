import { Component } from '@angular/core'
import { RouterModule } from '@angular/router'
import { CKEditorModule } from '@ckeditor/ckeditor5-angular'
import { register } from 'swiper/element/bundle'

register()

@Component({
  selector: 'app-root',
  imports: [RouterModule, CKEditorModule],
  templateUrl: './app.html'
})
export class App {}
