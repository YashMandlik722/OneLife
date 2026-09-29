import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Platform,
  Image,
  ImageBackground,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

import {
  fetchUserLeaderboard,
  fetchDepartmentLeaderboard,
} from '../api/leaderboard';
import { getCache } from '../utils/cache';

import { LeaderboardUserEntry, LeaderboardDepartmentEntry } from '../types/database';

const leaderboardBg = require('../../assets/leaderboard_bg.png');


export default function LeaderboardScreen() {
  const [viewType, setViewType] = useState<'Individual' | 'Department'>('Individual');
  const [expandedDeptId, setExpandedDeptId] = useState<string | number | null>(null);

  // Instant synchronous cache initialization to eliminate 2-3s navigation delay
  const [userEntries, setUserEntries] = useState<LeaderboardUserEntry[]>(() => {
    return getCache<LeaderboardUserEntry[]>('leaderboard_users') || [];
  });
  const [deptEntries, setDeptEntries] = useState<LeaderboardDepartmentEntry[]>(() => {
    return getCache<LeaderboardDepartmentEntry[]>('leaderboard_departments') || [];
  });
  const [loading, setLoading] = useState<boolean>(() => {
    const cachedUsers = getCache<LeaderboardUserEntry[]>('leaderboard_users');
    return !cachedUsers || cachedUsers.length === 0;
  });
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadLeaderboards = useCallback(async (forceRefresh: boolean = false) => {
    try {
      // Fetch both user & department leaderboards concurrently
      const [userRes, deptRes] = await Promise.all([
        fetchUserLeaderboard(undefined, undefined, forceRefresh),
        fetchDepartmentLeaderboard(undefined, forceRefresh),
      ]);

      if (userRes.data && userRes.data.length > 0) {
        setUserEntries(userRes.data);
      }
      if (deptRes.data && deptRes.data.length > 0) {
        setDeptEntries(deptRes.data);
      }
    } catch (err) {
      console.warn('Failed to load leaderboards from API:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadLeaderboards(false);
  }, [loadLeaderboards]);

  const handlePullRefresh = useCallback(() => {
    setRefreshing(true);
    loadLeaderboards(true);
  }, [loadLeaderboards]);

  const individualLeaderboard = userEntries;
  const departmentLeaderboard = deptEntries;

  // Memoized Rankings Calculations for 60fps Rendering
  const rank1 = useMemo(() => individualLeaderboard.find((u) => u.rank === 1), [individualLeaderboard]);
  const rank2 = useMemo(() => individualLeaderboard.find((u) => u.rank === 2), [individualLeaderboard]);
  const rank3 = useMemo(() => individualLeaderboard.find((u) => u.rank === 3), [individualLeaderboard]);
  const currentUser = useMemo(() => individualLeaderboard.find((u) => u.isCurrentUser) || individualLeaderboard[0], [individualLeaderboard]);
  const remainingRankings = useMemo(() => individualLeaderboard.filter((u) => Number(u.rank) >= 4), [individualLeaderboard]);

  const deptRank1 = useMemo(() => departmentLeaderboard.find((d) => d.rank === 1), [departmentLeaderboard]);
  const deptRank2 = useMemo(() => departmentLeaderboard.find((d) => d.rank === 2), [departmentLeaderboard]);
  const deptRank3 = useMemo(() => departmentLeaderboard.find((d) => d.rank === 3), [departmentLeaderboard]);

  const getDeptInitials = useCallback((name: string): string => {
    if (!name) return 'DP';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }, []);

  const renderUserRow = useCallback(({ item: user }: { item: LeaderboardUserEntry }) => {
    const isUser = user.isCurrentUser;
    return (
      <View style={[styles.rankRow, isUser && styles.rankRowHighlight]}>
        <Text style={[styles.rankNumber, isUser && styles.rankNumberUser]}>
          {user.rank}
        </Text>

        <View
          style={[
            styles.rowAvatarCircle,
            { backgroundColor: isUser ? '#A3E635' : '#1F293D' },
          ]}
        >
          <Text style={[styles.rowAvatarText, isUser && styles.rowAvatarTextUser]}>
            {user.initials}
          </Text>
        </View>

        <View style={styles.rowInfoCol}>
          <Text style={styles.rowName}>{user.name}</Text>
          <Text style={styles.rowDept}>
            {user.departmentName}
            {isUser ? <Text style={styles.youHighlight}> · You</Text> : ''}
          </Text>
        </View>

        <View style={styles.rowPointsCol}>
          <Text style={styles.rowPoints}>{user.points.toLocaleString()}</Text>
          {isUser && user.deltaToday ? (
            <View style={styles.rowDeltaRow}>
              <Ionicons name="arrow-up" size={10} color={colors.accentGreen} />
              <Text style={styles.rowDeltaText}>+{user.deltaToday}</Text>
            </View>
          ) : null}
        </View>
      </View>
    );
  }, []);

  const renderDeptRow = useCallback(
    ({ item: dept }: { item: LeaderboardDepartmentEntry }) => {
      const isExpanded = expandedDeptId === dept.id;

      // Filter members belonging to this department sorted by points descending
      const deptMembers = userEntries
        .filter(
          (u) => u.departmentName?.toLowerCase().trim() === dept.name?.toLowerCase().trim()
        )
        .sort((a, b) => b.points - a.points);

      const actualCount = deptMembers.length || dept.membersCount || 0;

      const toggleExpand = () => {
        setExpandedDeptId((prev) => (prev === dept.id ? null : dept.id));
      };

      return (
        <View style={styles.deptRowContainer}>
          <TouchableOpacity
            style={[styles.rankRow, isExpanded && styles.deptRowExpandedHeader]}
            onPress={toggleExpand}
            activeOpacity={0.7}
          >
            <View style={[styles.deptRankBadge, { backgroundColor: dept.color }]}>
              <Text style={styles.deptRankBadgeText}>#{dept.rank}</Text>
            </View>

            <View style={styles.rowInfoCol}>
              <Text style={styles.rowName}>{dept.name}</Text>
              <Text style={styles.rowDept}>{actualCount} active members</Text>
            </View>

            <View style={styles.deptPointsRightRow}>
              <Text style={styles.rowPoints}>{dept.points.toLocaleString()} pts</Text>
              <View style={styles.chevronBox}>
                <Ionicons
                  name={isExpanded ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color={isExpanded ? colors.accentCyan : colors.textMuted}
                />
              </View>
            </View>
          </TouchableOpacity>

          {/* Expandable Member List Dropdown */}
          {isExpanded ? (
            <View style={styles.deptDropdownList}>
              <View style={styles.deptDropdownHeader}>
                <Text style={styles.deptDropdownTitle}>
                  DEPARTMENT MEMBERS ({actualCount})
                </Text>
              </View>

              {deptMembers.map((member, index) => (
                <View key={member.id} style={styles.deptMemberRow}>
                  <Text style={styles.deptMemberRank}>#{index + 1}</Text>
                  
                  <View style={[styles.deptMemberAvatar, { backgroundColor: member.avatarBgColor || '#1F293D' }]}>
                    <Text style={styles.deptMemberAvatarText}>{member.initials}</Text>
                  </View>

                  <View style={styles.deptMemberInfo}>
                    <Text style={styles.deptMemberName}>
                      {member.name}
                      {member.isCurrentUser ? (
                        <Text style={styles.youHighlight}> · You</Text>
                      ) : null}
                    </Text>
                  </View>

                  <Text style={styles.deptMemberPoints}>
                    {member.points.toLocaleString()} pts
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      );
    },
    [expandedDeptId, userEntries]
  );

  const ListHeader = useMemo(() => {
    return (
      <View>
        {/* TOP HERO CONTAINER */}
        <View style={styles.heroBackground}>
          <View style={styles.heroContent}>
            {/* Header Row */}
            <View style={styles.headerRow}>
              <View>
                <Text style={styles.headerTitle}>Leaderboard</Text>
              </View>

              <View style={styles.headerRightActions}>
                <Image
                  source={require('../../assets/OneLifeInAppLogo.png')}
                  style={styles.topRightLogo}
                  resizeMode="contain"
                />
              </View>
            </View>

            {/* Segmented Control */}
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[styles.toggleTab, viewType === 'Individual' && styles.activeToggleTab]}
                onPress={() => setViewType('Individual')}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.toggleText,
                    viewType === 'Individual' && styles.activeToggleText,
                  ]}
                >
                  Individual
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.toggleTab, viewType === 'Department' && styles.activeToggleTab]}
                onPress={() => setViewType('Department')}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.toggleText,
                    viewType === 'Department' && styles.activeToggleText,
                  ]}
                >
                  Department
                </Text>
              </TouchableOpacity>
            </View>

            {/* DEDICATED PODIUM CONTAINER WITH BACKGROUND IMAGE */}
            <ImageBackground
              source={leaderboardBg}
              style={styles.podiumContainerCard}
              imageStyle={styles.podiumContainerImage}
              resizeMode="cover"
            >
              <View style={styles.podiumContainerOverlay}>
                {viewType === 'Individual' ? (
                  /* TOP 3 PODIUM FOR INDIVIDUALS */
                  <View style={styles.podiumRow}>
                    {/* Rank #2 (Left) */}
                    {rank2 ? (
                      <View style={[styles.podiumCol, styles.podiumColSide]}>
                        <View style={styles.avatarWrapper}>
                          <View style={[styles.rankBadge, { backgroundColor: '#94A3B8' }]}>
                            <Text style={styles.rankBadgeText}>2</Text>
                          </View>
                          <View style={[styles.avatarCircle, { backgroundColor: '#8B5CF6' }]}>
                            <Text style={styles.avatarText}>{rank2.initials}</Text>
                          </View>
                        </View>
                        <Text style={styles.podiumName} numberOfLines={1}>
                          {rank2.name}
                        </Text>
                        <View style={[styles.pointsPill, { backgroundColor: 'rgba(139, 92, 246, 0.35)' }]}>
                          <Text style={[styles.pointsPillText, { color: '#C4B5FD' }]}>
                            {rank2.points.toLocaleString()} pts
                          </Text>
                        </View>
                      </View>
                    ) : null}

                    {/* Rank #1 (Center) */}
                    {rank1 ? (
                      <View style={[styles.podiumCol, styles.podiumColCenter]}>
                        <View style={styles.avatarWrapperCenter}>
                          <View style={[styles.rankBadgeCenter, { backgroundColor: '#A3E635' }]}>
                            <Text style={styles.rankBadgeTextCenter}>1</Text>
                          </View>
                          <View style={[styles.avatarCircleCenter, { backgroundColor: '#22D3EE' }]}>
                            <Text style={styles.avatarTextCenter}>{rank1.initials}</Text>
                          </View>
                        </View>
                        <Text style={styles.podiumNameCenter} numberOfLines={1}>
                          {rank1.name}
                        </Text>
                        <View style={[styles.pointsPillCenter, { backgroundColor: 'rgba(34, 211, 238, 0.35)' }]}>
                          <Text style={[styles.pointsPillTextCenter, { color: '#67E8F9' }]}>
                            {rank1.points.toLocaleString()} pts
                          </Text>
                        </View>
                      </View>
                    ) : null}

                    {/* Rank #3 (Right) */}
                    {rank3 ? (
                      <View style={[styles.podiumCol, styles.podiumColSide]}>
                        <View style={styles.avatarWrapper}>
                          <View style={[styles.rankBadge, { backgroundColor: '#F97316' }]}>
                            <Text style={[styles.rankBadgeText, { color: '#FFFFFF' }]}>3</Text>
                          </View>
                          <View style={[styles.avatarCircle, { backgroundColor: '#F43F5E' }]}>
                            <Text style={styles.avatarText}>{rank3.initials}</Text>
                          </View>
                        </View>
                        <Text style={styles.podiumName} numberOfLines={1}>
                          {rank3.name}
                        </Text>
                        <View style={[styles.pointsPill, { backgroundColor: 'rgba(244, 63, 94, 0.35)' }]}>
                          <Text style={[styles.pointsPillText, { color: '#FDA4AF' }]}>
                            {rank3.points.toLocaleString()} pts
                          </Text>
                        </View>
                      </View>
                    ) : null}
                  </View>
                ) : (
                  /* TOP 3 PODIUM FOR DEPARTMENTS */
                  <View style={styles.podiumRow}>
                    {/* Department Rank #2 (Left) */}
                    {deptRank2 ? (
                      <View style={[styles.podiumCol, styles.podiumColSide]}>
                        <View style={styles.avatarWrapper}>
                          <View style={[styles.rankBadge, { backgroundColor: '#94A3B8' }]}>
                            <Text style={styles.rankBadgeText}>2</Text>
                          </View>
                          <View style={[styles.avatarCircle, { backgroundColor: deptRank2.color || '#8B5CF6' }]}>
                            <Text style={styles.avatarText}>{getDeptInitials(deptRank2.name)}</Text>
                          </View>
                        </View>
                        <Text style={styles.podiumName} numberOfLines={1}>
                          {deptRank2.name}
                        </Text>
                        <View style={[styles.pointsPill, { backgroundColor: 'rgba(139, 92, 246, 0.35)' }]}>
                          <Text style={[styles.pointsPillText, { color: '#C4B5FD' }]}>
                            {deptRank2.points.toLocaleString()} pts
                          </Text>
                        </View>
                      </View>
                    ) : null}

                    {/* Department Rank #1 (Center) */}
                    {deptRank1 ? (
                      <View style={[styles.podiumCol, styles.podiumColCenter]}>
                        <View style={styles.avatarWrapperCenter}>
                          <View style={[styles.rankBadgeCenter, { backgroundColor: '#A3E635' }]}>
                            <Text style={styles.rankBadgeTextCenter}>1</Text>
                          </View>
                          <View style={[styles.avatarCircleCenter, { backgroundColor: deptRank1.color || '#22D3EE' }]}>
                            <Text style={styles.avatarTextCenter}>{getDeptInitials(deptRank1.name)}</Text>
                          </View>
                        </View>
                        <Text style={styles.podiumNameCenter} numberOfLines={1}>
                          {deptRank1.name}
                        </Text>
                        <View style={[styles.pointsPillCenter, { backgroundColor: 'rgba(34, 211, 238, 0.35)' }]}>
                          <Text style={[styles.pointsPillTextCenter, { color: '#67E8F9' }]}>
                            {deptRank1.points.toLocaleString()} pts
                          </Text>
                        </View>
                      </View>
                    ) : null}

                    {/* Department Rank #3 (Right) */}
                    {deptRank3 ? (
                      <View style={[styles.podiumCol, styles.podiumColSide]}>
                        <View style={styles.avatarWrapper}>
                          <View style={[styles.rankBadge, { backgroundColor: '#F97316' }]}>
                            <Text style={[styles.rankBadgeText, { color: '#FFFFFF' }]}>3</Text>
                          </View>
                          <View style={[styles.avatarCircle, { backgroundColor: deptRank3.color || '#F43F5E' }]}>
                            <Text style={styles.avatarText}>{getDeptInitials(deptRank3.name)}</Text>
                          </View>
                        </View>
                        <Text style={styles.podiumName} numberOfLines={1}>
                          {deptRank3.name}
                        </Text>
                        <View style={[styles.pointsPill, { backgroundColor: 'rgba(244, 63, 94, 0.35)' }]}>
                          <Text style={[styles.pointsPillText, { color: '#FDA4AF' }]}>
                            {deptRank3.points.toLocaleString()} pts
                          </Text>
                        </View>
                      </View>
                    ) : null}
                  </View>
                )}
              </View>
            </ImageBackground>
          </View>
        </View>

        {/* YOUR POSITION BANNER WITH CYAN TOP DIVIDER */}
        {viewType === 'Individual' && currentUser ? (
          <View style={styles.yourPositionCard}>
            <Text style={styles.posTag}>YOUR POSITION</Text>
            <View style={styles.posBodyRow}>
              <View style={styles.posLeftCol}>
                <View style={styles.posRankRow}>
                  <Text style={styles.posRankText}>#{currentUser.rank}</Text>
                  {currentUser.deltaToday ? (
                    <View style={styles.posDeltaRow}>
                      <Ionicons name="arrow-up" size={14} color={colors.accentGreen} />
                      <Text style={styles.posDeltaText}>{currentUser.deltaToday} today</Text>
                    </View>
                  ) : null}
                </View>
                {currentUser.departmentName ? (
                  <Text style={styles.posDeptText}>{currentUser.departmentName}</Text>
                ) : null}
              </View>

              <View style={styles.posRight}>
                <Text style={styles.posPointsText}>{currentUser.points.toLocaleString()} pts</Text>
              </View>
            </View>
          </View>
        ) : null}

        {/* BLUE ACCENT DIVIDER LINE FOR DEPARTMENT VIEW */}
        {viewType === 'Department' && (
          <View style={styles.blueDividerLine} />
        )}

        {/* SECTION HEADER TITLE */}
        <View style={[styles.rankingsHeaderRowContainer, viewType === 'Department' && styles.deptRankingsHeaderRowContainer]}>
          <View style={styles.rankingsHeaderRow}>
            <Text style={styles.rankingsTitle}>
              {viewType === 'Individual' ? 'ALL RANKINGS' : 'DEPARTMENT OVERVIEW'}
            </Text>
          </View>
        </View>
      </View>
    );
  }, [viewType, rank1, rank2, rank3, deptRank1, deptRank2, deptRank3, currentUser, getDeptInitials]);

  if (loading && userEntries.length === 0 && deptEntries.length === 0) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }]}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color={colors.accentCyan} />
        <Text style={{ color: colors.textSecondary, marginTop: 16, fontSize: 14, fontWeight: '600' }}>
          Loading Live Leaderboard...
        </Text>
      </SafeAreaView>
    );
  }


  return (

    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="light" />
      <View style={styles.container}>
        <FlatList
          data={viewType === 'Individual' ? (remainingRankings as any[]) : (departmentLeaderboard as any[])}
          keyExtractor={(item) => String(item.id)}
          renderItem={viewType === 'Individual' ? (renderUserRow as any) : (renderDeptRow as any)}
          ListHeaderComponent={ListHeader}
          initialNumToRender={8}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={Platform.OS === 'android'}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          style={{ flex: 1 }}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handlePullRefresh}
              tintColor="#22D3EE"
              colors={['#22D3EE', '#A3E635']}
              progressBackgroundColor="#090D15"
            />
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#05070D',
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  topRightLogo: {
    width: 32,
    height: 32,
  },


  container: {
    flex: 1,
    backgroundColor: '#05070D',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroBackground: {
    width: '100%',
    paddingTop: Platform.OS === 'ios' ? 8 : 12,
    paddingBottom: 0,
    paddingHorizontal: 0,
    position: 'relative',
    overflow: 'hidden',
  },
  heroBackgroundImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  heroGradientOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 70,
    zIndex: 1,
  },
  heroContent: {
    zIndex: 2,
    width: '100%',
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  headerTag: {
    fontSize: 11,
    fontWeight: '800',
    color: '#06B6D4',
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  infoButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(17, 22, 34, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(17, 22, 34, 0.85)',
    borderRadius: 24,
    padding: 4,
    marginBottom: 12,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  toggleTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 20,
  },
  activeToggleTab: {
    backgroundColor: '#FFFFFF',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  activeToggleText: {
    color: '#000000',
    fontWeight: '700',
  },
  podiumContainerCard: {
    width: '100%',
    borderRadius: 0,
    overflow: 'hidden',
    borderWidth: 0,
    marginTop: 0,
    marginBottom: 0,
    backgroundColor: 'transparent',
  },
  podiumContainerImage: {
    width: '100%',
    borderRadius: 0,
    opacity: 1,
    resizeMode: 'cover',
  },
  podiumContainerOverlay: {
    width: '100%',
    backgroundColor: 'transparent',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  podiumRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingTop: 6,
    paddingBottom: 4,
  },
  podiumCol: {
    alignItems: 'center',
    flex: 1,
  },
  podiumColSide: {
    marginBottom: 0,
  },
  podiumColCenter: {
    marginBottom: 24,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 8,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  rankBadge: {
    position: 'absolute',
    top: -6,
    left: '50%',
    marginLeft: -10,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
  },
  rankBadgeText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#000000',
  },
  avatarWrapperCenter: {
    position: 'relative',
    marginBottom: 8,
  },
  avatarCircleCenter: {
    width: 86,
    height: 86,
    borderRadius: 43,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#22D3EE',
    shadowColor: '#06B6D4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 16,
  },
  avatarTextCenter: {
    fontSize: 28,
    fontWeight: '900',
    color: '#000000',
  },
  rankBadgeCenter: {
    position: 'absolute',
    top: -8,
    left: '50%',
    marginLeft: -12,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
  },
  rankBadgeTextCenter: {
    fontSize: 13,
    fontWeight: '900',
    color: '#000000',
  },
  podiumName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  podiumNameCenter: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  pointsPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pointsPillText: {
    fontSize: 11,
    fontWeight: '800',
  },
  pointsPillCenter: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pointsPillTextCenter: {
    fontSize: 12,
    fontWeight: '900',
  },
  yourPositionCard: {
    backgroundColor: '#090E17',
    borderTopWidth: 2,
    borderTopColor: '#0284C7',
    borderBottomWidth: 1,
    borderBottomColor: '#161F2E',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginTop: 0,
    marginBottom: 12,
  },
  posTag: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.accentGreen,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  posBodyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  posLeftCol: {
    flexDirection: 'column',
  },
  posRankRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  posDeptText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.accentCyan,
    marginTop: 2,
  },
  posRankText: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  posDeltaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  posDeltaText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.accentGreen,
  },
  posRight: {
    alignItems: 'flex-end',
  },
  posPointsText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  posGapText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  blueDividerLine: {
    height: 2,
    backgroundColor: '#0284C7',
    width: '100%',
    marginTop: 0,
    marginBottom: 16,
  },
  rankingsHeaderRowContainer: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  deptRankingsHeaderRowContainer: {
    paddingHorizontal: 20,
    marginTop: 4,
    marginBottom: 8,
  },
  rankingsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  rankingsTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#6B7280',
    letterSpacing: 1.0,
  },
  liveTag: {
    fontSize: 12,
    color: '#6B7280',
  },
  rankingsList: {
    gap: 8,
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#090D15',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#161F2E',
  },
  rankRowHighlight: {
    backgroundColor: '#0A1713',
    borderColor: colors.accentGreen,
  },
  rankNumber: {
    fontSize: 15,
    fontWeight: '700',
    color: '#6B7280',
    width: 28,
  },
  rankNumberUser: {
    color: colors.accentGreen,
    fontWeight: '900',
  },
  rowAvatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rowAvatarText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#9CA3AF',
  },
  rowAvatarTextUser: {
    color: '#000000',
    fontWeight: '900',
  },
  rowInfoCol: {
    flex: 1,
  },
  rowName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  rowDept: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  youHighlight: {
    color: colors.accentGreen,
    fontWeight: '700',
  },
  rowPointsCol: {
    alignItems: 'flex-end',
  },
  rowPoints: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  rowDeltaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 2,
  },
  rowDeltaText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.accentGreen,
  },
  deptSection: {
    gap: 10,
  },
  deptRankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  deptRankBadgeText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#000000',
  },
  deptRowContainer: {
    backgroundColor: '#090D15',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#161F2E',
    overflow: 'hidden',
    marginBottom: 4,
  },
  deptRowExpandedHeader: {
    backgroundColor: 'rgba(34, 211, 238, 0.08)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(34, 211, 238, 0.2)',
  },
  deptPointsRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chevronBox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deptDropdownList: {
    backgroundColor: '#060A11',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  deptDropdownHeader: {
    marginBottom: 8,
  },
  deptDropdownTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.accentCyan,
    letterSpacing: 1,
  },
  deptMemberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  deptMemberRank: {
    width: 28,
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
  },
  deptMemberAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  deptMemberAvatarText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  deptMemberInfo: {
    flex: 1,
  },
  deptMemberName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  deptMemberPoints: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.accentGreen,
  },
});
