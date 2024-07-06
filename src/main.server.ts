import { bootstrapApplication } from '@angular/platform-browser';
import { AppModule } from './app/app.module';
import { appConfig } from './app/app.config';

const bootstrap = () => bootstrapApplication(AppModule, appConfig);

export { AppServerModule as default } from './app/app.module.server';
