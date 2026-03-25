import { User } from './user.model';

export interface News {
  id: string;
  author_id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  image_url?: string;
  category: 'general' | 'noticias' | 'octágono' | 'fuera-del-octágono' | string;
  status: 'draft' | 'published' | 'archived';
  views: number;
  likes: number;
  created_at?: string;
  published_at?: string;
  author?: User;
}
