import { Component, inject, ApplicationRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { HeaderComponent } from '../../layouts/header/header.component';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent],
  templateUrl: './admin.component.html'
})
export class AdminComponent implements OnDestroy {
  private router = inject(Router);
  private appRef = inject(ApplicationRef);
  public activeRoute = '';

  constructor() {
    // Sincronizar ruta activa inicial
    this.activeRoute = this.router.url;
  }

  navigateTo(path: string) {
    this.activeRoute = path;
    this.router.navigate([path]).then(() => {
      // Forzar refresco inmediato tras la navegación exitosa
      setTimeout(() => {
        this.appRef.tick();
      }, 0);
    });
  }

  isRouteActive(path: string): boolean {
    return this.activeRoute === path || this.router.url === path;
  }

  ngOnDestroy() {}
}
