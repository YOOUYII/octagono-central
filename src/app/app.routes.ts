import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { FightersComponent } from './pages/fighters/fighters.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'fighters', component: FightersComponent },
];
