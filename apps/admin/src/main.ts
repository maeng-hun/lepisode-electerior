import { bootstrapApplication } from '@angular/platform-browser'
import { App } from './app/app'
import { appConfig } from './app/app.config'
// 애플리케이션 시작될 때 가장 먼저 실행, 부트스트랩 담당
bootstrapApplication(App, appConfig).catch((err) => console.error(err))
