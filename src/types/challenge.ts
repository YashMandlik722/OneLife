export interface ChallengeTarget {
  metric: string;
  value: number;
  unit: string;
  applies_to: string;
}

export interface ChallengeTeam {
  id: string | number;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ChallengeActivityData {
  scope: string;
  start_time: string;
  deadline: string;
  duration_hours: number;
  team_size: number;
  teams: ChallengeTeam[];
  targets: ChallengeTarget[];
  building_theme: string;
  difficulty_rating: string;
  completion_rule: string;
}

export interface ChallengeUser {
  id: string | number;
  name: string;
  email: string;
}

export interface ChallengeProgressRecord {
  id: string | number;
  challenge_id: string | number;
  team_id?: string | number;
  user_id: string | number;
  current_value: number;
  completed: boolean;
  completed_at: string | null;
  createdAt?: string;
  updatedAt?: string;
  user?: ChallengeUser;
}

export interface Challenge {
  id: string | number;
  name: string;
  description: string;
  award_points: number;
  activity_data: ChallengeActivityData;
  progress_records?: ChallengeProgressRecord[];
  createdAt?: string;
  updatedAt?: string;
}
