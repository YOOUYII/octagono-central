import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FightersService } from '../../../services/fighters.service';
import { Fighter } from '../../../models/fighter.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-admin-fighters',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-8 animate-fade-in">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-black text-white tracking-tight uppercase">Enciclopedia de Peleadores</h1>
          <p class="text-zinc-500 mt-1">Gestiona los perfiles, récords y estadísticas de los atletas.</p>
        </div>
        <div class="flex gap-2">
          <button (click)="openForm()" class="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-red-600/20">
            <i class="pi pi-user-plus"></i> Nuevo Peleador
          </button>
          <button (click)="loadFighters()" class="p-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-zinc-400 transition-all">
            <i class="pi pi-refresh" [class.animate-spin]="loading"></i>
          </button>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl">
          <div class="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">Peleadores</div>
          <div class="text-3xl font-black text-white">{{ fighters.length }}</div>
        </div>
        <div class="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl">
          <div class="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">Categorías</div>
          <div class="text-3xl font-black text-red-500">{{ getUniqueWeightClasses() }}</div>
        </div>
        <div class="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl col-span-1 md:col-span-2">
          <div class="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">Busqueda Rápida</div>
          <input type="text" [(ngModel)]="searchTerm" (input)="filterFighters()" placeholder="Filtrar por nombre..." 
            [ngModelOptions]="{standalone: true}"
            class="w-full bg-transparent border-none p-0 text-xl font-bold text-white focus:outline-none placeholder:text-zinc-700">
        </div>
      </div>

      <!-- Table -->
      <div class="bg-zinc-900/30 border border-zinc-800 rounded-2xl overflow-hidden backdrop-blur-sm">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-zinc-800 bg-white/[0.01]">
                <th class="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Atleta</th>
                <th class="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Peso / Estilo</th>
                <th class="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Récord (W-L-D)</th>
                <th class="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-800/50">
              <tr *ngFor="let fighter of filteredFighters" class="hover:bg-white/[0.02] transition-colors group">
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 overflow-hidden">
                       <img *ngIf="fighter.image_url" [src]="fighter.image_url" class="w-full h-full object-cover">
                       <div *ngIf="!fighter.image_url" class="w-full h-full flex items-center justify-center text-zinc-600 bg-zinc-900">
                         {{ fighter.name.charAt(0) }}
                       </div>
                    </div>
                    <div>
                      <div class="text-white font-bold group-hover:text-red-500 transition-colors">{{ fighter.name }}</div>
                      <div class="text-zinc-500 text-xs italic">"{{ fighter.nickname || 'Sin apodo' }}"</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="text-zinc-300 text-sm font-medium">{{ fighter.weight_class }}</div>
                  <div class="text-zinc-500 text-[10px] uppercase font-bold">{{ fighter.fighting_style || 'N/A' }}</div>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-2">
                    <span class="text-green-500 font-black">{{ fighter.wins }}</span>
                    <span class="text-zinc-700">-</span>
                    <span class="text-red-500 font-black">{{ fighter.losses }}</span>
                    <span class="text-zinc-700">-</span>
                    <span class="text-zinc-500 font-black">{{ fighter.draws }}</span>
                  </div>
                  <div class="text-[9px] text-zinc-600 font-bold uppercase tracking-tighter mt-0.5">
                    {{ fighter.wins_ko }} KO • {{ fighter.wins_sub }} SUB • {{ fighter.wins_dec }} DEC
                  </div>
                </td>
                <td class="px-6 py-4 text-right">
                  <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button (click)="openForm(fighter)" class="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-all">
                      <i class="pi pi-pencil"></i>
                    </button>
                    <button (click)="deleteFighter(fighter.id)" class="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all">
                      <i class="pi pi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="filteredFighters.length === 0 && !loading">
                 <td colspan="4" class="px-6 py-20 text-center text-zinc-600 italic">
                  No se encontraron peleadores con esos criterios.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Modal Form -->
      <div *ngIf="showForm" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in overflow-y-auto">
        <div class="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-3xl my-auto shadow-2xl relative">
          <div class="p-8">
            <div class="flex justify-between items-center mb-8">
              <div>
                <h2 class="text-2xl font-black text-white uppercase tracking-tighter">
                  {{ editingId ? 'Actualizar Guerrero' : 'Registrar Nuevo Guerrero' }}
                </h2>
                <p class="text-zinc-500 text-sm">Ingresa los datos biométricos y récord profesional.</p>
              </div>
              <button (click)="closeForm()" class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-zinc-800 text-zinc-500 transition-all">
                <i class="pi pi-times"></i>
              </button>
            </div>

            <form [formGroup]="fighterForm" (ngSubmit)="saveFighter()" class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- Data Principal -->
                <div class="md:col-span-2 grid grid-cols-2 gap-4">
                  <div class="col-span-2">
                    <label class="label">Nombre Completo</label>
                    <input type="text" formControlName="name" class="input" placeholder="Nombre real">
                  </div>
                  <div>
                    <label class="label">Apodo</label>
                    <input type="text" formControlName="nickname" class="input" placeholder="Ej: The Great">
                  </div>
                  <div>
                    <label class="label">Nacionalidad</label>
                    <input type="text" formControlName="nationality" class="input" placeholder="País">
                  </div>
                </div>

                <!-- Imagen Preview -->
                <div class="flex flex-col items-center justify-center border border-zinc-800 bg-zinc-950/50 rounded-2xl p-4">
                   <div class="w-24 h-24 rounded-full bg-zinc-900 border border-zinc-800 mb-3 overflow-hidden">
                     <img *ngIf="fighterForm.get('image_url')?.value" [src]="fighterForm.get('image_url')?.value" class="w-full h-full object-cover">
                     <div *ngIf="!fighterForm.get('image_url')?.value" class="w-full h-full flex items-center justify-center text-zinc-700"><i class="pi pi-user text-3xl"></i></div>
                   </div>
                   <input type="text" formControlName="image_url" class="input text-[10px]" placeholder="URL de Imagen">
                </div>

                <!-- Stats Físicos -->
                <div>
                  <label class="label">Categoría de Peso</label>
                  <select formControlName="weight_class" class="input appearance-none">
                    <option value="">Seleccionar...</option>
                    <option value="Heavyweight">Heavyweight</option>
                    <option value="Light Heavyweight">Light Heavyweight</option>
                    <option value="Middleweight">Middleweight</option>
                    <option value="Welterweight">Welterweight</option>
                    <option value="Lightweight">Lightweight</option>
                    <option value="Featherweight">Featherweight</option>
                    <option value="Bantamweight">Bantamweight</option>
                    <option value="Flyweight">Flyweight</option>
                    <option value="Strawweight">Strawweight</option>
                  </select>
                </div>
                <div>
                  <label class="label">Estilo de Pelea</label>
                  <input type="text" formControlName="fighting_style" class="input" placeholder="Ej: BJJ, Muay Thai">
                </div>
                <div>
                  <label class="label">Fecha Nacimiento</label>
                  <input type="date" formControlName="dob" class="input">
                </div>
                <div>
                  <label class="label">Altura (cm)</label>
                  <input type="number" formControlName="height_cm" class="input">
                </div>
                <div>
                  <label class="label">Alcance (cm)</label>
                  <input type="number" formControlName="reach_cm" class="input">
                </div>
                <div>
                  <label class="label">Récord Texto</label>
                  <input type="text" formControlName="record" class="input" placeholder="Ej: 20-2-0">
                </div>

                <!-- Record Detallado -->
                <div class="col-span-3 border-t border-zinc-800 pt-6">
                  <h3 class="text-white font-bold mb-4 uppercase text-xs tracking-widest text-zinc-400">Desglose de Récord</h3>
                  <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                    <div><label class="label">Wins</label><input type="number" formControlName="wins" class="input"></div>
                    <div><label class="label">Losses</label><input type="number" formControlName="losses" class="input"></div>
                    <div><label class="label">Draws</label><input type="number" formControlName="draws" class="input"></div>
                    <div><label class="label">NC</label><input type="number" formControlName="no_contests" class="input"></div>
                    <div><label class="label">KO</label><input type="number" formControlName="wins_ko" class="input"></div>
                    <div><label class="label">SUB</label><input type="number" formControlName="wins_sub" class="input"></div>
                    <div><label class="label">DEC</label><input type="number" formControlName="wins_dec" class="input"></div>
                  </div>
                </div>

                <div class="col-span-3">
                  <label class="label">Biografía</label>
                  <textarea formControlName="bio" rows="4" class="input resize-none" placeholder="Breve historia del peleador..."></textarea>
                </div>
              </div>

              <div class="flex gap-4 pt-4">
                <button type="button" (click)="closeForm()" class="flex-1 py-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-2xl font-bold transition-all">
                  Cancelar
                </button>
                <button type="submit" [disabled]="fighterForm.invalid || saving" class="flex-[2] py-4 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2">
                   <i class="pi pi-check-circle" *ngIf="!saving"></i>
                   <i class="pi pi-spin pi-spinner" *ngIf="saving"></i>
                   {{ editingId ? 'Guardar Cambios' : 'Registrar Peleador' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
    @keyframes fadeIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
    .label { display: block; font-size: 9px; font-weight: 900; color: #71717a; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.5rem; }
    .input { width: 100%; background: #09090b; border: 1px solid #27272a; border-radius: 0.75rem; padding: 0.75rem 1rem; color: white; font-size: 0.875rem; transition: all 0.2s; }
    .input:focus { outline: none; border-color: #dc2626; background: #000; box-shadow: 0 0 0 2px rgba(220, 38, 38, 0.1); }
  `],
  providers: [CommonModule]
})
export class AdminFightersComponent implements OnInit {
  private fightersService = inject(FightersService);
  private fb = inject(FormBuilder);

  fighters: Fighter[] = [];
  filteredFighters: Fighter[] = [];
  loading = false;
  saving = false;
  showForm = false;
  editingId: string | null = null;
  searchTerm = '';
  fighterForm: FormGroup;

  constructor() {
    this.fighterForm = this.fb.group({
      name: ['', Validators.required],
      nickname: [''],
      nationality: [''],
      weight_class: ['', Validators.required],
      fighting_style: [''],
      wins: [0, Validators.min(0)],
      losses: [0, Validators.min(0)],
      draws: [0, Validators.min(0)],
      no_contests: [0, Validators.min(0)],
      wins_ko: [0, Validators.min(0)],
      wins_sub: [0, Validators.min(0)],
      wins_dec: [0, Validators.min(0)],
      reach_cm: [null],
      height_cm: [null],
      dob: [''],
      image_url: [''],
      bio: [''],
      record: ['']
    });
  }

  ngOnInit() {
    this.loadFighters();
  }

  loadFighters() {
    this.loading = true;
    this.fightersService.getFighters({ limit: 200 })
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (res) => {
          this.fighters = res.data;
          this.filterFighters();
        },
        error: (err) => console.error(err)
      });
  }

  filterFighters() {
    if (!this.searchTerm) {
      this.filteredFighters = [...this.fighters];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredFighters = this.fighters.filter(f => 
        f.name.toLowerCase().includes(term) || 
        f.nickname?.toLowerCase().includes(term) ||
        f.weight_class?.toLowerCase().includes(term)
      );
    }
  }

  getUniqueWeightClasses() {
    return new Set(this.fighters.map(f => f.weight_class)).size;
  }

  openForm(fighter?: Fighter) {
    if (fighter) {
      this.editingId = fighter.id;
      this.fighterForm.patchValue(fighter);
    } else {
      this.editingId = null;
      this.fighterForm.reset({
        wins: 0, losses: 0, draws: 0, no_contests: 0,
        wins_ko: 0, wins_sub: 0, wins_dec: 0
      });
    }
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
    this.editingId = null;
    this.fighterForm.reset();
  }

  saveFighter() {
    if (this.fighterForm.invalid) return;
    this.saving = true;
    const data = this.fighterForm.value;

    const request = this.editingId 
      ? this.fightersService.updateFighter(this.editingId, data)
      : this.fightersService.createFighter(data);

    request.pipe(finalize(() => this.saving = false))
      .subscribe({
        next: () => {
          this.loadFighters();
          this.closeForm();
        },
        error: (err) => alert('Error: ' + err.message)
      });
  }

  deleteFighter(id: string) {
    if (confirm('¿Eliminar permanentemente a este peleador?')) {
      this.fightersService.deleteFighter(id).subscribe({
        next: () => this.loadFighters(),
        error: (err) => alert('Error: ' + err.message)
      });
    }
  }
}
