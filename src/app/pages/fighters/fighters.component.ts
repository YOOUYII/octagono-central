import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FightersService } from '../../services/fighters.service';
import { Fighter } from '../../models/fighter.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-fighters',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './fighters.component.html'
})
export class FightersComponent implements OnInit {
  private fService = inject(FightersService);

  fighters = signal<Fighter[]>([]);
  total = signal(0);
  loading = signal(false);
  search = '';
  weightClass = '';
  page = 1;
  limit = 21;

  weightClasses = ['Heavyweight', 'Light Heavyweight', 'Middleweight', 'Welterweight', 'Lightweight', 'Featherweight', 'Bantamweight', 'Flyweight', 'Women\'s Strawweight', 'Women\'s Flyweight', 'Women\'s Bantamweight', 'Women\'s Featherweight'];

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.fService.getFighters({ page: this.page, limit: this.limit, weight_class: this.weightClass || undefined, search: this.search || undefined }).subscribe({
      next: res => { this.fighters.set(res.data); this.total.set(res.total); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  onSearch() { this.page = 1; this.load(); }
  nextPage() { if (this.page * this.limit < this.total()) { this.page++; this.load(); } }
  prevPage() { if (this.page > 1) { this.page--; this.load(); } }
}
