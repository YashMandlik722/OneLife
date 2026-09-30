
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { ImageSourcePropType } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getCache, setCache } from '../utils/cache';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import AIProcessingAnimation from '../components/AIProcessingAnimation';
import { getHealthProvider, HealthData } from '../health';
import { fetchChallenges } from '../api/challenges';
import {
  Challenge,
  ChallengeTeam,
  ChallengeTarget,
  DailyChallengeResponse,
} from '../types/challenge';


// -----------------------------------------------------------------------------
// Fitness background images
// -----------------------------------------------------------------------------

const FITNESS_IMAGES: ImageSourcePropType[] = [
  require('../../assets/fitness_images/exercise1.jpg'),
  require('../../assets/fitness_images/exercise2.jpg'),
  require('../../assets/fitness_images/exercise3.jpg'),
  require('../../assets/fitness_images/exercise4.jpg'),
  require('../../assets/fitness_images/exercise5.jpg'),
  require('../../assets/fitness_images/running.jpg'),
  require('../../assets/fitness_images/running5.jpg'),
  require('../../assets/fitness_images/running6.jpg'),
];

// -----------------------------------------------------------------------------
// Presentational components
// -----------------------------------------------------------------------------

interface HeaderBarProps {
  title: string;
}

function HeaderBar({ title }: HeaderBarProps) {
  return (
    <View style={styles.topHeaderBar}>
      <Text style={styles.topHeaderTitle}>{title}</Text>
      <Image
        source={require('../../assets/OneLifeInAppLogo.png')}
        style={styles.topRightLogo}
        resizeMode="contain"
      />
    </View>
  );
}

interface HeroCardProps {
  challenge: Challenge;
  backgroundImage: ImageSourcePropType;
}

function HeroCard({ challenge, backgroundImage }: HeroCardProps) {
  return (
    <ImageBackground
      source={backgroundImage}
      style={styles.heroCard}
      imageStyle={styles.heroCardImage}
      resizeMode="cover"
    >
      <View style={styles.heroCardOverlay}>
        <View style={styles.heroTextSection}>
          <Text style={styles.heroTitle}>{challenge.name}</Text>
        </View>

        <View style={styles.heroActionRow}>
          <View style={styles.rewardPill}>
            <Ionicons name="trophy" size={14} color={colors.accentGold} />
            <Text style={styles.rewardPillLabel}>Finish reward:</Text>
            <Text style={styles.rewardPillPoints}>+{challenge.award_points} pts</Text>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}

interface ChallengeDetailsCardProps {
  challenge: Challenge;
}

function getTargetByMetric(targets: ChallengeTarget[], metric: string): ChallengeTarget | undefined {
  return targets.find((target) => target.metric.toLowerCase() === metric);
}

function ChallengeDetailsCard({ challenge }: ChallengeDetailsCardProps) {
  const { activity_data: activity } = challenge;
  const targets = activity.targets ?? [];

  const stepsTarget = getTargetByMetric(targets, 'steps');
  const floorsTarget = getTargetByMetric(targets, 'floors_climbed');

  const primaryTarget = stepsTarget ?? targets[0];
  const secondaryTarget =
    primaryTarget === stepsTarget
      ? floorsTarget
      : targets.find((target) => target !== primaryTarget);

  const difficulty = activity.difficulty_rating?.trim() || 'Not specified';

  return (
    <View style={styles.detailsCard}>
      <View style={styles.detailsHeader}>
        <View style={{ flex: 1, paddingRight: 8 }}>
          <Text style={styles.detailsSubtitle}>CHALLENGE DETAILS</Text>
        </View>

        <View style={styles.difficultyBadge}>
          <Ionicons name="flash" size={12} color={colors.accentGold} />
          <Text style={styles.difficultyText}>
            {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
          </Text>
        </View>
      </View>

      <Text style={styles.detailsDescription}>{challenge.description}</Text>

      <View style={styles.detailsGrid}>
        <View style={styles.detailsGridItem}>
          <Ionicons name="flag" size={16} color={colors.accentGreen} />
          <Text style={styles.detailsItemLabel}>Primary Target</Text>
          <Text style={styles.detailsItemValue}>
            {primaryTarget
              ? `${primaryTarget.value.toLocaleString()} ${primaryTarget.unit}`
              : '--'}
          </Text>
        </View>

        <View style={styles.detailsGridItem}>
          <Ionicons name="trophy" size={16} color={colors.accentGold} />
          <Text style={styles.detailsItemLabel}>Reward Points</Text>
          <Text style={styles.detailsItemValue}>+{challenge.award_points} PTS</Text>
        </View>

        <View style={styles.detailsGridItem}>
          <Ionicons name="time" size={16} color={colors.accentCyan} />
          <Text style={styles.detailsItemLabel}>Duration</Text>
          <Text style={styles.detailsItemValue}>
            {activity.duration_hours > 0 ? `${activity.duration_hours} hrs` : '--'}
          </Text>
        </View>
      </View>

      {secondaryTarget && (
        <View style={styles.secondaryTargetBox}>
          <Ionicons name="add-circle-outline" size={14} color={colors.accentCyan} />
          <Text style={styles.secondaryTargetLabel}>Also Required:</Text>
          <Text style={styles.secondaryTargetValue}>
            {secondaryTarget.value.toLocaleString()} {secondaryTarget.unit}
          </Text>
        </View>
      )}
    </View>
  );
}

interface TeamCompetitionSectionProps {
  teams: ChallengeTeam[];
  targets: ChallengeTarget[];
}

function TeamCompetitionSection({ teams, targets }: TeamCompetitionSectionProps) {
  const stepsTarget = getTargetByMetric(targets, 'steps');
  const floorsTarget = getTargetByMetric(targets, 'floors_climbed');

  return (
    <View style={styles.competitionContainer}>
      <Text style={styles.competitionSectionHeader}>TEAM COMPETITION</Text>

      {teams.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="people-outline" size={28} color={colors.textMuted} />
          <Text style={styles.emptyStateTitle}>No teams assigned yet</Text>
          <Text style={styles.emptyStateText}>
            Team assignments will appear here when they are available.
          </Text>
        </View>
      ) : (
        teams.map((team, teamIndex) => (
          <View key={`${team.team_name}-${teamIndex}`} style={styles.teamCard}>
            <View style={styles.teamHeader}>
              <View style={{ flex: 1, minWidth: 0, paddingRight: 10 }}>
                <Text style={styles.teamSubtitle}>COMPETING TEAM #{teamIndex + 1}</Text>
                <Text style={styles.teamTitle} numberOfLines={1}>
                  {team.team_name || 'Unnamed Team'}
                </Text>
                <Text style={styles.teamMemberCount}>
                  {team.members.length} {team.members.length === 1 ? 'member' : 'members'}
                </Text>
              </View>

              <View style={styles.avatarStack}>
                {team.members.slice(0, 4).map((member, index) => {
                  const initial = member.name?.trim().charAt(0).toUpperCase() || '?';
                  const memberColors = [
                    '#10B981',
                    '#F59E0B',
                    '#3B82F6',
                    '#8B5CF6',
                    '#EC4899',
                  ];

                  return (
                    <View
                      key={String(member.user_id)}
                      style={[
                        styles.avatarCircle,
                        {
                          backgroundColor: memberColors[index % memberColors.length],
                          zIndex: 10 - index,
                          marginLeft: index === 0 ? 0 : -10,
                        },
                      ]}
                    >
                      <Text style={styles.avatarText}>{initial}</Text>
                    </View>
                  );
                })}
              </View>
            </View>

            <View style={styles.teamGoalRow}>
              {stepsTarget && (
                <View style={styles.teamGoalChip}>
                  <Text style={styles.teamGoalValue}>
                    {stepsTarget.value.toLocaleString()}
                  </Text>
                  <Text style={styles.teamGoalLabel}>{stepsTarget.unit} · team goal</Text>
                </View>
              )}

              {floorsTarget && (
                <View style={styles.teamGoalChip}>
                  <Text style={styles.teamGoalValue}>
                    {floorsTarget.value.toLocaleString()}
                  </Text>
                  <Text style={styles.teamGoalLabel}>{floorsTarget.unit} · team goal</Text>
                </View>
              )}
            </View>

            <View style={styles.teamMembersContainer}>
              <Text style={styles.teamMembersHeader}>TEAM ROSTER</Text>

              {team.members.length === 0 ? (
                <Text style={styles.teamEmptyText}>No members assigned.</Text>
              ) : (
                team.members.map((member, memberIndex) => {
                  const initial = member.name?.trim().charAt(0).toUpperCase() || '?';
                  const memberColors = [
                    '#10B981',
                    '#F59E0B',
                    '#3B82F6',
                    '#8B5CF6',
                    '#EC4899',
                  ];

                  return (
                    <View key={String(member.user_id)} style={styles.memberRow}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, minWidth: 0 }}>
                        <View
                          style={[
                            styles.memberRowAvatar,
                            { backgroundColor: memberColors[memberIndex % memberColors.length] },
                          ]}
                        >
                          <Text style={styles.avatarText}>{initial}</Text>
                        </View>

                        <View style={{ flex: 1, minWidth: 0, marginLeft: 10 }}>
                          <Text style={styles.memberName} numberOfLines={1}>
                            {member.name || 'Unnamed member'}
                          </Text>
                          <Text style={styles.memberDepartment} numberOfLines={1}>
                            {member.department_name || 'Department not specified'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          </View>
        ))
      )}
    </View>
  );
}

interface HealthMetricsGridProps {
  healthData: HealthData | null;
}

function HealthMetricsGrid({ healthData }: HealthMetricsGridProps) {
  return (
    <View style={styles.statsGrid}>
      <View style={styles.statCard}>
        <Ionicons name="flame-outline" size={18} color={colors.accentGold} />
        <Text style={styles.statValue}>
          {healthData !== null ? healthData.caloriesKcal.toLocaleString() : '--'}
        </Text>
        <Text style={styles.statLabel}>Calories (kcal)</Text>
      </View>

      <View style={styles.statCard}>
        <Ionicons name="map-outline" size={18} color={colors.accentCyan} />
        <Text style={styles.statValue}>
          {healthData !== null ? `${healthData.distanceKm} km` : '--'}
        </Text>
        <Text style={styles.statLabel}>Distance</Text>
      </View>

      <View style={styles.statCard}>
        <Ionicons name="trending-up-outline" size={18} color={colors.accentPurple} />
        <Text style={styles.statValue}>
          {healthData !== null ? `${healthData.floorsClimbed} f` : '--'}
        </Text>
        <Text style={styles.statLabel}>Floors</Text>
      </View>
    </View>
  );
}

interface ErrorAlertProps {
  error: string | null;
}

function ErrorAlert({ error }: ErrorAlertProps) {
  if (!error) {
    return null;
  }

  return (
    <View style={styles.errorCard}>
      <Ionicons name="alert-circle-outline" size={18} color={colors.error} />
      <Text style={styles.errorText}>{error}</Text>
    </View>
  );
}

function LoadingScreen({ message }: { message: string }) {
  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
      ]}
    >
      <StatusBar style="light" />
      <ActivityIndicator size="large" color={colors.accentCyan} />
      <Text
        style={{
          color: colors.textSecondary,
          marginTop: 16,
          fontSize: 14,
          fontWeight: '600',
        }}
      >
        {message}
      </Text>
    </SafeAreaView>
  );
}

// -----------------------------------------------------------------------------
// Main screen
// -----------------------------------------------------------------------------

const challengeCacheKey = 'today_daily_challenge';

export default function ChallengeScreen() {
  const [dailyChallenge, setDailyChallenge] =
    useState<DailyChallengeResponse | null>(() =>
      getCache<DailyChallengeResponse>(challengeCacheKey)
    );

  const [loading, setLoading] = useState(() =>
    !getCache<DailyChallengeResponse>(challengeCacheKey)
  );
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);
  const [heroBgImage, setHeroBgImage] = useState<ImageSourcePropType>(FITNESS_IMAGES[0]);

  const challenge = dailyChallenge?.gemini_challenge ?? null;

  useEffect(() => {
    if (!dailyChallenge) {
      return;
    }

    const seed = `${dailyChallenge.id}-${dailyChallenge.challenge_date}`;
    let hash = 0;

    for (let index = 0; index < seed.length; index += 1) {
      hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
    }

    setHeroBgImage(FITNESS_IMAGES[hash % FITNESS_IMAGES.length]);
  }, [dailyChallenge]);

  const loadData = useCallback(async () => {
    setError(null);
    setHealthError(null);

    const challengeRequest = fetchChallenges()
      .then((response) => {
        if (!response.data) {
          throw new Error(response.error || 'No challenge available today.');
        }
        const data = response.data;
        setDailyChallenge(data);
        setCache(challengeCacheKey, data);
      });

    const healthRequest = getHealthProvider()
      .getTodayHealthData()
      .then((data) => {
        setHealthData(data);
      });

    const [challengeResult, healthResult] = await Promise.allSettled([
      challengeRequest,
      healthRequest,
    ]);

    if (challengeResult.status === 'rejected') {
      setError(
        challengeResult.reason instanceof Error
          ? challengeResult.reason.message
          : 'Unable to load today’s challenge.'
      );
    }

    if (healthResult.status === 'rejected') {
      setHealthError(
        healthResult.reason instanceof Error
          ? healthResult.reason.message
          : 'Unable to read today’s health data.'
      );
    }

    setLoading(false);
  }, [challengeCacheKey]);


  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        await loadData();
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void initialize();

    return () => {
      mounted = false;
    };
  }, [loadData]);

  const handlePullRefresh = useCallback(async () => {
    if (refreshing) {
      return;
    }

    setRefreshing(true);

    try {
      await loadData();
    } finally {
      setRefreshing(false);
    }
  }, [loadData, refreshing]);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <AIProcessingAnimation />
        </View>
      </SafeAreaView>
    );
  }

  if (!challenge) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <StatusBar style="light" />
        <ScrollView contentContainerStyle={styles.container}>
          <HeaderBar title="Challenges" />

          <View style={styles.emptyState}>
            <Ionicons name="trophy-outline" size={32} color={colors.textMuted} />
            <Text style={styles.emptyStateTitle}>No active challenge</Text>
            <Text style={styles.emptyStateText}>
              There is no active challenge available right now. Pull down to try again.
            </Text>
            <ErrorAlert error={error} />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="light" />

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handlePullRefresh}
            tintColor={colors.accentGreen}
            colors={[colors.accentGreen, colors.accentCyan]}
            progressBackgroundColor="#000000"
          />
        }
      >
        <HeaderBar title="Challenges" />

        <HeroCard challenge={challenge} backgroundImage={heroBgImage} />

        <ChallengeDetailsCard challenge={challenge} />

        <TeamCompetitionSection
          teams={dailyChallenge?.teams ?? []}
          targets={challenge.activity_data.targets}
        />

        <HealthMetricsGrid healthData={healthData} />

        {error && <ErrorAlert error={error} />}
        {healthError && <ErrorAlert error={healthError} />}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  topHeaderBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  topHeaderTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  topRightLogo: {
    width: 32,
    height: 32,
  },
  container: {
    padding: 16,
    paddingBottom: 40,
    backgroundColor: '#000000',
  },
  heroCard: {
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: 'rgba(16, 185, 129, 0.35)',
    marginBottom: 16,
    overflow: 'hidden',
    minHeight: 250,
  },
  heroCardImage: {
    borderRadius: 20,
  },
  heroCardOverlay: {
    backgroundColor: 'rgba(12, 17, 28, 0.45)',
    padding: 24,
    minHeight: 250,
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
  },
  heroTextSection: {
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 0,
    textAlign: 'left',
  },
  heroDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    textAlign: 'left',
  },
  heroActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 8,
    width: '100%',
  },
  rewardPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accentGoldGlow,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    flexShrink: 1,
  },
  rewardPillLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  rewardPillPoints: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.accentGold,
  },
  detailsCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 16,
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailsSubtitle: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.accentGreen,
    letterSpacing: 1.2,
  },
  difficultyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accentGoldGlow,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.accentGold,
  },
  detailsDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 16,
  },
  detailsGrid: {
    flexDirection: 'row',
    backgroundColor: colors.cardSecondary,
    borderRadius: 14,
    padding: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.cardBorderSubtle,
  },
  detailsGridItem: {
    flex: 1,
    alignItems: 'center',
  },
  detailsItemLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textMuted,
    marginTop: 4,
    marginBottom: 2,
  },
  detailsItemValue: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  secondaryTargetBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.25)',
    gap: 6,
  },
  secondaryTargetLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.accentCyan,
  },
  secondaryTargetValue: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  competitionContainer: {
    marginBottom: 16,
    gap: 12,
  },
  competitionSectionHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.accentCyan,
    letterSpacing: 1.5,
    marginBottom: 2,
    paddingLeft: 4,
  },
  teamCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 16,
  },
  teamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  teamSubtitle: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 1.2,
  },
  teamTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 2,
  },
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.card,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  teamMembersContainer: {
    backgroundColor: colors.cardSecondary,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.cardBorderSubtle,
  },
  teamMembersHeader: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 1,
    marginBottom: 10,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  memberRowAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 4,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    color: colors.textMuted,
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.errorBackground,
    borderColor: colors.error,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginTop: 14,
    gap: 8,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    flex: 1,
  },
  teamMemberCount: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 3,
  },
  memberDepartment: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 1,
  },
  teamGoalRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  teamGoalChip: {
    flex: 1,
    backgroundColor: colors.cardSecondary,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.cardBorderSubtle,
    alignItems: 'center',
  },
  teamGoalValue: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  teamGoalLabel: {
    fontSize: 9,
    color: colors.textMuted,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  teamEmptyText: {
    fontSize: 12,
    color: colors.textMuted,
    paddingVertical: 8,
  },
  emptyState: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 10,
    marginBottom: 4,
  },
  emptyStateText: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
});

