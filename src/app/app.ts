import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { globalSearch } from './shared/search.state';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
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
