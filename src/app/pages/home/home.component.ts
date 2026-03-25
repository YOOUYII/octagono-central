import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CarouselModule } from 'primeng/carousel';
import { NewsService } from '../../services/news.service';
import { EventsService } from '../../services/events.service';
import { News } from '../../models/news.model';
import { Event } from '../../models/event.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, CarouselModule],
  templateUrl: './home.component.html',
  styles: [`
    :host ::ng-deep .p-carousel .p-carousel-indicators { display: none; }
  `]
})
export class HomeComponent implements OnInit {
  private newsService = inject(NewsService);
  private eventsService = inject(EventsService);

  latestNews = signal<News[]>([]);
  nextEvent = signal<Event | null>(null);

  ngOnInit() {
    this.newsService.getNews({ limit: 4 }).subscribe({
      next: res => this.latestNews.set(res.data)
    });
    this.eventsService.getEvents({ status: 'upcoming', limit: 1 }).subscribe({
      next: res => {
        if (res.data && res.data.length > 0) {
          this.nextEvent.set(res.data[0]);
        }
      }
    });
  }
}
