import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';

export const pageProviders = [
  provideHttpClient(),
  provideRouter([]),
  provideAnimations()
];
