import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EventsService } from '../../services/events.service';
import { Event } from '../../models/event.model';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './calendar.component.html'
})
export class CalendarComponent implements OnInit {
  private evService = inject(EventsService);

  upcoming = signal<Event[]>([]);
  completed = signal<Event[]>([]);
  loading = signal(true);
  activeTab = signal<'upcoming' | 'completed'>('upcoming');

  ngOnInit() {
    this.evService.getEvents({ status: 'upcoming', limit: 50 }).subscribe({
      next: res => { this.upcoming.set(res.data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
    this.evService.getEvents({ status: 'completed', limit: 20 }).subscribe({
      next: res => this.completed.set(res.data)
    });
  }
}
