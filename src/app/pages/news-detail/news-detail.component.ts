import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { NewsService } from '../../services/news.service';
import { AuthService } from '../../services/auth.service';
import { News } from '../../models/news.model';

@Component({
  selector: 'app-news-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './news-detail.component.html'
})
export class NewsDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private newsService = inject(NewsService);
  public authService = inject(AuthService);

  news = signal<News | null>(null);
  loading = signal(true);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.newsService.getNewsById(id).subscribe({
      next: n => { this.news.set(n); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  toggleLike() {
    if (!this.authService.isLoggedIn()) return;
    const currentEvent = this.news();
    if (!currentEvent) return;

    this.newsService.toggleLike(currentEvent.id).subscribe({
      next: (res: any) => {
        // Optimistic UI update (ideal check if it was added or removed)
        const diff = res.message.includes('añadido') ? 1 : -1;
        this.news.update(n => n ? { ...n, likes: (n.likes || 0) + diff } : null);
      }
    });
  }
}
