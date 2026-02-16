import { Component, computed } from '@angular/core';
import { globalSearch } from '../../shared/search.state';

@Component({
    selector: 'app-fighters',
    standalone: true,
    templateUrl: './fighters.component.html',
})
export class FightersComponent {

    fighters = [
        { nombre: 'Ilia Topuria', categoria: 'Peso Pluma', record: '15-0-0' },
        { nombre: 'Max Holloway', categoria: 'Peso Pluma', record: '26-7-0' },
        { nombre: 'Islam Makhachev', categoria: 'Peso Ligero', record: '25-1-0' },
    ];

    filtrados = computed(() => {
        const q = globalSearch().toLowerCase();

        return this.fighters.filter(f =>
        f.nombre.toLowerCase().includes(q)
        );
    });
}
