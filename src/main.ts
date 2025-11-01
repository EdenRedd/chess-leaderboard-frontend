import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { enableProdMode } from '@angular/core';

// Enable production mode to disable development logs
enableProdMode();

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
