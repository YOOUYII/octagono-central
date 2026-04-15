import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NewsService } from '../../../services/news.service';
import { News } from '../../../models/news.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-admin-news',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-8 animate-fade-in">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-black text-white tracking-tight uppercase">Gestión de Noticias</h1>
          <p class="text-zinc-500 mt-1">Publica, edita y administra el contenido informativo del Octágono.</p>
        </div>
        <div class="flex gap-2">
          <button (click)="openForm()" class="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-red-600/20">
            <i class="pi pi-plus"></i> Nueva Noticia
          </button>
          <button (click)="loadNews()" class="p-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-zinc-400 transition-all">
            <i class="pi pi-refresh" [class.animate-spin]="loading"></i>
          </button>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl backdrop-blur-sm">
          <div class="text-zinc-500 text-xs font-black uppercase tracking-widest mb-1">Total Noticias</div>
          <div class="text-3xl font-black text-white">{{ newsList.length }}</div>
        </div>
        <div class="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl backdrop-blur-sm">
          <div class="text-zinc-500 text-xs font-black uppercase tracking-widest mb-1">Publicadas</div>
          <div class="text-3xl font-black text-green-500">{{ getPublishedCount() }}</div>
        </div>
        <div class="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl backdrop-blur-sm">
          <div class="text-zinc-500 text-xs font-black uppercase tracking-widest mb-1">Borradores</div>
          <div class="text-3xl font-black text-orange-500">{{ getDraftCount() }}</div>
        </div>
      </div>

      <!-- Table -->
      <div class="bg-zinc-900/30 border border-zinc-800 rounded-2xl overflow-hidden backdrop-blur-xl">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-zinc-800/50 bg-white/[0.02]">
                <th class="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Título / Categoría</th>
                <th class="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Estado</th>
                <th class="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Vistas / Likes</th>
                <th class="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-800/30">
              <tr *ngFor="let news of newsList" class="hover:bg-white/[0.02] transition-colors group">
                <td class="px-6 py-4">
                  <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-lg bg-zinc-800 border border-zinc-700 overflow-hidden flex-shrink-0">
                      <img *ngIf="news.image_url" [src]="news.image_url" class="w-full h-full object-cover">
                      <div *ngIf="!news.image_url" class="w-full h-full flex items-center justify-center text-zinc-600">
                        <i class="pi pi-image"></i>
                      </div>
                    </div>
                    <div>
                      <div class="text-white font-bold group-hover:text-red-500 transition-colors">{{ news.title }}</div>
                      <div class="flex gap-2 mt-1">
                        <span class="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500 border border-zinc-700">
                          {{ news.category }}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span [class]="news.status === 'published' ? 'text-green-500 bg-green-500/10 border-green-500/20' : 'text-orange-500 bg-orange-500/10 border-orange-500/20'" 
                        class="text-[10px] font-black uppercase px-2 py-0.5 rounded-full border">
                    {{ news.status === 'published' ? 'Publicado' : 'Borrador' }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm font-medium text-zinc-400">
                  <div class="flex items-center gap-4">
                    <span class="flex items-center gap-1"><i class="pi pi-eye text-[10px]"></i> {{ news.views }}</span>
                    <span class="flex items-center gap-1"><i class="pi pi-heart text-[10px]"></i> {{ news.likes }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 text-right">
                  <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button (click)="openForm(news)" class="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-all">
                      <i class="pi pi-pencil"></i>
                    </button>
                    <button (click)="deleteNews(news.id)" class="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all">
                      <i class="pi pi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="newsList.length === 0 && !loading">
                 <td colspan="4" class="px-6 py-20 text-center text-zinc-600">
                  <i class="pi pi-file-o text-4xl mb-4 opacity-20"></i>
                  <p>No hay noticias registradas todavía.</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Modal Form -->
      <div *ngIf="showForm" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
        <div class="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
          <div class="p-8">
            <div class="flex justify-between items-center mb-8">
              <div>
                <h2 class="text-2xl font-black text-white uppercase tracking-tight">
                  {{ editingId ? 'Editar Noticia' : 'Crear Nueva Noticia' }}
                </h2>
                <p class="text-zinc-500 text-sm">Completa la información para publicar en la plataforma.</p>
              </div>
              <button (click)="closeForm()" class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-zinc-800 text-zinc-500 transition-all">
                <i class="pi pi-times"></i>
              </button>
            </div>

            <form [formGroup]="newsForm" (ngSubmit)="saveNews()" class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="col-span-2">
                  <label class="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Título de la Noticia</label>
                  <input type="text" formControlName="title" placeholder="Ej: Nueva pelea confirmada para UFC 300"
                    class="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-600 transition-colors">
                </div>

                <div>
                  <label class="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Categoría</label>
                  <select formControlName="category" class="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-600 transition-colors appearance-none">
                    <option value="noticias">Noticias</option>
                    <option value="octágono">Octágono</option>
                    <option value="fuera-del-octágono">Fuera del Octágono</option>
                    <option value="general">General</option>
                  </select>
                </div>

                <div>
                  <label class="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Estado</label>
                  <select formControlName="status" class="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-600 transition-colors appearance-none">
                    <option value="draft">Borrador</option>
                    <option value="published">Publicado</option>
                  </select>
                </div>

                <div class="col-span-2">
                  <label class="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">URL de la Imagen</label>
                  <input type="text" formControlName="image_url" placeholder="https://ejemplo.com/imagen.jpg"
                    class="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-600 transition-colors">
                </div>

                <div class="col-span-2">
                  <label class="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Resumen Corto</label>
                  <textarea formControlName="summary" rows="2" placeholder="Un pequeño resumen para la lista de noticias..."
                    class="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-600 transition-colors resize-none"></textarea>
                </div>

                <div class="col-span-2">
                  <label class="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Contenido de la Noticia</label>
                  <textarea formControlName="content" rows="6" placeholder="Escribe aquí toda la noticia..."
                    class="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-600 transition-colors resize-none"></textarea>
                </div>
              </div>

              <div class="flex gap-3 pt-4">
                <button type="button" (click)="closeForm()" class="flex-1 py-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold transition-all">
                  Cancelar
                </button>
                <button type="submit" [disabled]="newsForm.invalid || saving" class="flex-2 py-4 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2">
                  <i class="pi pi-save" *ngIf="!saving"></i>
                  <i class="pi pi-spin pi-spinner" *ngIf="saving"></i>
                  {{ editingId ? 'Guardar Cambios' : 'Publicar Noticia' }}
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
    .flex-2 { flex: 2; }
  `]
})
export class AdminNewsComponent implements OnInit {
  private newsService = inject(NewsService);
  private fb = inject(FormBuilder);

  newsList: News[] = [];
  loading = false;
  saving = false;
  showForm = false;
  editingId: string | null = null;
  newsForm: FormGroup;

  constructor() {
    this.newsForm = this.fb.group({
      title: ['', [Validators.required]],
      summary: ['', [Validators.required]],
      content: ['', [Validators.required]],
      category: ['noticias', [Validators.required]],
      status: ['draft', [Validators.required]],
      image_url: ['']
    });
  }

  ngOnInit() {
    this.loadNews();
  }

  loadNews() {
    this.loading = true;
    this.newsService.getNews({ limit: 100 })
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (res) => this.newsList = res.data,
        error: (err) => console.error('Error cargando noticias', err)
      });
  }

  openForm(news?: News) {
    if (news) {
      this.editingId = news.id;
      this.newsForm.patchValue(news);
    } else {
      this.editingId = null;
      this.newsForm.reset({ category: 'noticias', status: 'draft' });
    }
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
    this.editingId = null;
    this.newsForm.reset();
  }

  saveNews() {
    if (this.newsForm.invalid) return;

    this.saving = true;
    const newsData = this.newsForm.value;

    const request = this.editingId 
      ? this.newsService.updateNews(this.editingId, newsData)
      : this.newsService.createNews(newsData);

    request.pipe(finalize(() => this.saving = false))
      .subscribe({
        next: () => {
          this.loadNews();
          this.closeForm();
        },
        error: (err) => alert('Error al guardar: ' + (err.error?.error || err.message))
      });
  }

  deleteNews(id: string) {
    if (confirm('¿Estás seguro de eliminar esta noticia?')) {
      this.newsService.deleteNews(id).subscribe({
        next: () => this.loadNews(),
        error: (err) => alert('Error al eliminar: ' + (err.error?.error || err.message))
      });
    }
  }

  getPublishedCount() {
    return this.newsList.filter(n => n.status === 'published').length;
  }

  getDraftCount() {
    return this.newsList.filter(n => n.status === 'draft').length;
  }
}
