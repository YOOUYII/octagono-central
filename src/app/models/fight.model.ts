import { Fighter } from './fighter.model';

export interface Fight {
  id: string;
  event_id: string;
  fighter1_id: string;
  fighter2_id: string;
  winner_id?: string;
  weight_class?: string;
  result_method?: 'KO/TKO' | 'Submission' | 'Decision' | 'DQ' | 'No Contest';
  result_round?: number;
  result_time?: string;
  is_main_event: boolean;
  is_title_fight: boolean;
  card_order: number;
  fighter1?: Fighter;
  fighter2?: Fighter;
  winner?: Fighter;
}
