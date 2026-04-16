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
  private navSubscription: Subscription;

  constructor() {
    // Escuchar eventos de navegación para forzar un refresco de la UI
    // Esto soluciona problemas donde el router-outlet no se actualiza en el primer clic
    this.navSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      // Forzar un ciclo de detección de cambios en toda la aplicación
      setTimeout(() => {
        this.appRef.tick();
      }, 0);
    });
  }

  ngOnDestroy() {
    if (this.navSubscription) {
      this.navSubscription.unsubscribe();
    }
  }
}
