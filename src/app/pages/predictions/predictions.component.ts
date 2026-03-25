import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EventsService } from '../../services/events.service';
import { PredictionsService } from '../../services/predictions.service';
import { AuthService } from '../../services/auth.service';
import { Event } from '../../models/event.model';
import { Fight } from '../../models/fight.model';
import { Prediction } from '../../models/prediction.model';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-predictions',
  standalone: true,
  imports: [DatePipe, RouterModule],
  templateUrl: './predictions.component.html'
})
export class PredictionsComponent implements OnInit {
  private evService = inject(EventsService);
  private predService = inject(PredictionsService);
  public authService = inject(AuthService);

  events = signal<Event[]>([]);
  fightsMap = signal<Record<string, Fight[]>>({});
  myPicks = signal<Prediction[]>([]);
  loading = signal(true);
  saving = signal(false);
  pickError = signal('');

  methods = ['KO/TKO', 'SUMISIÓN', 'DECISIÓN'];

  ngOnInit() {
    if (!this.authService.isLoggedIn()) {
      this.loading.set(false);
      return;
    }

    // Cargar eventos upcoming (o todos si no hay upcoming)
    this.evService.getEvents({ status: 'upcoming', limit: 10 }).subscribe({
      next: res => {
        const eventsData: Event[] = res.data ?? (res as any) ?? [];

        // Fallback: si no hay eventos upcoming, cargar todos los eventos
        if (eventsData.length === 0) {
          this.evService.getEvents({ limit: 10 }).subscribe({
            next: res2 => this.loadPredictionsForEvents(res2.data ?? []),
            error: () => this.loading.set(false)
          });
        } else {
          this.loadPredictionsForEvents(eventsData);
        }
      },
      error: () => this.loading.set(false)
    });
  }

  private loadPredictionsForEvents(eventsData: Event[]) {
    this.events.set(eventsData);

    if (eventsData.length === 0) {
      this.loading.set(false);
      return;
    }

    const obs = eventsData.map(e => this.evService.getEventById(e.id));
    forkJoin(obs).subscribe({
      next: details => {
        const map: Record<string, Fight[]> = {};
        details.forEach((d: any) => map[d.id] = d.fights ?? []);
        this.fightsMap.set(map);
      },
      error: () => {}
    });

    this.predService.getMyPredictions().subscribe({
      next: picks => {
        this.myPicks.set(picks);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  getPick(fightId: string): Prediction | undefined {
    return this.myPicks().find(p => p.fight_id === fightId);
  }

  isPicked(fightId: string, fighterId: string): boolean {
    return this.getPick(fightId)?.predicted_winner_id === fighterId;
  }

  isMethodPicked(fightId: string, method: string): boolean {
    return this.getPick(fightId)?.predicted_method === method;
  }

  selectPick(fightId: string, winnerId: string, method: string) {
    if (this.saving()) return;
    this.saving.set(true);
    this.pickError.set('');

    const payload = { fight_id: fightId, predicted_winner_id: winnerId, predicted_method: method };

    this.predService.makePrediction(payload).subscribe({
      next: res => {
        const picks = this.myPicks().filter(p => p.fight_id !== fightId);
        picks.push(res.data);
        this.myPicks.set(picks);
        this.saving.set(false);
      },
      error: (err) => {
        this.pickError.set(err.error?.error || 'Error al guardar la predicción');
        this.saving.set(false);
      }
    });
  }
}
