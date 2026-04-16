import { Component, inject, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HeaderComponent } from '../../layouts/header/header.component';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent],
  templateUrl: './admin.component.html'
})
export class AdminComponent {
  private router = inject(Router);
  private zone = inject(NgZone);

  fastNavigate(path: string) {
    this.zone.run(() => {
      this.router.navigateByUrl(path);
    });
  }
}
