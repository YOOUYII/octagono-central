import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterModule, HeaderComponent, FooterComponent],
  template: `
    <div class="min-h-screen flex flex-col bg-zinc-950">
      <app-header></app-header>
      <main class="flex-grow pt-10 pb-20 px-4 sm:px-6 lg:px-8">
        <router-outlet></router-outlet>
      </main>
      <app-footer></app-footer>
    </div>
  `
})
export class MainLayoutComponent {}
