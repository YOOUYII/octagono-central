export interface Event {
  id: string;
  name: string;
  location?: string;
  venue?: string;
  event_date: string;
  status: 'upcoming' | 'live' | 'completed' | 'cancelled';
  poster_url?: string;
}
