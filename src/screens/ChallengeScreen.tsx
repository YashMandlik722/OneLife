import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Platform,
  SafeAreaView,
  Modal,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { getHealthProvider, USE_MOCK_HEALTH, HealthData } from '../health';

export default function ChallengeScreen() {
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  const TEAM_GOAL_STEPS = 24000;
  // Teammates' combined steps baseline (Nina + Jon + Elena)
  const TEAMMATES_STEPS_BASELINE = 6280;

  const syncHealthData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = getHealthProvider();
      const data = await provider.getTodayHealthData();
      setHealthData(data);
    } catch (err: any) {
      const msg = err?.message || String(err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    syncHealthData();
  }, [syncHealthData]);

  const userSteps = healthData?.steps ?? 12480;
  const teamTotalSteps = userSteps + TEAMMATES_STEPS_BASELINE;
  const teamProgressPercent = Math.min(Math.round((teamTotalSteps / TEAM_GOAL_STEPS) * 100), 100);
  const remainingSteps = Math.max(0, TEAM_GOAL_STEPS - teamTotalSteps);

  const platformLabel = USE_MOCK_HEALTH
    ? 'Mock Mode'
    : Platform.OS === 'ios'
    ? 'Apple HealthKit'
    : 'Android Health Connect';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* 1. BIOMETRIC AI HERO CARD ("The Pulse Relay") */}
        <View style={styles.heroCard}>
          {/* Top Row: AI GENERATED LIVE (Left) & HR: 168 SPM (Right) */}
          <View style={styles.heroTopRow}>
            <View style={styles.aiLiveBadge}>
              <View style={styles.liveDot} />
              <Ionicons name="sparkles" size={11} color={colors.accentGreen} />
              <Text style={styles.aiLiveText}>AI GENERATED LIVE</Text>
            </View>

            <View style={styles.hrBadge}>
              <Ionicons name="heart" size={13} color="#EF4444" />
              <Text style={styles.hrBadgeText}>HR: 168 SPM</Text>
            </View>
          </View>

          {/* Title & Description */}
          <View style={styles.heroTextSection}>
            <Text style={styles.heroEngineTag}>BIOMETRIC PERFORMANCE ENGINE</Text>
            <Text style={styles.heroTitle}>The Pulse Relay</Text>
            <Text style={styles.heroDescription}>
              Build a shared 24,000 step surge before time runs out.
            </Text>
          </View>

          {/* Countdown & Provider Row */}
          <View style={styles.heroTimerRow}>
            <View style={styles.timerPill}>
              <Ionicons name="time-outline" size={13} color={colors.accentGreen} />
              <Text style={styles.timerText}>06:42:18 remaining</Text>
            </View>

            <View style={styles.providerPill}>
              <Ionicons
                name={Platform.OS === 'ios' ? 'heart' : 'fitness'}
                size={11}
                color={colors.accentGreen}
              />
              <Text style={styles.providerText}>{platformLabel}</Text>
            </View>
          </View>

          {/* Action Row: Finish Reward & View Detail Modal */}
          <View style={styles.heroActionRow}>
            <View style={styles.rewardPill}>
              <Ionicons name="trophy" size={14} color={colors.accentGold} />
              <Text style={styles.rewardPillLabel}>Finish reward:</Text>
              <Text style={styles.rewardPillPoints}>+120 pts</Text>
            </View>

            <TouchableOpacity
              style={styles.viewDetailBtn}
              onPress={() => setModalVisible(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.viewDetailBtnText}>View</Text>
              <Ionicons name="chevron-forward" size={14} color={colors.accentGreen} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 2. TEAM KINETIC SECTION */}
        <View style={styles.teamCard}>
          <View style={styles.teamHeader}>
            <View style={{ flexShrink: 1 }}>
              <Text style={styles.teamSubtitle}>PARTICIPATING TEAM</Text>
              <Text style={styles.teamTitle}>Team Kinetic</Text>
            </View>

            {/* Member Avatars Stack */}
            <View style={styles.avatarStack}>
              <View style={[styles.avatarCircle, { backgroundColor: colors.accentGreen, zIndex: 4 }]}>
                <Text style={styles.avatarText}>M</Text>
              </View>
              <View style={[styles.avatarCircle, { backgroundColor: '#F59E0B', zIndex: 3, marginLeft: -10 }]}>
                <Text style={styles.avatarText}>N</Text>
              </View>
              <View style={[styles.avatarCircle, { backgroundColor: '#3B82F6', zIndex: 2, marginLeft: -10 }]}>
                <Text style={styles.avatarText}>J</Text>
              </View>
              <View style={[styles.avatarCircle, { backgroundColor: '#8B5CF6', zIndex: 1, marginLeft: -10 }]}>
                <Text style={styles.avatarText}>E</Text>
              </View>
            </View>
          </View>

          {/* Team Steps Display */}
          <View style={styles.teamStepsRow}>
            <Text style={styles.teamStepsBig}>{teamTotalSteps.toLocaleString()}</Text>
            <Text style={styles.teamStepsGoal}> / {TEAM_GOAL_STEPS.toLocaleString()} steps</Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressSection}>
            <View style={styles.progressLabels}>
              <Text style={styles.progressPercentText}>{teamProgressPercent}% completed</Text>
              <Text style={styles.remainingStepsText}>
                {remainingSteps.toLocaleString()} steps to goal
              </Text>
            </View>
            <View style={styles.progressBarTrack}>
              <View style={[styles.progressBarFill, { width: `${teamProgressPercent}%` }]} />
            </View>
          </View>

          {/* Individual Sync Button */}
          <TouchableOpacity
            style={styles.syncButton}
            onPress={syncHealthData}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={colors.textDark} />
            ) : (
              <View style={styles.syncButtonContent}>
                <Ionicons name="refresh" size={16} color={colors.textDark} style={styles.syncIcon} />
                <Text style={styles.syncButtonText}>
                  Sync Your Steps ({userSteps.toLocaleString()})
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* 3. AI SMART NUDGE CARD */}
        <View style={styles.nudgeCard}>
          <View style={styles.nudgeHeader}>
            <View style={styles.nudgeBadge}>
              <Ionicons name="sparkles" size={13} color={colors.accentPurple} />
              <Text style={styles.nudgeBadgeText}>NOVA AI SMART NUDGE</Text>
            </View>
            <Text style={styles.nudgeTime}>Just now</Text>
          </View>

          <Text style={styles.nudgeBody}>
            "Nova: A 9-min walk each closes the gap. Try a 3:30 PM stroll."
          </Text>
        </View>

        {/* 4. HEALTH METRICS GRID */}
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

        {/* Error Alert */}
        {error ? (
          <View style={styles.errorCard}>
            <Ionicons name="alert-circle-outline" size={18} color={colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}
      </ScrollView>

      {/* DETAIL MODAL */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>The Pulse Relay Details</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close-circle" size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalBodyText}>
              Team Kinetic is currently competing in the Biometric AI Performance Sprint. Sync steps before midnight to maximize your team ranking!
            </Text>

            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalCloseBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  container: {
    padding: 16,
    paddingBottom: 40,
    backgroundColor: '#000000',
  },
  heroCard: {
    backgroundColor: '#0C111C',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(16, 185, 129, 0.35)',
    marginBottom: 16,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    flexWrap: 'wrap',
    gap: 8,
  },
  aiLiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 5,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accentGreen,
  },
  aiLiveText: {
    color: colors.accentGreen,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  hrBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 5,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  hrBadgeText: {
    color: '#EF4444',
    fontSize: 11,
    fontWeight: '800',
  },
  heroTextSection: {
    marginBottom: 14,
  },
  heroEngineTag: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.accentGreen,
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  heroDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  heroTimerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(20, 26, 41, 0.8)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 14,
    flexWrap: 'wrap',
    gap: 8,
  },
  timerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  timerText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  providerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardSecondary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  providerText: {
    color: colors.accentGreen,
    fontSize: 10,
    fontWeight: '600',
  },
  heroActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  rewardPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accentGoldGlow,
    paddingHorizontal: 10,
    paddingVertical: 6,
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
  viewDetailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  viewDetailBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.accentGreen,
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
  syncButton: {
    backgroundColor: colors.accentGreen,
    width: '100%',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  syncButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  syncIcon: {
    marginRight: 6,
  },
  syncButtonText: {
    color: colors.textDark,
    fontSize: 14,
    fontWeight: '700',
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
});
