import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PredictionsService } from '../../../services/predictions.service';
import { User } from '../../../models/user.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-admin-predictions',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-8 animate-fade-in">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-black text-white tracking-tight uppercase">Ranking y Predicciones</h1>
          <p class="text-zinc-500 mt-1">Monitorea la participación de los usuarios y el ranking global de aciertos.</p>
        </div>
        <button (click)="loadRanking()" class="p-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-zinc-400 transition-all">
          <i class="pi pi-refresh" [class.animate-spin]="loading"></i>
        </button>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 p-8 rounded-3xl relative overflow-hidden group">
          <div class="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
             <i class="pi pi-trophy text-9xl"></i>
          </div>
          <div class="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Líder del Ranking</div>
          <div *ngIf="ranking.length > 0" class="flex items-center gap-4">
            <div class="w-16 h-16 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-500 font-black text-2xl">
              1
            </div>
            <div>
              <div class="text-white font-black text-xl">{{ ranking[0].name }}</div>
              <div class="text-zinc-500 text-sm italic">{{ ranking[0].email }}</div>
            </div>
          </div>
          <div *ngIf="ranking.length === 0" class="text-zinc-700">Sin datos</div>
        </div>

        <div class="bg-zinc-900/50 border border-zinc-800 p-8 rounded-3xl backdrop-blur-sm">
           <div class="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Usuarios Activos</div>
           <div class="text-4xl font-black text-white">{{ ranking.length }}</div>
        </div>

        <div class="bg-zinc-900/50 border border-zinc-800 p-8 rounded-3xl backdrop-blur-sm">
           <div class="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Promedio de Puntos</div>
           <div class="text-4xl font-black text-white">{{ getAveragePoints() }}</div>
        </div>
      </div>

      <!-- Ranking Table -->
      <div class="bg-zinc-900/30 border border-zinc-800 rounded-3xl overflow-hidden backdrop-blur-xl">
        <div class="p-6 border-b border-zinc-800/50 flex justify-between items-center">
            <h3 class="text-white font-bold uppercase text-xs tracking-widest">Top 50 Usuarios</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-white/[0.01]">
                <th class="px-8 py-5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Posición / Atleta</th>
                <th class="px-8 py-5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Puntos Acumulados</th>
                <th class="px-8 py-5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Efectividad</th>
                <th class="px-8 py-5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">Estado</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-800/30">
              <tr *ngFor="let user of ranking; let i = index" class="hover:bg-red-600/[0.03] transition-colors group">
                <td class="px-8 py-5">
                  <div class="flex items-center gap-4">
                    <span class="w-6 text-zinc-700 font-bold group-hover:text-red-500 transition-colors">#{{ i + 1 }}</span>
                    <div>
                      <div class="text-white font-bold">{{ user.name }}</div>
                      <div class="text-zinc-500 text-[10px] uppercase font-bold">{{ user.email }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-8 py-5">
                  <span [class]="i < 3 ? 'text-white' : 'text-zinc-400'" class="text-lg font-black">{{ user.points || 0 }} pts</span>
                </td>
                <td class="px-8 py-5 text-sm font-medium text-zinc-500">
                   <div class="w-32 bg-zinc-800 h-1 rounded-full overflow-hidden">
                      <div class="bg-red-600 h-full" [style.width.%]="(user.points || 0) * 2"></div>
                   </div>
                </td>
                <td class="px-8 py-5 text-right">
                   <span class="inline-flex items-center gap-1.5 text-green-500/50 text-[10px] font-black uppercase tracking-tighter">
                     <span class="w-1.5 h-1.5 rounded-full bg-current pulse"></span>
                     En línea
                   </span>
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
    @keyframes pulse { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }
    .pulse { animation: pulse 2s infinite ease-in-out; }
  `]
})
export class AdminPredictionsComponent implements OnInit {
  private predictionsService = inject(PredictionsService);
  ranking: any[] = [];
  loading = false;

  ngOnInit() {
    this.loadRanking();
  }

  loadRanking() {
    this.loading = true;
    this.predictionsService.getGlobalRanking()
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (data) => this.ranking = data,
        error: (err) => console.error(err)
      });
  }

  getAveragePoints() {
    if (this.ranking.length === 0) return 0;
    const total = this.ranking.reduce((acc, u) => acc + (u.points || 0), 0);
    return (total / this.ranking.length).toFixed(1);
  }
}
