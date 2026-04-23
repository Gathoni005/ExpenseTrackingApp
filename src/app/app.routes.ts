import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./pages/login-page/login-page.page').then((m) => m.LoginPage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'login-page',
    loadComponent: () => import('./pages/login-page/login-page.page').then( m => m.LoginPage)
  },
  {
    path: 'registration',
    loadComponent: () => import('./pages/registration/registration.page').then( m => m.RegistrationPage)
  },
  {
    path: 'event-registration',
    loadComponent: () => import('./pages/event-registration/event-registration.page').then( m => m.EventRegistrationPage)
  },
  {
    path: 'event-list',
    loadComponent: () => import('./pages/event-list/event-list.page').then( m => m.EventListPage)
  },
];
