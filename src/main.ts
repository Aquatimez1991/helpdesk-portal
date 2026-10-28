import { bootstrapApplication } from '@angular/platform-browser';
import { registerLocaleData } from '@angular/common';
import localeEsPe from '@angular/common/locales/es-PE';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
registerLocaleData(localeEsPe);
bootstrapApplication(AppComponent, appConfig).catch(error => console.error('No se pudo iniciar Cyberdesk.', error));
