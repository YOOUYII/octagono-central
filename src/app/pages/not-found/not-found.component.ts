import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div class="min-h-screen bg-black flex flex-col justify-center items-center text-center p-6 text-white font-sans">
      <div class="relative mb-8">
        <h1 class="text-9xl font-black text-zinc-900 tracking-tighter mix-blend-screen absolute inset-0 transform -translate-y-8 blur-sm">404</h1>
        <h1 class="text-7xl md:text-9xl font-black text-red-600 tracking-tighter relative z-10 drop-shadow-[0_0_15px_rgba(220,38,38,0.8)]">404</h1>
      </div>
      <h2 class="text-3xl font-black uppercase mb-4 text-zinc-200">Knockout Técnico</h2>
      <p class="text-zinc-400 mb-8 max-w-sm">Lo sentimos, esta página ha sido descalificada o movida fuera del octágono.</p>
      <a routerLink="/" class="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all transform hover:scale-105 uppercase tracking-wider text-sm">
        Volver a la Base
      </a>
    </div>
  `
})
export class NotFoundComponent {}
