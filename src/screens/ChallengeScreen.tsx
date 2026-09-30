import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Platform,
  Modal,
  Image,
  ImageBackground,
  Animated,
  Easing,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

import { getHealthProvider, USE_MOCK_HEALTH, HealthData } from '../health';
import { fetchChallenges } from '../api/challenges';
import { Challenge } from '../types/challenge';

// -----------------------------------------------------------------------------
// Temporary Mock Challenges (Conforming to Real Backend Schema)
// -----------------------------------------------------------------------------

const MOCK_CHALLENGES: Challenge[] = [
  {
    id: 'mock-1',
    name: 'Service Floor Summit Challenge',
    description: 'Skip the elevator after lunch at the Service Floor canteen and take the stairs up to DigiValet on Floors 6 and 7. Rally your crew to collectively log 35,000 steps and climb 35 floors before 22:00 today. Hit both milestones as a squad across your workday to secure the 500-point win!',
    award_points: 500,
    activity_data: {
      scope: 'group_combined',
      start_time: '08:00 today',
      deadline: '22:00 today',
      duration_hours: 14,
      team_size: 5,
      teams: [
        { id: 't1', name: 'Titans' },
        { id: 't2', name: 'Minions' },
        { id: 't3', name: 'Kinetic' },
      ],
      targets: [
        {
          metric: 'steps',
          value: 35000,
          unit: 'steps',
          applies_to: 'team_total',
        },
        {
          metric: 'floors_climbed',
          value: 35,
          unit: 'floors',
          applies_to: 'team_total',
        },
      ],
      building_theme: 'Climbing from the Service Floor dining area up to DigiValet offices on Floor 6 and 7.',
      difficulty_rating: 'moderate',
      completion_rule: 'The team wins 500 points when all 5 members collectively record at least 35,000 steps and 35 floors climbed by 22:00 today.',
    },
    progress_records: [
      // Titans (team_id: 't1')
      {
        id: 'pr-1',
        challenge_id: 'mock-1',
        team_id: 't1',
        user_id: 'u-1',
        current_value: 7850,
        completed: false,
        completed_at: null,
        user: { id: 'u-1', name: 'Marcus Vance (You)', email: 'marcus@example.com' },
      },
      {
        id: 'pr-2',
        challenge_id: 'mock-1',
        team_id: 't1',
        user_id: 'u-2',
        current_value: 6800,
        completed: false,
        completed_at: null,
        user: { id: 'u-2', name: 'Nina Patel', email: 'nina@example.com' },
      },
      {
        id: 'pr-3',
        challenge_id: 'mock-1',
        team_id: 't1',
        user_id: 'u-3',
        current_value: 7100,
        completed: false,
        completed_at: null,
        user: { id: 'u-3', name: 'Jon Okafor', email: 'jon@example.com' },
      },
      {
        id: 'pr-4',
        challenge_id: 'mock-1',
        team_id: 't1',
        user_id: 'u-4',
        current_value: 6700,
        completed: false,
        completed_at: null,
        user: { id: 'u-4', name: 'Elena Cruz', email: 'elena@example.com' },
      },

      // Minions (team_id: 't2')
      {
        id: 'pr-5',
        challenge_id: 'mock-1',
        team_id: 't2',
        user_id: 'u-5',
        current_value: 6200,
        completed: false,
        completed_at: null,
        user: { id: 'u-5', name: 'Alex Wong', email: 'alex@example.com' },
      },
      {
        id: 'pr-6',
        challenge_id: 'mock-1',
        team_id: 't2',
        user_id: 'u-6',
        current_value: 5900,
        completed: false,
        completed_at: null,
        user: { id: 'u-6', name: 'Sarah Chen', email: 'sarah@example.com' },
      },
      {
        id: 'pr-7',
        challenge_id: 'mock-1',
        team_id: 't2',
        user_id: 'u-7',
        current_value: 6400,
        completed: false,
        completed_at: null,
        user: { id: 'u-7', name: 'David Kim', email: 'david@example.com' },
      },
      {
        id: 'pr-8',
        challenge_id: 'mock-1',
        team_id: 't2',
        user_id: 'u-8',
        current_value: 6320,
        completed: false,
        completed_at: null,
        user: { id: 'u-8', name: 'Lisa Ray', email: 'lisa@example.com' },
      },

      // Kinetic (team_id: 't3')
      {
        id: 'pr-9',
        challenge_id: 'mock-1',
        team_id: 't3',
        user_id: 'u-9',
        current_value: 8100,
        completed: false,
        completed_at: null,
        user: { id: 'u-9', name: 'Tom Hardy', email: 'tom@example.com' },
      },
      {
        id: 'pr-10',
        challenge_id: 'mock-1',
        team_id: 't3',
        user_id: 'u-10',
        current_value: 7900,
        completed: false,
        completed_at: null,
        user: { id: 'u-10', name: 'Amy Adams', email: 'amy@example.com' },
      },
      {
        id: 'pr-11',
        challenge_id: 'mock-1',
        team_id: 't3',
        user_id: 'u-11',
        current_value: 7600,
        completed: false,
        completed_at: null,
        user: { id: 'u-11', name: 'Chris Evans', email: 'chris@example.com' },
      },
      {
        id: 'pr-12',
        challenge_id: 'mock-1',
        team_id: 't3',
        user_id: 'u-12',
        current_value: 7600,
        completed: false,
        completed_at: null,
        user: { id: 'u-12', name: 'Mia Thermopolis', email: 'mia@example.com' },
      },
    ],
  },
];

// -----------------------------------------------------------------------------
// Fitness Background Images
// -----------------------------------------------------------------------------

const FITNESS_IMAGES = [
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
// Component Props Interfaces
// -----------------------------------------------------------------------------

interface HeaderBarProps {
  title: string;
}

interface HeroCardProps {
  activeChallenge: Challenge | null;
  backgroundImage: any;
}

interface ChallengeDetailsCardProps {
  activeChallenge: Challenge | null;
}

interface TeamCompetitionSectionProps {
  activeChallenge: Challenge | null;
  userSteps: number;
}

function TeamCompetitionSection({ activeChallenge, userSteps }: TeamCompetitionSectionProps) {
  const primaryTarget = activeChallenge?.activity_data?.targets?.[0];
  const teamGoalSteps = primaryTarget?.value || 35000;
  const targetUnit = primaryTarget?.unit || 'steps';

  const teams = activeChallenge?.activity_data?.teams || [{ id: 't1', name: 'Kinetic' }];
  const allRecords = activeChallenge?.progress_records || [];

  const memberColors = ['#10B981', '#F59E0B', '#3B82F6', '#8B5CF6', '#EC4899'];

  return (
    <View style={styles.competitionContainer}>
      <Text style={styles.competitionSectionHeader}>TEAM COMPETITION</Text>

      {teams.map((team, teamIdx) => {
        // Filter progress records for this team
        const teamRecords = allRecords.filter(
          (rec) => rec.team_id !== undefined ? String(rec.team_id) === String(team.id) : teamIdx === 0
        );

        // Map team member progress (override user_id 'u-1' with live userSteps)
        const members = teamRecords.map((rec, idx) => {
          const isUser = rec.user_id === 'u-1';
          const steps = isUser && userSteps > 0 ? userSteps : rec.current_value;
          return {
            id: String(rec.id),
            name: rec.user?.name || `Member ${idx + 1}`,
            initial: (rec.user?.name || 'M').charAt(0).toUpperCase(),
            steps,
            color: memberColors[idx % memberColors.length],
          };
        });

        const teamTotalSteps = members.reduce((sum, m) => sum + m.steps, 0);
        const teamProgressPercent = teamGoalSteps > 0
          ? Math.min(Math.round((teamTotalSteps / teamGoalSteps) * 100), 100)
          : 0;
        const remainingSteps = Math.max(0, teamGoalSteps - teamTotalSteps);

        return (
          <View key={String(team.id)} style={styles.teamCard}>
            <View style={styles.teamHeader}>
              <View style={{ flexShrink: 1 }}>
                <Text style={styles.teamSubtitle}>COMPETING TEAM #{teamIdx + 1}</Text>
                <Text style={styles.teamTitle}>{team.name}</Text>
              </View>

              {/* Member Avatars Stack */}
              <View style={styles.avatarStack}>
                {members.slice(0, 4).map((member, idx) => (
                  <View
                    key={member.id}
                    style={[
                      styles.avatarCircle,
                      { backgroundColor: member.color, zIndex: 10 - idx, marginLeft: idx === 0 ? 0 : -10 },
                    ]}
                  >
                    <Text style={styles.avatarText}>{member.initial}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Team Target Display */}
            <View style={styles.teamStepsRow}>
              <Text style={styles.teamStepsBig}>{teamTotalSteps.toLocaleString()}</Text>
              <Text style={styles.teamStepsGoal}> / {teamGoalSteps.toLocaleString()} {targetUnit}</Text>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressSection}>
              <View style={styles.progressLabels}>
                <Text style={styles.progressPercentText}>{teamProgressPercent}% completed</Text>
                <Text style={styles.remainingStepsText}>
                  {remainingSteps.toLocaleString()} {targetUnit} to goal
                </Text>
              </View>
              <View style={styles.progressBarTrack}>
                <View style={[styles.progressBarFill, { width: `${teamProgressPercent}%` }]} />
              </View>
            </View>

            {/* Team Members List */}
            <View style={styles.teamMembersContainer}>
              <Text style={styles.teamMembersHeader}>ROSTER & CONTRIBUTIONS</Text>
              {members.map((member) => (
                <View key={member.id} style={styles.memberRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                    <View style={[styles.memberRowAvatar, { backgroundColor: member.color }]}>
                      <Text style={styles.avatarText}>{member.initial}</Text>
                    </View>
                    <Text style={styles.memberName} numberOfLines={1}>{member.name}</Text>
                  </View>
                  <Text style={styles.memberSteps}>{member.steps.toLocaleString()} {targetUnit}</Text>
                </View>
              ))}
            </View>
          </View>
        );
      })}
    </View>
  );
}

interface SmartNudgeCardProps {
  nudgeText: string;
}

interface HealthMetricsGridProps {
  healthData: HealthData | null;
}

interface ErrorAlertProps {
  error: string | null;
}

interface LoadingScreenProps {
  message?: string;
}

interface AiSprintModalProps {
  visible: boolean;
  latestAiChallenge: Challenge | null;
  onClose: () => void;
}

// -----------------------------------------------------------------------------
// Local Presentational Components
// -----------------------------------------------------------------------------

function LoadingScreen({ message = 'Syncing Live Challenge & Health Data...' }: LoadingScreenProps) {
  return (
    <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }]}>
      <StatusBar style="light" />
      <ActivityIndicator size="large" color={colors.accentCyan} />
      <Text style={{ color: colors.textSecondary, marginTop: 16, fontSize: 14, fontWeight: '600' }}>
        {message}
      </Text>
    </SafeAreaView>
  );
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

function HeroCard({ activeChallenge, backgroundImage }: HeroCardProps) {
  const name = activeChallenge?.name || 'The Pulse Relay';
  const awardPoints = activeChallenge?.award_points ?? 120;

  return (
    <ImageBackground
      source={backgroundImage}
      style={styles.heroCard}
      imageStyle={styles.heroCardImage}
      resizeMode="cover"
    >
      <View style={styles.heroCardOverlay}>
        {/* Name & Description */}
        <View style={styles.heroTextSection}>
          <Text style={styles.heroTitle}>{name}</Text>
        </View>

        {/* Action Row: Reward Points */}
        <View style={styles.heroActionRow}>
          <View style={styles.rewardPill}>
            <Ionicons name="trophy" size={14} color={colors.accentGold} />
            <Text style={styles.rewardPillLabel}>Finish reward:</Text>
            <Text style={styles.rewardPillPoints}>
              +{awardPoints} pts
            </Text>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}

function ChallengeDetailsCard({ activeChallenge }: ChallengeDetailsCardProps) {
  const challenge = activeChallenge || MOCK_CHALLENGES[0];
  const description = challenge.description;
  const awardPoints = challenge.award_points;
  const difficulty = challenge.activity_data?.difficulty_rating || 'moderate';
  const duration = challenge.activity_data?.duration_hours ? `${challenge.activity_data.duration_hours} hrs` : '24 hrs';

  const targets = challenge.activity_data?.targets || [];
  const primaryTarget = targets[0];
  const secondaryTarget = targets.length > 1 ? targets[1] : null;

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

      <Text style={styles.detailsDescription}>{description}</Text>

      <View style={styles.detailsGrid}>
        <View style={styles.detailsGridItem}>
          <Ionicons name="flag" size={16} color={colors.accentGreen} />
          <Text style={styles.detailsItemLabel}>Primary Target</Text>
          <Text style={styles.detailsItemValue}>
            {primaryTarget ? `${primaryTarget.value.toLocaleString()} ${primaryTarget.unit}` : '--'}
          </Text>
        </View>

        <View style={styles.detailsGridItem}>
          <Ionicons name="trophy" size={16} color={colors.accentGold} />
          <Text style={styles.detailsItemLabel}>Reward Points</Text>
          <Text style={styles.detailsItemValue}>+{awardPoints} PTS</Text>
        </View>

        <View style={styles.detailsGridItem}>
          <Ionicons name="time" size={16} color={colors.accentCyan} />
          <Text style={styles.detailsItemLabel}>Duration</Text>
          <Text style={styles.detailsItemValue}>{duration}</Text>
        </View>
      </View>

      {/* Secondary Target Badge (e.g. 35 floors) */}
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



function SmartNudgeCard({ nudgeText }: SmartNudgeCardProps) {
  return (
    <View style={styles.nudgeCard}>
      <View style={styles.nudgeHeader}>
        <View style={styles.nudgeBadge}>
          <Ionicons name="sparkles" size={13} color={colors.accentPurple} />
          <Text style={styles.nudgeBadgeText}>NOVA AI SMART NUDGE</Text>
        </View>
        <Text style={styles.nudgeTime}>Just now</Text>
      </View>

      <Text style={styles.nudgeBody}>{nudgeText}</Text>
    </View>
  );
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

function ErrorAlert({ error }: ErrorAlertProps) {
  if (!error) return null;
  return (
    <View style={styles.errorCard}>
      <Ionicons name="alert-circle-outline" size={18} color={colors.error} />
      <Text style={styles.errorText}>{error}</Text>
    </View>
  );
}

function AiSprintModal({ visible, latestAiChallenge, onClose }: AiSprintModalProps) {
  const primaryTarget = latestAiChallenge?.activity_data?.targets?.[0];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { borderColor: '#A3E635', borderWidth: 1.5 }]}>
          <View style={styles.modalHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="sparkles" size={18} color="#A3E635" />
              <Text style={[styles.modalTitle, { color: '#A3E635' }]}>New Gemini AI Sprint</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close-circle" size={24} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <Text style={{ fontSize: 18, fontWeight: '800', color: '#FFFFFF', marginBottom: 8 }}>
            {latestAiChallenge?.name || 'AI Sprint Created'}
          </Text>

          <Text style={[styles.modalBodyText, { color: '#D1D5DB', fontSize: 14, lineHeight: 20 }]}>
            {latestAiChallenge?.description || 'Your team has been assigned a new Gemini AI fitness challenge!'}
          </Text>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#111827', padding: 12, borderRadius: 12, marginVertical: 14 }}>
            <Text style={{ color: '#9CA3AF', fontSize: 13, fontWeight: '600' }}>
              Target: {primaryTarget ? `${primaryTarget.value.toLocaleString()} ${primaryTarget.unit}` : '24,000 steps'}
            </Text>
            <Text style={{ color: '#A3E635', fontSize: 13, fontWeight: '800' }}>
              +{latestAiChallenge?.award_points ?? 120} PTS
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.modalCloseBtn, { backgroundColor: '#A3E635' }]}
            onPress={onClose}
          >
            <Text style={[styles.modalCloseBtnText, { color: '#000000' }]}>Let's Sprint! 🚀</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// -----------------------------------------------------------------------------
// Main Component
// -----------------------------------------------------------------------------

export default function ChallengeScreen() {
  // State
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [aiModalVisible, setAiModalVisible] = useState<boolean>(false);
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(MOCK_CHALLENGES[0]);
  const [latestAiChallenge, setLatestAiChallenge] = useState<Challenge | null>(null);

  // Fitness background image selection (stable per challenge)
  const [heroBgImage, setHeroBgImage] = useState<any>(() => {
    const initialIndex = Math.floor(Math.random() * FITNESS_IMAGES.length);
    return FITNESS_IMAGES[initialIndex];
  });

  const challengeKey = activeChallenge?.id ?? activeChallenge?.name;

  useEffect(() => {
    if (challengeKey) {
      const randomIndex = Math.floor(Math.random() * FITNESS_IMAGES.length);
      setHeroBgImage(FITNESS_IMAGES[randomIndex]);
    }
  }, [challengeKey]);

  // Constants & Calculations
  const primaryTarget = activeChallenge?.activity_data?.targets?.[0];
  const TEAMMATES_STEPS_BASELINE = 6280;
  const TEAM_GOAL_STEPS = primaryTarget?.value || 24000;
  const userSteps = healthData?.steps ?? 0;

  // Derive team total steps from progress records if present, or use demo fallback if absent
  const hasProgressRecords = Array.isArray(activeChallenge?.progress_records) && activeChallenge.progress_records.length > 0;
  const teamTotalSteps = hasProgressRecords
    ? activeChallenge!.progress_records!.reduce((sum, rec) => sum + (rec.current_value || 0), 0)
    : (userSteps + TEAMMATES_STEPS_BASELINE); // Temporary demo fallback

  const teamProgressPercent = TEAM_GOAL_STEPS > 0 ? Math.min(Math.round((teamTotalSteps / TEAM_GOAL_STEPS) * 100), 100) : 0;
  const remainingSteps = Math.max(0, TEAM_GOAL_STEPS - teamTotalSteps);

  // Data Fetching & Sync Handlers
  const loadChallenges = useCallback(async () => {
    try {
      const res = await fetchChallenges(1, 'ACTIVE');
      if (res.data && res.data.length > 0) {
        setActiveChallenge(res.data[0]);
      } else {
        // Fallback to mock challenge if API returns empty
        setActiveChallenge(MOCK_CHALLENGES[0]);
      }
    } catch (e) {
      console.warn('Failed to load challenges, using mock:', e);
      setActiveChallenge(MOCK_CHALLENGES[0]);
    }
  }, []);

  const syncHealthData = useCallback(async () => {
    if (!healthData && !activeChallenge) {
      setLoading(true);
    }
    setError(null);
    try {
      await loadChallenges();
      const provider = getHealthProvider();
      const data = await provider.getTodayHealthData();
      setHealthData(data);
    } catch (err: any) {
      const msg = err?.message || String(err);
      setError(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [loadChallenges, healthData, activeChallenge]);

  // ---------------------------------------------------------------------------
  // TEMPORARY DEMO BEHAVIOR: Auto-refresh health data every 3 seconds
  // ---------------------------------------------------------------------------
  const isSyncingRef = useRef<boolean>(false);
  const syncHealthDataRef = useRef(syncHealthData);

  useEffect(() => {
    syncHealthDataRef.current = syncHealthData;
  }, [syncHealthData]);

  useEffect(() => {
    let isCancelled = false;

    const runAutoSync = async () => {
      if (isSyncingRef.current || isCancelled) return;
      isSyncingRef.current = true;
      try {
        await syncHealthDataRef.current();
      } finally {
        isSyncingRef.current = false;
      }
    };

    // Initial sync on mount
    runAutoSync();

    // Repeat every 3 seconds for demo/development testing
    const autoSyncInterval = setInterval(() => {
      runAutoSync();
    }, 3000);

    return () => {
      isCancelled = true;
      clearInterval(autoSyncInterval);
    };
  }, []);

  const handlePullRefresh = useCallback(async () => {
    setRefreshing(true);
    await syncHealthData();
  }, [syncHealthData]);

  // Loading View (fallback if initial data sync occurs)
  if (loading && !healthData && !activeChallenge) {
    return <LoadingScreen message="Syncing Live Challenge & Health Data..." />;
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
        {/* Top Header Bar */}
        <HeaderBar title="Challenges" />

        {/* 1. Biometric AI Hero Card */}
        <HeroCard
          activeChallenge={activeChallenge}
          backgroundImage={heroBgImage}
        />

        {/* 2. Challenge Details Card */}
        <ChallengeDetailsCard activeChallenge={activeChallenge} />

        {/* 3. Team Competition Section */}
        <TeamCompetitionSection
          activeChallenge={activeChallenge}
          userSteps={userSteps}
        />

        {/* 4. AI Smart Nudge Card */}
        <SmartNudgeCard nudgeText='"Nova: A 9-min walk each closes the gap. Try a 3:30 PM stroll."' />

        {/* 5. Health Metrics Grid */}
        <HealthMetricsGrid healthData={healthData} />

        {/* Error Alert */}
        <ErrorAlert error={error} />
      </ScrollView>

      {/* Gemini AI Sprint Modal */}
      <AiSprintModal
        visible={aiModalVisible}
        latestAiChallenge={latestAiChallenge}
        onClose={() => setAiModalVisible(false)}
      />
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
  teamStepsRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  teamStepsBig: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  teamStepsGoal: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
  },
  progressSection: {
    width: '100%',
    marginBottom: 16,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressPercentText: {
    color: colors.accentGreen,
    fontSize: 12,
    fontWeight: '700',
  },
  remainingStepsText: {
    color: colors.textMuted,
    fontSize: 11,
  },
  progressBarTrack: {
    height: 7,
    backgroundColor: colors.cardSecondary,
    borderRadius: 3.5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.accentGreen,
    borderRadius: 3.5,
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
  memberSteps: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.accentGreen,
  },
  nudgeCard: {
    backgroundColor: colors.cardSecondary,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    marginBottom: 16,
  },
  nudgeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  nudgeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  nudgeBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.accentPurple,
    letterSpacing: 1,
  },
  nudgeTime: {
    fontSize: 10,
    color: colors.textMuted,
  },
  nudgeBody: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    lineHeight: 18,
    fontStyle: 'italic',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.accentGreen,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  modalBodyText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 20,
  },
  modalCloseBtn: {
    backgroundColor: colors.accentGreen,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCloseBtnText: {
    color: colors.textDark,
    fontSize: 14,
    fontWeight: '700',
  },
  aiIntroContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  aiIntroContent: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  aiIntroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 2,
    marginBottom: 8,
  },
});
