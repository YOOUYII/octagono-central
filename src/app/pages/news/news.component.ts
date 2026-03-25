import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NewsService } from '../../services/news.service';
import { News } from '../../models/news.model';

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './news.component.html'
})
export class NewsComponent implements OnInit {
  private newsService = inject(NewsService);

  newsList = signal<News[]>([]);
  loading = signal(true);
  total = signal(0);
  page = 1;
  limit = 12;

  ngOnInit() {
    this.loadNews();
  }

  loadNews() {
    this.loading.set(true);
    this.newsService.getNews({ page: this.page, limit: this.limit }).subscribe({
      next: res => { this.newsList.set(res.data); this.total.set(res.total); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  nextPage() { if (this.page * this.limit < this.total()) { this.page++; this.loadNews(); } }
  prevPage() { if (this.page > 1) { this.page--; this.loadNews(); } }
}
