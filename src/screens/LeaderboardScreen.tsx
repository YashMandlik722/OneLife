import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ImageBackground,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import {
  getIndividualLeaderboardFromDB,
  getDepartmentLeaderboardFromDB,
} from '../data/mockDatabase';

const leaderboardBg = require('../../assets/leaderboard_bg.png');

export default function LeaderboardScreen() {
  const [viewType, setViewType] = useState<'Individual' | 'Department'>('Individual');

  const individualLeaderboard = getIndividualLeaderboardFromDB();
  const departmentLeaderboard = getDepartmentLeaderboardFromDB();

  // Top 3 Podium Users
  const rank1 = individualLeaderboard.find((u) => u.rank === 1);
  const rank2 = individualLeaderboard.find((u) => u.rank === 2);
  const rank3 = individualLeaderboard.find((u) => u.rank === 3);

  // User position (#8)
  const currentUser = individualLeaderboard.find((u) => u.isCurrentUser);

  // Remaining rankings (#4 onwards)
  const remainingRankings = individualLeaderboard.filter((u) => u.rank >= 4);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Row */}
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.headerTag}>COMPANY-WIDE · LIVE</Text>
              <Text style={styles.headerTitle}>Leaderboard</Text>
            </View>
            <TouchableOpacity style={styles.infoButton} activeOpacity={0.7}>
              <Ionicons name="information-circle-outline" size={22} color="#9CA3AF" />
            </TouchableOpacity>
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

          {viewType === 'Individual' ? (
            <>
              {/* TOP 3 PODIUM HERO BANNER WITH BACKGROUND IMAGE */}
              <View style={styles.heroCardContainer}>
                <ImageBackground
                  source={leaderboardBg}
                  style={styles.heroBgImage}
                  imageStyle={styles.heroBgImageStyle}
                  resizeMode="cover"
                >
                  {/* Subtle dark gradient overlays */}
                  <View style={styles.heroOverlayTop} />
                  <View style={styles.heroOverlayBottom} />

                  <View style={styles.podiumRow}>
                    {/* Rank #2 (Left - Jon Okafor) */}
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

                    {/* Rank #1 (Center - Nina Patel) */}
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

                    {/* Rank #3 (Right - Elena Cruz) */}
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
                </ImageBackground>
              </View>

              {/* YOUR POSITION BANNER */}
              {currentUser ? (
                <View style={styles.yourPositionCard}>
                  <Text style={styles.posTag}>YOUR POSITION</Text>
                  <View style={styles.posBodyRow}>
                    <View style={styles.posLeft}>
                      <Text style={styles.posRankText}>#{currentUser.rank}</Text>
                      <View style={styles.posDeltaRow}>
                        <Ionicons name="arrow-up" size={14} color={colors.accentGreen} />
                        <Text style={styles.posDeltaText}>{currentUser.deltaToday} today</Text>
                      </View>
                    </View>

                    <View style={styles.posRight}>
                      <Text style={styles.posPointsText}>{currentUser.points.toLocaleString()} pts</Text>
                      <Text style={styles.posGapText}>
                        {currentUser.pointsBehindPrev} pts behind #{currentUser.rank - 1}
                      </Text>
                    </View>
                  </View>
                </View>
              ) : null}

              {/* ALL RANKINGS SECTION */}
              <View style={styles.rankingsHeaderRow}>
                <Text style={styles.rankingsTitle}>ALL RANKINGS</Text>
                <Text style={styles.liveTag}>Live</Text>
              </View>

              <View style={styles.rankingsList}>
                {remainingRankings.map((user) => {
                  const isUser = user.isCurrentUser;
                  return (
                    <View
                      key={user.id}
                      style={[styles.rankRow, isUser && styles.rankRowHighlight]}
                    >
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
                })}
              </View>
            </>
          ) : (
            /* DEPARTMENT RANKINGS VIEW */
            <View style={styles.deptSection}>
              <View style={styles.rankingsHeaderRow}>
                <Text style={styles.rankingsTitle}>DEPARTMENT OVERVIEW</Text>
                <Text style={styles.liveTag}>Live</Text>
              </View>
              {departmentLeaderboard.map((dept) => (
                <View key={dept.id} style={styles.rankRow}>
                  <View style={[styles.deptRankBadge, { backgroundColor: dept.color }]}>
                    <Text style={styles.deptRankBadgeText}>#{dept.rank}</Text>
                  </View>
                  <View style={styles.rowInfoCol}>
                    <Text style={styles.rowName}>{dept.name}</Text>
                    <Text style={styles.rowDept}>{dept.membersCount} active members</Text>
                  </View>
                  <Text style={styles.rowPoints}>{dept.points.toLocaleString()} pts</Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  infoButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#141A26',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#232D3F',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#111622',
    borderRadius: 24,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1C2536',
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
  heroCardContainer: {
    height: 310,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  heroBgImage: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 20,
    paddingHorizontal: 12,
  },
  heroBgImageStyle: {
    borderRadius: 24,
  },
  heroOverlayTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  heroOverlayBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
    backgroundColor: 'rgba(5,10,18,0.5)',
  },
  podiumRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    zIndex: 2,
  },
  podiumCol: {
    alignItems: 'center',
    flex: 1,
  },
  podiumColSide: {
    marginBottom: 0,
  },
  podiumColCenter: {
    marginBottom: 20,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 8,
  },
  avatarCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  avatarText: {
    fontSize: 20,
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
    width: 82,
    height: 82,
    borderRadius: 41,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#22D3EE',
    shadowColor: '#06B6D4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 14,
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
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
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
    backgroundColor: '#0C101A',
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: '#1E293B',
    marginBottom: 24,
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
  posLeft: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  posRankText: {
    fontSize: 36,
    fontWeight: '900',
    color: colors.textPrimary,
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
    color: colors.textPrimary,
  },
  posGapText: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
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
    color: colors.textMuted,
    letterSpacing: 1.0,
  },
  liveTag: {
    fontSize: 12,
    color: colors.textMuted,
  },
  rankingsList: {
    gap: 8,
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0B0F18',
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
    color: colors.textMuted,
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
    color: colors.textSecondary,
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
    color: colors.textPrimary,
  },
  rowDept: {
    fontSize: 12,
    color: colors.textMuted,
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
    color: colors.textPrimary,
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
});
