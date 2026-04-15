import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EventsService } from '../../../services/events.service';
import { FightersService } from '../../../services/fighters.service';
import { Event } from '../../../models/event.model';
import { Fight } from '../../../models/fight.model';
import { Fighter } from '../../../models/fighter.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-admin-events',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-8 animate-fade-in pb-20">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-black text-white tracking-tight uppercase">Carteleras y Eventos</h1>
          <p class="text-zinc-500 mt-1">Organiza la programación de peleas y resultados oficiales.</p>
        </div>
        <div class="flex gap-2">
          <button (click)="openEventForm()" class="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-red-600/20">
            <i class="pi pi-calendar-plus"></i> Nuevo Evento
          </button>
          <button (click)="loadEvents()" class="p-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-zinc-400 transition-all">
            <i class="pi pi-refresh" [class.animate-spin]="loading"></i>
          </button>
        </div>
      </div>

      <!-- Main Content -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <!-- Events List -->
        <div class="lg:col-span-4 space-y-4">
          <div *ngFor="let event of events" 
               (click)="selectEvent(event)"
               [class.border-red-600]="selectedEvent?.id === event.id"
               [class.bg-red-600/5]="selectedEvent?.id === event.id"
               class="group relative overflow-hidden bg-zinc-900/50 border border-zinc-800 p-5 rounded-2xl cursor-pointer hover:border-zinc-700 transition-all">
            <div class="flex gap-4">
              <div class="w-16 h-20 rounded-lg bg-zinc-800 overflow-hidden flex-shrink-0 border border-zinc-700 overflow-hidden">
                <img *ngIf="event.poster_url" [src]="event.poster_url" class="w-full h-full object-cover">
                <div *ngIf="!event.poster_url" class="w-full h-full flex items-center justify-center text-zinc-600"><i class="pi pi-image text-xl"></i></div>
              </div>
              <div class="flex-1">
                <div class="text-xs font-black text-red-500 uppercase tracking-widest mb-1">{{ event.status }}</div>
                <h3 class="text-white font-bold leading-tight group-hover:text-red-500 transition-colors">{{ event.name }}</h3>
                <div class="text-zinc-500 text-[10px] mt-2 flex flex-col gap-1">
                  <span><i class="pi pi-calendar mr-1"></i> {{ event.event_date | date:'mediumDate' }}</span>
                  <span><i class="pi pi-map-marker mr-1"></i> {{ event.location }}</span>
                </div>
              </div>
            </div>
            
            <div class="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button (click)="openEventForm(event); $event.stopPropagation()" class="p-1.5 text-zinc-500 hover:text-white bg-zinc-950 rounded-md border border-zinc-800">
                <i class="pi pi-pencil text-[10px]"></i>
              </button>
              <button (click)="deleteEvent(event.id); $event.stopPropagation()" class="p-1.5 text-zinc-500 hover:text-red-500 bg-zinc-950 rounded-md border border-zinc-800">
                <i class="pi pi-trash text-[10px]"></i>
              </button>
            </div>
          </div>
          
          <div *ngIf="events.length === 0 && !loading" class="text-center py-12 border-2 border-dashed border-zinc-800 rounded-2xl text-zinc-600">
            No hay eventos programados.
          </div>
        </div>

        <!-- Fight Card Detail -->
        <div class="lg:col-span-8">
          <div *ngIf="selectedEvent" class="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 backdrop-blur-xl sticky top-4">
            <div class="flex justify-between items-center mb-8 pb-6 border-b border-zinc-800">
              <div>
                <span class="text-[10px] font-black uppercase text-zinc-500 tracking-widest bg-zinc-950 px-2 py-1 rounded">Cartelera del Evento</span>
                <h2 class="text-2xl font-black text-white mt-2">{{ selectedEvent.name }}</h2>
              </div>
              <button (click)="openFightForm()" class="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2">
                <i class="pi pi-plus"></i> Añadir Pelea
              </button>
            </div>

            <div class="space-y-4">
              <div *ngFor="let fight of selectedEventFights" class="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between hover:border-zinc-700 transition-colors group">
                <div class="flex-1 flex items-center gap-4 text-center">
                  <div class="flex-1">
                    <div class="text-[10px] font-bold text-zinc-600 mb-1">{{ fight.fighter1?.weight_class }}</div>
                    <div class="text-white font-bold">{{ fight.fighter1?.name }}</div>
                  </div>
                  <div class="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded italic text-red-500 font-black text-xs">VS</div>
                  <div class="flex-1">
                    <div class="text-[10px] font-bold text-zinc-600 mb-1">{{ fight.fighter2?.weight_class }}</div>
                    <div class="text-white font-bold">{{ fight.fighter2?.name }}</div>
                  </div>
                </div>

                <div class="w-32 px-4 border-l border-zinc-800 flex flex-col items-center">
                   <div *ngIf="fight.is_main_event" class="text-[9px] bg-red-600/20 text-red-500 px-1.5 py-0.5 rounded font-black uppercase mb-1">Main Event</div>
                   <div *ngIf="fight.is_title_fight" class="text-[9px] bg-yellow-600/20 text-yellow-500 px-1.5 py-0.5 rounded font-black uppercase">Title Fight</div>
                </div>

                <div class="flex gap-2">
                  <button (click)="openFightForm(fight)" class="p-2 text-zinc-500 hover:text-white transition-all"><i class="pi pi-cog"></i></button>
                  <button (click)="deleteFight(fight.id)" class="p-2 text-zinc-500 hover:text-red-500 transition-all"><i class="pi pi-trash"></i></button>
                </div>
              </div>

              <div *ngIf="selectedEventFights.length === 0" class="text-center py-20 text-zinc-600 italic">
                Aún no hay peleas registradas para este evento.
              </div>
            </div>
          </div>

          <div *ngIf="!selectedEvent" class="h-full flex items-center justify-center border-2 border-dashed border-zinc-800 rounded-3xl p-12 text-zinc-500 text-center">
            <div>
              <i class="pi pi-arrow-left text-4xl mb-4 opacity-10"></i>
              <p>Selecciona un evento para gestionar su cartelera.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Modals... (omitted for brevity in template, implementing full functional ones below) -->
       <!-- Event Modal -->
       <div *ngIf="showEventForm" class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
        <div class="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-lg shadow-2xl">
          <div class="p-8">
            <h2 class="text-xl font-black text-white uppercase mb-6">{{ editingEventId ? 'Editar Evento' : 'Nuevo Evento' }}</h2>
            <form [formGroup]="eventForm" (ngSubmit)="saveEvent()" class="space-y-4">
              <div><label class="label">Nombre del Evento</label><input type="text" formControlName="name" class="input" placeholder="Ej: UFC 301: Pantoja vs Erceg"></div>
              <div class="grid grid-cols-2 gap-4">
                <div><label class="label">Ubicación</label><input type="text" formControlName="location" class="input" placeholder="Las Vegas, NV"></div>
                <div><label class="label">Venue</label><input type="text" formControlName="venue" class="input" placeholder="T-Mobile Arena"></div>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div><label class="label">Fecha</label><input type="datetime-local" formControlName="event_date" class="input"></div>
                <div>
                  <label class="label">Estado</label>
                  <select formControlName="status" class="input appearance-none">
                    <option value="upcoming">Próximamente</option>
                    <option value="live">¡En Vivo!</option>
                    <option value="completed">Terminado</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                </div>
              </div>
              <div><label class="label">URL del Póster</label><input type="text" formControlName="poster_url" class="input"></div>
              
              <div class="flex gap-3 pt-6">
                <button type="button" (click)="showEventForm = false" class="flex-1 py-3 bg-zinc-800 text-white rounded-xl font-bold">Cancelar</button>
                <button type="submit" [disabled]="eventForm.invalid || saving" class="flex-2 py-3 bg-red-600 text-white rounded-xl font-bold">
                  {{ editingEventId ? 'Guardar' : 'Crear' }}
                </button>
              </div>
            </form>
          </div>
        </div>
       </div>

       <!-- Fight Modal -->
       <div *ngIf="showFightForm" class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in overflow-y-auto">
        <div class="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-2xl my-auto shadow-2xl">
          <div class="p-8">
            <h2 class="text-xl font-black text-white uppercase mb-6">{{ editingFightId ? 'Editar Pelea' : 'Nueva Pelea' }}</h2>
            <form [formGroup]="fightForm" (ngSubmit)="saveFight()" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-zinc-800/50">
                <div>
                  <label class="label">Peleador 1 (Esquina Roja)</label>
                  <select formControlName="fighter1_id" class="input">
                    <option value="">Seleccionar Atleta...</option>
                    <option *ngFor="let f of athletes" [value]="f.id">{{ f.name }} ({{ f.weight_class }})</option>
                  </select>
                </div>
                <div>
                  <label class="label">Peleador 2 (Esquina Azul)</label>
                  <select formControlName="fighter2_id" class="input">
                    <option value="">Seleccionar Atleta...</option>
                    <option *ngFor="let f of athletes" [value]="f.id">{{ f.name }} ({{ f.weight_class }})</option>
                  </select>
                </div>
              </div>

              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="col-span-2">
                  <label class="label text-red-500">¿Es Evento Principal?</label>
                  <div class="flex items-center gap-2 mt-2">
                    <input type="checkbox" formControlName="is_main_event" class="w-5 h-5 accent-red-600">
                    <span class="text-zinc-400 text-xs">Sí, Main Event</span>
                  </div>
                </div>
                <div class="col-span-2">
                   <label class="label text-yellow-500">¿Pelea de Campeonato?</label>
                   <div class="flex items-center gap-2 mt-2">
                    <input type="checkbox" formControlName="is_title_fight" class="w-5 h-5 accent-yellow-600">
                    <span class="text-zinc-400 text-xs">Sí, por título oficial</span>
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-2 md:grid-cols-3 gap-4 border-t border-zinc-800/50 pt-4">
                 <div><label class="label">Orden en Cartelera</label><input type="number" formControlName="card_order" class="input"></div>
                 <div class="md:col-span-2"><label class="label">Peso Pactado (Opcional)</label><input type="text" formControlName="weight_class" class="input" placeholder="Ej: Catchweight 165 lbs"></div>
              </div>

              <div *ngIf="editingFightId" class="pt-6 border-t font-bold border-red-900/30 p-4 bg-red-600/5 rounded-2xl">
                 <h3 class="text-red-500 text-[10px] uppercase font-black mb-4">Resultado Oficial (Opcional)</h3>
                 <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div class="col-span-2">
                       <label class="label">Ganador</label>
                       <select formControlName="winner_id" class="input">
                         <option value="">Ninguno aún</option>
                         <option *ngFor="let f of getCombatants()" [value]="f.id">{{ f.name }}</option>
                       </select>
                    </div>
                    <div>
                      <label class="label">Método</label>
                       <select formControlName="result_method" class="input">
                         <option value="">Pendiente</option>
                         <option value="KO/TKO">KO/TKO</option>
                         <option value="Submission">Sometimiento</option>
                         <option value="Decision">Decisión</option>
                         <option value="DQ">Descalificación</option>
                         <option value="No Contest">No Contest</option>
                       </select>
                    </div>
                    <div>
                      <label class="label">Round</label>
                      <input type="number" formControlName="result_round" class="input">
                    </div>
                 </div>
              </div>
              
              <div class="flex gap-3 pt-6">
                <button type="button" (click)="showFightForm = false" class="flex-1 py-3 bg-zinc-800 text-white rounded-xl font-bold">Cancelar</button>
                <button type="submit" [disabled]="fightForm.invalid || saving" class="flex-2 py-3 bg-red-600 text-white rounded-xl font-bold">
                  {{ editingFightId ? 'Actualizar Pelea' : 'Añadir a Cartelera' }}
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
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .label { display: block; font-size: 9px; font-weight: 900; color: #71717a; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.5rem; }
    .input { width: 100%; background: #09090b; border: 1px solid #27272a; border-radius: 0.75rem; padding: 0.6rem 0.8rem; color: white; font-size: 0.875rem; }
    .input:focus { outline: none; border-color: #dc2626; background: #000; }
  `]
})
export class AdminEventsComponent implements OnInit {
  private eventsService = inject(EventsService);
  private fightersService = inject(FightersService);
  private fb = inject(FormBuilder);

  events: Event[] = [];
  athletes: Fighter[] = [];
  loading = false;
  saving = false;
  selectedEvent: Event | null = null;
  selectedEventFights: Fight[] = [];
  
  showEventForm = false;
  editingEventId: string | null = null;
  eventForm: FormGroup;

  showFightForm = false;
  editingFightId: string | null = null;
  fightForm: FormGroup;

  constructor() {
    this.eventForm = this.fb.group({
      name: ['', Validators.required],
      location: [''],
      venue: [''],
      event_date: ['', Validators.required],
      status: ['upcoming', Validators.required],
      poster_url: ['']
    });

    this.fightForm = this.fb.group({
      fighter1_id: ['', Validators.required],
      fighter2_id: ['', Validators.required],
      is_main_event: [false],
      is_title_fight: [false],
      card_order: [1, Validators.required],
      weight_class: [''],
      winner_id: [''],
      result_method: [''],
      result_round: [null],
      result_time: ['']
    });
  }

  ngOnInit() {
    this.loadEvents();
    this.loadAthletes();
  }

  loadEvents() {
    this.loading = true;
    this.eventsService.getEvents({ limit: 50 })
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (res) => this.events = res.data,
        error: (err) => console.error(err)
      });
  }

  loadAthletes() {
    this.fightersService.getFighters({ limit: 1000 }).subscribe(res => this.athletes = res.data);
  }

  selectEvent(event: Event) {
    this.selectedEvent = event;
    this.loadEventFights(event.id);
  }

  loadEventFights(id: string) {
    this.eventsService.getEventById(id).subscribe({
      next: (res) => this.selectedEventFights = res.fights,
      error: (err) => console.error(err)
    });
  }

  openEventForm(event?: Event) {
    if (event) {
      this.editingEventId = event.id;
      // Convertir fecha iso a datetime-local format
      const date = event.event_date ? new Date(event.event_date).toISOString().slice(0, 16) : '';
      this.eventForm.patchValue({...event, event_date: date});
    } else {
      this.editingEventId = null;
      this.eventForm.reset({status: 'upcoming', event_date: new Date().toISOString().slice(0, 16)});
    }
    this.showEventForm = true;
  }

  saveEvent() {
    if (this.eventForm.invalid) return;
    this.saving = true;
    const data = this.eventForm.value;
    const req = this.editingEventId ? this.eventsService.updateEvent(this.editingEventId, data) : this.eventsService.createEvent(data);
    
    req.pipe(finalize(() => this.saving = false)).subscribe({
      next: () => {
        this.loadEvents();
        this.showEventForm = false;
      },
      error: (err) => alert(err.message)
    });
  }

  deleteEvent(id: string) {
    if(confirm('¿Eliminar evento y TODAS sus peleas?')) {
      this.eventsService.deleteEvent(id).subscribe(() => {
        this.loadEvents();
        if (this.selectedEvent?.id === id) this.selectedEvent = null;
      });
    }
  }

  // Fight Card Methods
  openFightForm(fight?: Fight) {
    if (!this.selectedEvent) return;
    if (fight) {
      this.editingFightId = fight.id;
      this.fightForm.patchValue(fight);
    } else {
      this.editingFightId = null;
      this.fightForm.reset({
        card_order: this.selectedEventFights.length + 1,
        is_main_event: false,
        is_title_fight: false
      });
    }
    this.showFightForm = true;
  }

  saveFight() {
    if (this.fightForm.invalid || !this.selectedEvent) return;
    this.saving = true;
    const data = this.fightForm.value;
    
    if (data.fighter1_id === data.fighter2_id) {
        alert('Un peleador no puede enfrentarse a sí mismo.');
        this.saving = false;
        return;
    }

    const req = this.editingFightId ? this.eventsService.updateFight(this.editingFightId, data) : this.eventsService.addFight(this.selectedEvent.id, data);
    
    req.pipe(finalize(() => this.saving = false)).subscribe({
      next: () => {
        this.loadEventFights(this.selectedEvent!.id);
        this.showFightForm = false;
      },
      error: (err) => alert(err.message)
    });
  }

  deleteFight(id: string) {
    if(confirm('¿Remover pelea de la cartelera?')) {
      this.eventsService.deleteFight(id).subscribe(() => this.loadEventFights(this.selectedEvent!.id));
    }
  }

  getCombatants() {
    const f1Id = this.fightForm.get('fighter1_id')?.value;
    const f2Id = this.fightForm.get('fighter2_id')?.value;
    return this.athletes.filter(a => a.id === f1Id || a.id === f2Id);
  }
}
