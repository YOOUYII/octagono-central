import { Component } from '@angular/core';

@Component({
    standalone: true,
    selector: 'app-home',
    template: `
        <h2 class="text-2xl font-bold mb-4">Bienvenido a Octágono Central</h2>
        <p class="text-zinc-300">
        Noticias, estadísticas y seguimiento del mundo MMA.
        </p>
    `
})
export class HomeComponent {}
