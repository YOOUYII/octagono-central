import { Component } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { globalSearch } from './shared/search.state';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet, RouterModule],
    templateUrl: './app.html',
})
export class App {
    mostrarEnlaces = false;

    toggleEnlaces() {
        this.mostrarEnlaces = !this.mostrarEnlaces;
    }

    buscar(valor: string) {
        globalSearch.set(valor);
    }

}
