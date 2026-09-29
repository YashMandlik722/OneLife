import {
  Department,
  User,
  Team,
  TeamMember,
  Challenge,
  ChallengeProgress,
  Activity,
  PointTransaction,
  LeaderboardUserEntry,
  LeaderboardDepartmentEntry,
} from '../types/database';

export const mockDepartments: Department[] = [
  { id: 'dept-1', name: 'Design', created_at: '2026-01-01T00:00:00Z' },
  { id: 'dept-2', name: 'Engineering', created_at: '2026-01-01T00:00:00Z' },
  { id: 'dept-3', name: 'Marketing', created_at: '2026-01-01T00:00:00Z' },
  { id: 'dept-4', name: 'Finance', created_at: '2026-01-01T00:00:00Z' },
  { id: 'dept-5', name: 'Sales', created_at: '2026-01-01T00:00:00Z' },
  { id: 'dept-6', name: 'Operations', created_at: '2026-01-01T00:00:00Z' },
  { id: 'dept-7', name: 'Product', created_at: '2026-01-01T00:00:00Z' },
  { id: 'dept-8', name: 'HR', created_at: '2026-01-01T00:00:00Z' },
];

export const mockUsers: User[] = [
  { id: 'u1', name: 'Nina Patel', email: 'nina.patel@example.com', department_id: 'dept-1', created_at: '2026-01-01T00:00:00Z' },
  { id: 'u2', name: 'Jon Okafor', email: 'jon.okafor@example.com', department_id: 'dept-2', created_at: '2026-01-01T00:00:00Z' },
  { id: 'u3', name: 'Elena Cruz', email: 'elena.cruz@example.com', department_id: 'dept-3', created_at: '2026-01-01T00:00:00Z' },
  { id: 'u4', name: 'Sam Rivera', email: 'sam.rivera@example.com', department_id: 'dept-3', created_at: '2026-01-01T00:00:00Z' },
  { id: 'u5', name: 'Tara Kim', email: 'tara.kim@example.com', department_id: 'dept-4', created_at: '2026-01-01T00:00:00Z' },
  { id: 'u6', name: 'Alex Lee', email: 'alex.lee@example.com', department_id: 'dept-5', created_at: '2026-01-01T00:00:00Z' },
  { id: 'u7', name: 'Dana Wu', email: 'dana.wu@example.com', department_id: 'dept-6', created_at: '2026-01-01T00:00:00Z' },
  { id: 'u8', name: 'Maya Jensen', email: 'jon.doe@example.com', department_id: 'dept-7', created_at: '2026-01-01T00:00:00Z' }, // Current User
  { id: 'u9', name: 'Kofi Mensah', email: 'kofi.mensah@example.com', department_id: 'dept-5', created_at: '2026-01-01T00:00:00Z' },
  { id: 'u10', name: 'Tariq Al-Mansoor', email: 'tariq.al@example.com', department_id: 'dept-2', created_at: '2026-01-01T00:00:00Z' },
];

export const mockTeams: Team[] = [
  { id: 't1', name: 'Alpha Sprinters', created_at: '2026-01-01T00:00:00Z' },
  { id: 't2', name: 'Beta Striders', created_at: '2026-01-01T00:00:00Z' },
];

export const mockTeamMembers: TeamMember[] = [
  { id: 'tm1', team_id: 't1', user_id: 'u1', joined_at: '2026-01-01T00:00:00Z' },
  { id: 'tm2', team_id: 't1', user_id: 'u2', joined_at: '2026-01-01T00:00:00Z' },
  { id: 'tm3', team_id: 't1', user_id: 'u8', joined_at: '2026-01-01T00:00:00Z' },
];

export const mockPointTransactions: PointTransaction[] = [
  { id: 'pt1', user_id: 'u1', points: 1284, reason: 'CHALLENGE_COMPLETED', created_at: '2026-09-29T10:00:00Z' },
  { id: 'pt2', user_id: 'u2', points: 1196, reason: 'CHALLENGE_COMPLETED', created_at: '2026-09-29T10:00:00Z' },
  { id: 'pt3', user_id: 'u3', points: 1143, reason: 'CHALLENGE_COMPLETED', created_at: '2026-09-29T10:00:00Z' },
  { id: 'pt4', user_id: 'u4', points: 1091, reason: 'DAILY_STEPS', created_at: '2026-09-29T10:00:00Z' },
  { id: 'pt5', user_id: 'u5', points: 1044, reason: 'DAILY_STEPS', created_at: '2026-09-29T10:00:00Z' },
  { id: 'pt6', user_id: 'u6', points: 998, reason: 'DAILY_STEPS', created_at: '2026-09-29T10:00:00Z' },
  { id: 'pt7', user_id: 'u7', points: 970, reason: 'DAILY_STEPS', created_at: '2026-09-29T10:00:00Z' },
  { id: 'pt8', user_id: 'u8', points: 928, reason: 'DAILY_STEPS', created_at: '2026-09-29T10:00:00Z' },
  { id: 'pt9', user_id: 'u9', points: 910, reason: 'DAILY_STEPS', created_at: '2026-09-29T10:00:00Z' },
  { id: 'pt10', user_id: 'u10', points: 890, reason: 'DAILY_STEPS', created_at: '2026-09-29T10:00:00Z' },
];

/**
 * Helper to compute Individual Leaderboard from DB tables
 */
export function getIndividualLeaderboardFromDB(): LeaderboardUserEntry[] {
  // Aggregate user points
  const pointsMap = new Map<string, number>();
  mockPointTransactions.forEach((pt) => {
    pointsMap.set(pt.user_id, (pointsMap.get(pt.user_id) || 0) + pt.points);
  });

  const deptMap = new Map<string, string>();
  mockDepartments.forEach((d) => deptMap.set(d.id, d.name));

  const sortedUsers = [...mockUsers].sort((a, b) => {
    const ptsA = pointsMap.get(a.id) || 0;
    const ptsB = pointsMap.get(b.id) || 0;
    return ptsB - ptsA;
  });

  return sortedUsers.map((user, index) => {
    const rank = index + 1;
    const pts = pointsMap.get(user.id) || 0;
    const deptName = deptMap.get(user.department_id) || 'General';

    // Extract initials
    const nameParts = user.name.split(' ');
    const initials = nameParts.map((p) => p[0]).join('').toUpperCase();

    const isCurrentUser = user.id === 'u8' || user.email === 'jon.doe@example.com';

    let avatarBgColor = '#27344D';
    let avatarTextColor = '#FFFFFF';
    let pillBgColor = 'rgba(39, 52, 77, 0.4)';
    let pillTextColor = '#9CA3AF';
    let badgeColor = '#6B7280';

    if (rank === 1) {
      avatarBgColor = '#22D3EE'; // Cyan
      avatarTextColor = '#000000';
      badgeColor = '#A3E635'; // Bright Neon Green badge
      pillBgColor = 'rgba(34, 211, 238, 0.2)';
      pillTextColor = '#22D3EE';
    } else if (rank === 2) {
      avatarBgColor = '#8B5CF6'; // Purple
      avatarTextColor = '#FFFFFF';
      badgeColor = '#94A3B8'; // Grey badge
      pillBgColor = 'rgba(139, 92, 246, 0.2)';
      pillTextColor = '#A78BFA';
    } else if (rank === 3) {
      avatarBgColor = '#F43F5E'; // Coral/Pink
      avatarTextColor = '#FFFFFF';
      badgeColor = '#F97316'; // Orange badge
      pillBgColor = 'rgba(244, 63, 94, 0.2)';
      pillTextColor = '#FB7185';
    } else if (isCurrentUser) {
      avatarBgColor = '#A3E635'; // Neon Green
      avatarTextColor = '#000000';
    }

    // Prev rank point gap
    let pointsBehindPrev = 0;
    if (index > 0) {
      const prevPts = pointsMap.get(sortedUsers[index - 1].id) || 0;
      pointsBehindPrev = prevPts - pts;
    }

    return {
      id: user.id,
      rank,
      name: user.name,
      initials,
      departmentName: deptName,
      points: pts,
      avatarBgColor,
      avatarTextColor,
      badgeColor,
      pillBgColor,
      pillTextColor,
      isCurrentUser,
      deltaToday: isCurrentUser ? 3 : undefined,
      pointsBehindPrev,
    };
  });
}

/**
 * Helper to compute Department Leaderboard from DB tables
 */
export function getDepartmentLeaderboardFromDB(): LeaderboardDepartmentEntry[] {
  const deptPoints = new Map<string, number>();
  const deptMembers = new Map<string, number>();

  mockUsers.forEach((user) => {
    deptMembers.set(user.department_id, (deptMembers.get(user.department_id) || 0) + 1);
  });

  mockPointTransactions.forEach((pt) => {
    const user = mockUsers.find((u) => u.id === pt.user_id);
    if (user) {
      deptPoints.set(user.department_id, (deptPoints.get(user.department_id) || 0) + pt.points);
    }
  });

  const colorPalette = ['#F59E0B', '#10B981', '#3B82F6', '#EC4899', '#8B5CF6', '#06B6D4'];

  const sortedDepts = [...mockDepartments]
    .map((dept) => ({
      id: dept.id,
      name: dept.name,
      membersCount: deptMembers.get(dept.id) || 0,
      points: deptPoints.get(dept.id) || 0,
    }))
    .sort((a, b) => b.points - a.points);

  return sortedDepts.map((dept, index) => ({
    id: dept.id,
    rank: index + 1,
    name: `${dept.name} Dept`,
    membersCount: dept.membersCount,
    points: dept.points,
    color: colorPalette[index % colorPalette.length],
  }));
}
