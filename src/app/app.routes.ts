import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { AdminComponent } from './pages/admin/admin.component';
import { AdminUsersComponent } from './pages/admin/admin-users/admin-users.component';
import { AdminNewsComponent } from './pages/admin/admin-news/admin-news.component';
import { AdminFightersComponent } from './pages/admin/admin-fighters/admin-fighters.component';
import { AdminEventsComponent } from './pages/admin/admin-events/admin-events.component';
import { AdminPredictionsComponent } from './pages/admin/admin-predictions/admin-predictions.component';

export const routes: Routes = [
    {
        path: '',
        component: MainLayoutComponent,
        children: [
            { path: '', loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) },
            { path: 'terms', loadComponent: () => import('./pages/terms/terms').then(m => m.Terms) },
            // Parte 2 — Enciclopedia y Calendario
            { path: 'enciclopedia', loadComponent: () => import('./pages/fighters/fighters.component').then(m => m.FightersComponent) },
            { path: 'enciclopedia/:id', loadComponent: () => import('./pages/fighter-detail/fighter-detail').then(m => m.FighterDetailComponent) },
            { path: 'calendario', loadComponent: () => import('./pages/calendar/calendar.component').then(m => m.CalendarComponent) },
            { path: 'calendario/:id', loadComponent: () => import('./pages/event-detail/event-detail').then(m => m.EventDetailComponent) },
            // Parte 3 — Noticias y Predicciones
            { path: 'noticias', loadComponent: () => import('./pages/news/news.component').then(m => m.NewsComponent) },
            { path: 'noticias/:id', loadComponent: () => import('./pages/news-detail/news-detail.component').then(m => m.NewsDetailComponent) },
            { path: 'predicciones', loadComponent: () => import('./pages/predictions/predictions.component').then(m => m.PredictionsComponent) },
            { path: 'ranking', loadComponent: () => import('./pages/ranking/ranking.component').then(m => m.RankingComponent) },
            { path: 'perfil', loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent) }
        ]
    },
    { path: 'login', loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) },
    { path: 'registro', loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent) },
    { path: 'verify-email', loadComponent: () => import('./pages/verify-email/verify-email').then(m => m.VerifyEmail) },
    {
        path: 'admin',
        component: AdminComponent,
        children: [
            { path: 'usuarios', component: AdminUsersComponent },
            { path: 'noticias', component: AdminNewsComponent },
            { path: 'peleadores', component: AdminFightersComponent },
            { path: 'eventos', component: AdminEventsComponent },
            { path: 'predicciones', component: AdminPredictionsComponent },
            { path: '', redirectTo: 'usuarios', pathMatch: 'full' }
        ]
    },
    { path: '**', loadComponent: () => import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent) }
];
