import { ApplicationConfig } from '@angular/core'
import { provideRouter } from '@angular/router'
import { provideAnimations } from '@angular/platform-browser/animations'
import { provideHttpClient, withInterceptors } from '@angular/common/http'
import { appRoutes } from './app.routes'
import { adminAuthInterceptor } from './interceptors/adminauth.interceptor'
import { provideToastr } from 'ngx-toastr'

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(appRoutes),
    provideAnimations(),
    provideHttpClient(withInterceptors([adminAuthInterceptor])),
    provideToastr()
  ]
}
