import { bootstrapApplication } from '@angular/platform-browser';
import { AppModule } from './app/app.module';
import { App } from './app/app';
import { appConfig } from './app/app.config';

const bootstrap = () => bootstrapApplication(App, appConfig);

export { AppServerModule as default } from './app/app.module.server';
