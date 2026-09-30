
export interface ChallengeTarget {
  metric: string;
  value: number;
  unit: string;
  applies_to: string;
}

export interface ChallengeActivityData {
  scope: string;
  start_time: string;
  deadline: string;
  duration_hours: number;
  team_size: number;
  targets: ChallengeTarget[];
  building_theme: string;
  difficulty_rating: string;
  completion_rule: string;
}

export interface Challenge {
  name: string;
  description: string;
  award_points: number;
  activity_data: ChallengeActivityData;
}

export interface ChallengeTeamMember {
  user_id: string | number;
  name: string;
  email: string;
  department_id: string | number;
  department_name: string;
}

export interface ChallengeTeam {
  team_name: string;
  members: ChallengeTeamMember[];
}

export interface DailyChallengeResponse {
  id: string | number;
  challenge_date: string;
  day_number_in_cycle: number;
  is_active: boolean;
  gemini_challenge: Challenge;
  teams: ChallengeTeam[];
  created_at: string;
}
