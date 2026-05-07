import { Routes } from '@angular/router';

export const routes: Routes = [
  // Default app entry now goes directly to login page.
  {
    path: '',
    redirectTo: 'login-page',
    pathMatch: 'full',
  },
  {
    path: 'home',
    redirectTo: 'login-page',
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
  {
    path: 'categories',
    loadComponent: () => import('./pages/categories/categories.page').then( m => m.CategoriesPage)
  },
];
