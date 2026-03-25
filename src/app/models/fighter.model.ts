export interface Fighter {
  id: string;
  name: string;
  nickname?: string;
  nationality?: string;
  weight_class?: string;
  fighting_style?: string;
  wins: number;
  losses: number;
  draws: number;
  no_contests: number;
  wins_ko: number;
  wins_sub: number;
  wins_dec: number;
  reach_cm?: number;
  height_cm?: number;
  dob?: string;
  image_url?: string;
  bio?: string;
  record?: string;
}
