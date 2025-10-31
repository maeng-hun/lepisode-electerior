import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core'
import { provideRouter, withViewTransitions } from '@angular/router'
import { appRoutes } from './app.routes'
import { provideClientHydration, withEventReplay } from '@angular/platform-browser'
import { provideAnimations } from '@angular/platform-browser/animations'
import { provideHttpClient } from '@angular/common/http'
import { provideToastr } from 'ngx-toastr'
import { provideMarkdown } from 'ngx-markdown'

export const appConfig: ApplicationConfig = {
  providers: [
    provideClientHydration(withEventReplay()),
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes, withViewTransitions()),
    provideAnimations(),
    provideHttpClient(),
    provideToastr(),
    provideMarkdown()
  ]
}
