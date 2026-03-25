import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { EventsService } from '../../services/events.service';
import { Event } from '../../models/event.model';
import { Fight } from '../../models/fight.model';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './event-detail.html'
})
export class EventDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private evService = inject(EventsService);

  event = signal<(Event & { fights: Fight[] }) | null>(null);
  loading = signal(true);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.evService.getEventById(id).subscribe({
      next: ev => { this.event.set(ev); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  get mainCard(): Fight[] {
    return this.event()?.fights?.filter(f => f.is_main_event || f.card_order <= 5) ?? [];
  }

  get prelims(): Fight[] {
    return this.event()?.fights?.filter(f => !f.is_main_event && f.card_order > 5) ?? [];
  }
}
