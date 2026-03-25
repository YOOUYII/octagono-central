import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FightersService } from '../../services/fighters.service';
import { Fighter } from '../../models/fighter.model';

@Component({
  selector: 'app-fighter-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './fighter-detail.html'
})
export class FighterDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private fService = inject(FightersService);

  fighter = signal<Fighter | null>(null);
  loading = signal(true);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.fService.getFighterById(id).subscribe({
      next: f => { this.fighter.set(f); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  getKoPercent(f: Fighter): number {
    return f.wins > 0 ? Math.round((f.wins_ko / f.wins) * 100) : 0;
  }
  getSubPercent(f: Fighter): number {
    return f.wins > 0 ? Math.round((f.wins_sub / f.wins) * 100) : 0;
  }
  getDecPercent(f: Fighter): number {
    return f.wins > 0 ? Math.round((f.wins_dec / f.wins) * 100) : 0;
  }
}
