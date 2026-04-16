import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService, User } from '../../../services/admin.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-8">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-black text-white tracking-tight uppercase">Gestión de Usuarios</h1>
          <p class="text-zinc-500 mt-1">Administra el acceso, roles y estados de los usuarios de la plataforma.</p>
        </div>
        <div class="flex gap-2">
          <button (click)="loadUsers()" class="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-sm font-medium transition-all flex items-center gap-2">
            <i class="pi pi-refresh" [class.animate-spin]="loading"></i> Refrescar
          </button>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl">
          <div class="text-zinc-500 text-sm font-medium mb-1 uppercase tracking-wider">Total Usuarios</div>
          <div class="text-3xl font-black text-white">{{ users.length }}</div>
        </div>
        <div class="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl">
          <div class="text-zinc-500 text-sm font-medium mb-1 uppercase tracking-wider">Activos</div>
          <div class="text-3xl font-black text-green-500">{{ getActiveCount() }}</div>
        </div>
        <div class="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl">
          <div class="text-zinc-500 text-sm font-medium mb-1 uppercase tracking-wider">Administradores</div>
          <div class="text-3xl font-black text-red-500">{{ getAdminCount() }}</div>
        </div>
      </div>

      <!-- Users Table -->
      <div class="bg-zinc-900/30 border border-zinc-800 rounded-2xl overflow-hidden backdrop-blur-sm">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-zinc-800">
                <th class="px-6 py-4 text-xs font-black text-zinc-500 uppercase tracking-widest">Usuario</th>
                <th class="px-6 py-4 text-xs font-black text-zinc-500 uppercase tracking-widest">Rol</th>
                <th class="px-6 py-4 text-xs font-black text-zinc-500 uppercase tracking-widest">Estado</th>
                <th class="px-6 py-4 text-xs font-black text-zinc-500 uppercase tracking-widest text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-800/50">
              <tr *ngFor="let user of users" class="hover:bg-white/[0.02] transition-colors group">
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-red-600/10 border border-red-500/20 flex items-center justify-center text-red-500 font-bold uppercase">
                      {{ user.name.charAt(0) }}
                    </div>
                    <div>
                      <div class="text-white font-bold">{{ user.name }}</div>
                      <div class="text-zinc-500 text-sm">{{ user.email }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span [class]="user.role === 'admin' ? 'bg-red-500/10 text-red-500 border-red-500/30' : 'bg-zinc-800 text-zinc-400 border-zinc-700'" class="text-[10px] font-black uppercase tracking-tighter px-2 py-1 rounded border">
                    {{ user.role }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <span [class]="user.status === 1 ? 'text-green-500 bg-green-500/10' : 'text-zinc-500 bg-zinc-500/10'" class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border border-current transition-colors">
                    <span class="w-1.5 h-1.5 rounded-full bg-current"></span>
                    {{ user.status === 1 ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
                <td class="px-6 py-4 text-right">
                  <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button *ngIf="user.status === 1" (click)="updateStatus(user.id, 0)" class="p-2 text-zinc-400 hover:text-orange-500 hover:bg-orange-500/10 rounded-lg transition-all" title="Desactivar">
                      <i class="pi pi-ban"></i>
                    </button>
                    <button *ngIf="user.status !== 1" (click)="updateStatus(user.id, 1)" class="p-2 text-zinc-400 hover:text-green-500 hover:bg-green-500/10 rounded-lg transition-all" title="Activar">
                      <i class="pi pi-check-circle"></i>
                    </button>
                    <button (click)="deleteUser(user.id)" class="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all" title="Eliminar definitivamente">
                      <i class="pi pi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="users.length === 0 && !loading">
                <td colspan="4" class="px-6 py-20 text-center text-zinc-600">
                  <i class="pi pi-users text-4xl mb-4 opacity-20"></i>
                  <p>No se encontraron usuarios registrados.</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class AdminUsersComponent implements OnInit {
  private adminService = inject(AdminService);
  users: User[] = [];
  loading = false;

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.adminService.getUsers()
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (data) => this.users = data,
        error: (err) => console.error('Error loading users', err)
      });
  }

  updateStatus(id: string, status: number) {
    if (confirm(`¿Estás seguro de que deseas ${status === 1 ? 'activar' : 'desactivar'} a este usuario?`)) {
      this.adminService.changeStatus(id, status).subscribe({
        next: () => this.loadUsers(),
        error: (err) => alert('Error al actualizar estado: ' + err.message)
      });
    }
  }

  deleteUser(id: string) {
    if (confirm('¿ESTÁS SEGURO? Esta acción eliminará permanentemente al usuario y no se puede deshacer.')) {
      this.adminService.deleteUser(id).subscribe({
        next: () => this.loadUsers(),
        error: (err) => alert('Error al eliminar usuario: ' + err.message)
      });
    }
  }

  getActiveCount() {
    return this.users.filter(u => u.status === 1).length;
  }

  getAdminCount() {
    return this.users.filter(u => u.role === 'admin').length;
  }
}
