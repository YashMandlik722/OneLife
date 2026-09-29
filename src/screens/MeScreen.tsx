import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { getHealthProvider, HealthData } from '../health';

export default function MeScreen() {
  const [selectedSegment, setSelectedSegment] = useState<'Daily' | 'Weekly' | 'Monthly'>('Daily');
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchHealthData = useCallback(async () => {
    setLoading(true);
    try {
      const provider = getHealthProvider();
      const data = await provider.getTodayHealthData();
      setHealthData(data);
    } catch (e) {
      console.warn('Failed to load health data in MeScreen:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealthData();
  }, [fetchHealthData]);

  // Format Today's Date (e.g. MON, SEP 28)
  const todayDateString = new Date()
    .toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    .toUpperCase();

  // Metrics Data
  const steps = healthData?.steps ?? 12480;
  const distanceKm = healthData?.distanceKm ?? 8.7;
  const floorsClimbed = healthData?.floorsClimbed ?? 18;

  // Goals
  const STEP_GOAL = 15000;
  const DISTANCE_GOAL = 10.0;
  const FLOORS_GOAL = 54;

  const stepPercent = Math.min(Math.round((steps / STEP_GOAL) * 100), 100);
  const distPercent = Math.min(Math.round((distanceKm / DISTANCE_GOAL) * 100), 100);
  const floorPercent = Math.min(Math.round((floorsClimbed / FLOORS_GOAL) * 100), 100);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Top Header: Identity & Date */}
        <View style={styles.header}>
          <View>
            <View style={styles.identityRow}>
              <View style={styles.userDot} />
              <Text style={styles.userIdentity}>MAYA JENSEN • PRODUCT</Text>
            </View>
            <Text style={styles.headerTitle}>Your activity</Text>
          </View>
          <View style={styles.dateBadge}>
            <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.dateBadgeText}>{todayDateString}</Text>
          </View>
        </View>

        {/* Daily / Weekly / Monthly Segment Switcher */}
        <View style={styles.segmentContainer}>
          {(['Daily', 'Weekly', 'Monthly'] as const).map((segment) => {
            const isActive = selectedSegment === segment;
            return (
              <TouchableOpacity
                key={segment}
                style={[styles.segmentTab, isActive && styles.activeSegmentTab]}
                onPress={() => setSelectedSegment(segment)}
                activeOpacity={0.7}
              >
                <Text style={[styles.segmentTabText, isActive && styles.activeSegmentTabText]}>
                  {segment}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Circular Activity Points Ring Card */}
        <View style={styles.activityCard}>
          <View style={styles.activityCardHeader}>
            <Text style={styles.activityCardSubtitle}>ACTIVITY POINTS</Text>
            <TouchableOpacity onPress={fetchHealthData} disabled={loading}>
              {loading ? (
                <ActivityIndicator size="small" color={colors.accentGreen} />
              ) : (
                <Ionicons name="refresh-outline" size={18} color={colors.textMuted} />
              )}
            </TouchableOpacity>
          </View>

          {/* Activity Ring */}
          <View style={styles.ringWrapper}>
            <View style={styles.outerRing}>
              <View style={styles.innerRing}>
                <Text style={styles.pointsNumber}>51</Text>
                <Text style={styles.pointsLabel}>pts</Text>
              </View>
            </View>
          </View>

          {/* Motivational Copy & Delta Badge */}
          <Text style={styles.motivationalText}>A strong day in motion</Text>
          <View style={styles.deltaBadge}>
            <Ionicons name="trending-up" size={14} color={colors.accentGreen} />
            <Text style={styles.deltaText}>+7 pts vs yesterday</Text>
          </View>
        </View>

        {/* TODAY'S METRICS Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>TODAY'S METRICS</Text>
        </View>

        {/* 1. Step Count Card */}
        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <View style={styles.metricIconBoxGreen}>
              <Ionicons name="footsteps" size={20} color={colors.accentGreen} />
            </View>
            <View style={styles.metricInfo}>
              <Text style={styles.metricName}>Step Count</Text>
              <Text style={styles.metricSubtext}>Daily Target: {STEP_GOAL.toLocaleString()} steps</Text>
            </View>
            <Text style={styles.metricValuePrimary}>{steps.toLocaleString()}</Text>
          </View>

          <View style={styles.metricProgressTrack}>
            <View style={[styles.metricProgressFillGreen, { width: `${stepPercent}%` }]} />
          </View>
          <View style={styles.metricFooter}>
            <Text style={styles.metricFooterText}>{stepPercent}% of goal</Text>
            <Text style={styles.metricFooterGoal}>{STEP_GOAL.toLocaleString()} goal</Text>
          </View>
        </View>

        {/* 2. Distance Travelled Card */}
        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <View style={styles.metricIconBoxCyan}>
              <Ionicons name="map" size={20} color={colors.accentCyan} />
            </View>
            <View style={styles.metricInfo}>
              <Text style={styles.metricName}>Distance Travelled</Text>
              <Text style={styles.metricSubtext}>Target: {DISTANCE_GOAL} km</Text>
            </View>
            <Text style={styles.metricValuePrimary}>{distanceKm} <Text style={styles.unitText}>km</Text></Text>
          </View>

          <View style={styles.metricProgressTrack}>
            <View style={[styles.metricProgressFillCyan, { width: `${distPercent}%` }]} />
          </View>
          <View style={styles.metricFooter}>
            <Text style={styles.metricFooterText}>{distPercent}% completed</Text>
            <Text style={styles.metricFooterGoal}>{DISTANCE_GOAL} km goal</Text>
          </View>
        </View>

        {/* 3. Floors Climbed Card */}
        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <View style={styles.metricIconBoxPurple}>
              <Ionicons name="trending-up" size={20} color={colors.accentPurple} />
            </View>
            <View style={styles.metricInfo}>
              <Text style={styles.metricName}>Floors Climbed</Text>
              <Text style={styles.metricSubtext}>Target: {FLOORS_GOAL} floors</Text>
            </View>
            <Text style={styles.metricValuePrimary}>{floorsClimbed} <Text style={styles.unitText}>/ {FLOORS_GOAL}</Text></Text>
          </View>

          <View style={styles.metricProgressTrack}>
            <View style={[styles.metricProgressFillPurple, { width: `${floorPercent}%` }]} />
          </View>
          <View style={styles.metricFooter}>
            <Text style={styles.metricFooterText}>{floorPercent}% of target</Text>
            <Text style={styles.metricFooterGoal}>{FLOORS_GOAL} floors goal</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    marginTop: 8,
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  userDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accentGreen,
  },
  userIdentity: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 1.2,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardSecondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorderSubtle,
    gap: 6,
  },
  dateBadgeText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 20,
  },
  segmentTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeSegmentTab: {
    backgroundColor: colors.cardSecondary,
    borderWidth: 1,
    borderColor: colors.cardBorderSubtle,
  },
  segmentTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
  },
  activeSegmentTabText: {
    color: colors.textPrimary,
  },
  activityCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 24,
  },
  activityCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  activityCardSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.accentGreen,
    letterSpacing: 1.2,
  },
  ringWrapper: {
    marginBottom: 16,
  },
  outerRing: {
    width: 136,
    height: 136,
    borderRadius: 68,
    borderWidth: 8,
    borderColor: colors.accentGreen,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentGreenGlow,
  },
  innerRing: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointsNumber: {
    fontSize: 44,
    fontWeight: '800',
    color: colors.textPrimary,
    lineHeight: 48,
  },
  pointsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accentGreen,
  },
  motivationalText: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 10,
  },
  deltaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accentGreenGlow,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  deltaText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.accentGreen,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 1.2,
  },
  metricCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 14,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  metricIconBoxGreen: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.accentGreenGlow,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  metricIconBoxCyan: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  metricIconBoxPurple: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  metricInfo: {
    flex: 1,
  },
  metricName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  metricSubtext: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  metricValuePrimary: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  unitText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  metricProgressTrack: {
    height: 6,
    backgroundColor: colors.cardSecondary,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  metricProgressFillGreen: {
    height: '100%',
    backgroundColor: colors.accentGreen,
    borderRadius: 3,
  },
  metricProgressFillCyan: {
    height: '100%',
    backgroundColor: colors.accentCyan,
    borderRadius: 3,
  },
  metricProgressFillPurple: {
    height: '100%',
    backgroundColor: colors.accentPurple,
    borderRadius: 3,
  },
  metricFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricFooterText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  metricFooterGoal: {
    fontSize: 12,
    color: colors.textMuted,
  },
});
