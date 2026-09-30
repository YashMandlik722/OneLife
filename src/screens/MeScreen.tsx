import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
  Image,
  RefreshControl,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';

import { getHealthProvider, HealthData } from '../health';
import { fetchUserDashboard, fetchMeProfile, UserDashboardData } from '../api/user';
import { syncNativeHealthKitActivity } from '../api/activity';
import { User, LeaderboardUserEntry } from '../types/database';
import { getCache } from '../utils/cache';
import { clearSession } from '../utils/sessionStorage';

interface MeScreenProps {
  onSignOut?: () => void;
}

export default function MeScreen({ onSignOut }: MeScreenProps) {
  const [selectedSegment, setSelectedSegment] = useState<'Daily' | 'Weekly' | 'Monthly'>('Daily');
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [dashboardData, setDashboardData] = useState<UserDashboardData | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState<boolean>(false);

  const loadUserData = useCallback(async (forceRefresh: boolean = false) => {
    // 1. Fetch User Dashboard with SWR Cache
    const dashRes = await fetchUserDashboard((freshDash) => {
      setDashboardData(freshDash);
    }, forceRefresh);
    if (dashRes.data) {
      setDashboardData(dashRes.data);
    }

    // 2. Fetch Profile with SWR Cache
    const profRes = await fetchMeProfile((freshUser) => {
      setUserProfile(freshUser);
    }, forceRefresh);
    if (profRes.data) {
      setUserProfile(profRes.data);
    }
  }, []);

  const fetchHealthData = useCallback(async (forceRefresh: boolean = false) => {
    if (!dashboardData && !userProfile) {
      setLoading(true);
    }
    try {
      await loadUserData(forceRefresh);

      // Read native HealthKit and sync to backend API (POST /api/v1/activities)
      const syncResult = await syncNativeHealthKitActivity(userProfile?.id, true);
      if (syncResult.success) {
        // Re-read fresh dashboard data after backend point calculation
        const updatedDash = await fetchUserDashboard(undefined, true);
        if (updatedDash.data) {
          setDashboardData(updatedDash.data);
        }
      }

      const provider = getHealthProvider();
      const data = await provider.getTodayHealthData();
      setHealthData(data);
    } catch (e) {
      console.warn('Failed to load health data in MeScreen:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [loadUserData, userProfile?.id]);

  useEffect(() => {
    fetchHealthData();
  }, [fetchHealthData]);

  const handlePullRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchHealthData(true);
  }, [fetchHealthData]);

  // Format Today's Date (e.g. MON, SEP 28)
  const todayDateString = new Date()
    .toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    .toUpperCase();

  // Dynamic Identity Data
  const userName = userProfile?.name || dashboardData?.user?.name || 'User';
  const userDept = userProfile?.department?.name || dashboardData?.department?.name || 'Member';

  // Multi-fallback evaluation for Total Points
  const rawPoints = (dashboardData as any)?.points;
  const cachedLeaderboardUsers = getCache<LeaderboardUserEntry[]>('leaderboard_users');
  const currentUserLeaderboard = cachedLeaderboardUsers?.find((u) => u.isCurrentUser || u.id === userProfile?.id || u.id === dashboardData?.user?.id);

  const totalPoints = Math.round(
    typeof rawPoints === 'number'
      ? rawPoints
      : typeof rawPoints?.total === 'number'
      ? rawPoints.total
      : (userProfile as any)?.points?.total ??
        (userProfile as any)?.points ??
        currentUserLeaderboard?.points ??
        0
  );

  // Metrics Data (Merged from Native HealthKit & Backend API Dashboard)
  const steps = healthData?.steps ?? dashboardData?.activities?.today?.steps ?? 0;
  const distanceKm = healthData?.distanceKm ?? 0;
  const floorsClimbed = healthData?.floorsClimbed ?? dashboardData?.activities?.today?.elevation ?? 0;
  const caloriesBurned = healthData?.caloriesKcal ?? dashboardData?.activities?.today?.calories ?? 0;

  // Goals
  const STEP_GOAL = 10000;
  const DISTANCE_GOAL = 7.0;
  const FLOORS_GOAL = 15;
  const CALORIES_GOAL = 1000;

  const stepPercent = Math.min(Math.round((steps / STEP_GOAL) * 100), 100);
  const distPercent = Math.min(Math.round((distanceKm / DISTANCE_GOAL) * 100), 100);
  const floorPercent = Math.min(Math.round((floorsClimbed / FLOORS_GOAL) * 100), 100);
  const caloriePercent = Math.min(Math.round((caloriesBurned / CALORIES_GOAL) * 100), 100);

  if (loading && !dashboardData && !userProfile) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }]}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color={colors.accentCyan} />
        <Text style={{ color: colors.textSecondary, marginTop: 16, fontSize: 14, fontWeight: '600' }}>
          Fetching Profile & Activity Data...
        </Text>
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
            tintColor={colors.accentCyan}
            colors={[colors.accentCyan, colors.accentGreen]}
            progressBackgroundColor="#05070D"
          />
        }
      >
        {/* Top Header: Identity & Date */}
        <View style={styles.header}>
          <View style={styles.headerLeftColumn}>
            <Text style={styles.headerTitle}>Your Activity</Text>
            <View style={styles.headerDateRow}>
              <Ionicons name="calendar-outline" size={13} color={colors.textSecondary} />
              <Text style={styles.headerDateText}>{todayDateString}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.logoutHeaderButton}
            onPress={() => setLogoutModalVisible(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={15} color="#EF4444" />
            <Text style={styles.logoutHeaderText}>Log Out</Text>
          </TouchableOpacity>
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
            <TouchableOpacity onPress={() => fetchHealthData(true)} disabled={loading}>
              {loading ? (
                <ActivityIndicator size="small" color={colors.accentGreen} />
              ) : (
                <Ionicons name="refresh-outline" size={18} color={colors.textMuted} />
              )}
            </TouchableOpacity>
          </View>

          {/* Smooth Continuous 360-Degree Gradient Activity Ring */}
          <View style={styles.ringWrapper}>
            <View style={styles.gradientRingOuter}>
              {/* Top-Right Quadrant: Neon Light Green -> Cyan */}
              <View style={styles.quadrantTopRight}>
                <LinearGradient
                  colors={['#B4F542', '#22D3EE']}
                  start={{ x: 0.2, y: 0 }}
                  end={{ x: 1, y: 0.8 }}
                  style={StyleSheet.absoluteFill}
                />
              </View>

              {/* Bottom-Right Quadrant: Cyan -> Soft Blue */}
              <View style={styles.quadrantBottomRight}>
                <LinearGradient
                  colors={['#22D3EE', '#818CF8']}
                  start={{ x: 1, y: 0.2 }}
                  end={{ x: 0.2, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
              </View>

              {/* Bottom-Left Quadrant: Soft Blue -> Vibrant Purple */}
              <View style={styles.quadrantBottomLeft}>
                <LinearGradient
                  colors={['#818CF8', '#A855F7']}
                  start={{ x: 0.8, y: 1 }}
                  end={{ x: 0, y: 0.2 }}
                  style={StyleSheet.absoluteFill}
                />
              </View>

              {/* Top-Left Quadrant: Vibrant Purple -> Neon Light Green */}
              <View style={styles.quadrantTopLeft}>
                <LinearGradient
                  colors={['#A855F7', '#B4F542']}
                  start={{ x: 0, y: 0.8 }}
                  end={{ x: 0.8, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
              </View>

              {/* Inner Dark Mask Center */}
              <View style={styles.gradientRingInnerCenter}>
                <Text style={styles.pointsNumber}>{totalPoints}</Text>
                <Text style={styles.pointsLabelText}>Points</Text>
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

        {/* TODAY'S METRICS Section - 2x2 Widget Grid */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>TODAY'S METRICS</Text>
        </View>

        <View style={styles.widgetGrid2x2}>
          {/* 1. Steps Widget */}
          <View style={styles.widgetCard}>
            <View style={styles.widgetTopRow}>
              <View style={[styles.widgetIconBox, { backgroundColor: 'rgba(163, 230, 53, 0.15)', borderColor: 'rgba(163, 230, 53, 0.3)' }]}>
                <Ionicons name="footsteps" size={18} color="#A3E635" />
              </View>
              <View style={[styles.widgetBadge, { backgroundColor: 'rgba(163, 230, 53, 0.15)' }]}>
                <Text style={[styles.widgetBadgeText, { color: '#A3E635' }]}>{stepPercent}%</Text>
              </View>
            </View>

            <Text style={styles.widgetValue}>{steps.toLocaleString()}</Text>
            <Text style={styles.widgetTitle}>Steps</Text>

            <View style={styles.widgetProgressTrack}>
              <View style={[styles.widgetProgressFill, { width: `${stepPercent}%`, backgroundColor: '#A3E635' }]} />
            </View>
            <Text style={styles.widgetSubtext}>{STEP_GOAL.toLocaleString()} target</Text>
          </View>

          {/* 2. Distance Travelled Widget */}
          <View style={styles.widgetCard}>
            <View style={styles.widgetTopRow}>
              <View style={[styles.widgetIconBox, { backgroundColor: 'rgba(34, 211, 238, 0.15)', borderColor: 'rgba(34, 211, 238, 0.3)' }]}>
                <Ionicons name="map-outline" size={18} color="#22D3EE" />
              </View>
              <View style={[styles.widgetBadge, { backgroundColor: 'rgba(34, 211, 238, 0.15)' }]}>
                <Text style={[styles.widgetBadgeText, { color: '#22D3EE' }]}>{distPercent}%</Text>
              </View>
            </View>

            <Text style={styles.widgetValue}>
              {distanceKm} <Text style={styles.widgetUnit}>km</Text>
            </Text>
            <Text style={styles.widgetTitle}>Distance Travelled</Text>

            <View style={styles.widgetProgressTrack}>
              <View style={[styles.widgetProgressFill, { width: `${distPercent}%`, backgroundColor: '#22D3EE' }]} />
            </View>
            <Text style={styles.widgetSubtext}>{DISTANCE_GOAL} km target</Text>
          </View>

          {/* 3. Floor Climbed Widget */}
          <View style={styles.widgetCard}>
            <View style={styles.widgetTopRow}>
              <View style={[styles.widgetIconBox, { backgroundColor: 'rgba(139, 92, 246, 0.15)', borderColor: 'rgba(139, 92, 246, 0.3)' }]}>
                <Ionicons name="trending-up" size={18} color="#8B5CF6" />
              </View>
              <View style={[styles.widgetBadge, { backgroundColor: 'rgba(139, 92, 246, 0.15)' }]}>
                <Text style={[styles.widgetBadgeText, { color: '#A78BFA' }]}>{floorPercent}%</Text>
              </View>
            </View>

            <Text style={styles.widgetValue}>
              {floorsClimbed} <Text style={styles.widgetUnit}>floors</Text>
            </Text>
            <Text style={styles.widgetTitle}>Floor Climbed</Text>

            <View style={styles.widgetProgressTrack}>
              <View style={[styles.widgetProgressFill, { width: `${floorPercent}%`, backgroundColor: '#8B5CF6' }]} />
            </View>
            <Text style={styles.widgetSubtext}>{FLOORS_GOAL} floors target</Text>
          </View>

          {/* 4. Calorie Burned Widget */}
          <View style={styles.widgetCard}>
            <View style={styles.widgetTopRow}>
              <View style={[styles.widgetIconBox, { backgroundColor: 'rgba(244, 63, 94, 0.15)', borderColor: 'rgba(244, 63, 94, 0.3)' }]}>
                <Ionicons name="flame" size={18} color="#F43F5E" />
              </View>
              <View style={[styles.widgetBadge, { backgroundColor: 'rgba(244, 63, 94, 0.15)' }]}>
                <Text style={[styles.widgetBadgeText, { color: '#FB7185' }]}>{caloriePercent}%</Text>
              </View>
            </View>

            <Text style={styles.widgetValue}>
              {Math.round(caloriesBurned)} <Text style={styles.widgetUnit}>kcal</Text>
            </Text>
            <Text style={styles.widgetTitle}>Calorie Burned</Text>

            <View style={styles.widgetProgressTrack}>
              <View style={[styles.widgetProgressFill, { width: `${caloriePercent}%`, backgroundColor: '#F43F5E' }]} />
            </View>
            <Text style={styles.widgetSubtext}>{CALORIES_GOAL} kcal target</Text>
          </View>
        </View>
      </ScrollView>

      {/* Logout Confirmation Modal Window */}
      <Modal
        visible={logoutModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLogoutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalIconBox}>
              <Ionicons name="log-out-outline" size={26} color="#EF4444" />
            </View>
            <Text style={styles.modalTitle}>Log Out</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to log out of your OneLife account?
            </Text>

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setLogoutModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalLogoutButton]}
                onPress={async () => {
                  setLogoutModalVisible(false);
                  await clearSession();
                  if (onSignOut) {
                    onSignOut();
                  }
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.modalLogoutButtonText}>Log Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoutHeaderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 5,
  },
  logoutHeaderText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  topRightLogo: {
    width: 32,
    height: 32,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 7, 13, 0.82)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#0F172A',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  modalIconBox: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  modalButtonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  modalCancelButtonText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  modalLogoutButton: {
    backgroundColor: '#EF4444',
  },
  modalLogoutButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },


  container: {
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    marginTop: 8,
    paddingHorizontal: 20,
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
  headerLeftColumn: {
    flexDirection: 'column',
    gap: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  headerDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  headerDateText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 20,
    marginHorizontal: 20,
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
    borderRadius: 0,
    width: '100%',
    paddingVertical: 24,
    paddingHorizontal: 20,
    margin: 0,
    marginHorizontal: 0,
    alignItems: 'center',
    borderWidth: 0,
    borderColor: 'transparent',
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
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
  gradientRingOuter: {
    width: 160,
    height: 160,
    borderRadius: 80,
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quadrantTopRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 80,
    height: 80,
  },
  quadrantBottomRight: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 80,
    height: 80,
  },
  quadrantBottomLeft: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 80,
    height: 80,
  },
  quadrantTopLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 80,
    height: 80,
  },
  gradientRingInnerCenter: {
    width: 132,
    height: 132,
    borderRadius: 66,
    backgroundColor: '#0B0F19',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  pointsNumber: {
    fontSize: 42,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 46,
    letterSpacing: -1,
  },
  pointsLabelText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 2,
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
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 1.2,
  },
  widgetGrid2x2: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 20,
  },
  widgetCard: {
    width: '48%',
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 4,
  },
  widgetTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  widgetIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  widgetBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  widgetBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  widgetValue: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  widgetUnit: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  widgetTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 10,
  },
  widgetProgressTrack: {
    height: 5,
    backgroundColor: colors.cardSecondary,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  widgetProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  widgetSubtext: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textMuted,
  },
});
