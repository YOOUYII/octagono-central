export interface Prediction {
  id: string;
  fight_id: string;
  user_id: string;
  predicted_winner_id: string;
  predicted_method: string;
  created_at?: string;
  updated_at?: string;
}
