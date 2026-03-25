import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-dashboard-placeholder',
  standalone: true,
  template: `
    <div class="bg-zinc-900 border border-zinc-800 border-dashed rounded-xl p-8 text-center text-zinc-500 mt-10">
      <i class="pi pi-verified text-4xl mb-4 text-zinc-600"></i>
      <h3 class="text-xl font-bold mb-2">Sección de Administración en Desarrollo</h3>
      <p>Visualiza y administra de forma segura la Base de Datos con todos los registros CRUD.</p>
    </div>
  `
})
export class AdminPlaceholderComponent {}
