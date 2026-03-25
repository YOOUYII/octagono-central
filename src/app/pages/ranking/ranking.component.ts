import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PredictionsService } from '../../services/predictions.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-ranking',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ranking.component.html'
})
export class RankingComponent implements OnInit {
  private predService = inject(PredictionsService);

  users = signal<User[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.predService.getGlobalRanking().subscribe({
      next: res => { this.users.set(res); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }
}
