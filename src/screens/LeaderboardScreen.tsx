import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

interface IndividualUser {
  id: string;
  rank: number;
  name: string;
  department: string;
  points: number;
  avatarColor: string;
  isCurrentUser?: boolean;
  deltaRank?: string;
}

interface DepartmentGroup {
  id: string;
  rank: number;
  name: string;
  membersCount: number;
  points: number;
  color: string;
}

const TOP_THREE_INDIVIDUALS: IndividualUser[] = [
  {
    id: '1',
    rank: 1,
    name: 'Nina Patel',
    department: 'DESIGN',
    points: 1284,
    avatarColor: '#F59E0B',
  },
  {
    id: '2',
    rank: 2,
    name: 'Jon Okafor',
    department: 'ENG',
    points: 1150,
    avatarColor: '#94A3B8',
  },
  {
    id: '3',
    rank: 3,
    name: 'Elena Cruz',
    department: 'MARKETING',
    points: 1040,
    avatarColor: '#B45309',
  },
];

const REMAINING_INDIVIDUALS: IndividualUser[] = [
  { id: '4', rank: 4, name: 'Liam Vance', department: 'ENG', points: 995, avatarColor: '#3B82F6' },
  { id: '5', rank: 5, name: 'Sophia Lin', department: 'PRODUCT', points: 972, avatarColor: '#EC4899' },
  { id: '6', rank: 6, name: 'Marcus Aurel', department: 'FINANCE', points: 950, avatarColor: '#10B981' },
  { id: '7', rank: 7, name: 'Chloe Dubois', department: 'DESIGN', points: 935, avatarColor: '#8B5CF6' },
  {
    id: '8',
    rank: 8,
    name: 'Maya Jensen',
    department: 'PRODUCT',
    points: 928,
    avatarColor: '#10B981',
    isCurrentUser: true,
    deltaRank: '+3 today',
  },
  { id: '9', rank: 9, name: 'Kofi Mensah', department: 'SALES', points: 910, avatarColor: '#F97316' },
  { id: '10', rank: 10, name: 'Tariq Al-Mansoor', department: 'ENG', points: 890, avatarColor: '#6366F1' },
  { id: '11', rank: 11, name: 'Zara Torres', department: 'PRODUCT', points: 875, avatarColor: '#14B8A6' },
  { id: '12', rank: 12, name: 'Ben Jackson', department: 'HR', points: 860, avatarColor: '#A855F7' },
];

const DEPARTMENT_RANKINGS: DepartmentGroup[] = [
  { id: 'd1', rank: 1, name: 'Design Dept', membersCount: 8, points: 4820, color: '#F59E0B' },
  { id: 'd2', rank: 2, name: 'Product Dept', membersCount: 12, points: 4510, color: '#10B981' },
  { id: 'd3', rank: 3, name: 'Engineering Dept', membersCount: 15, points: 4290, color: '#3B82F6' },
  { id: 'd4', rank: 4, name: 'Marketing Dept', membersCount: 6, points: 3950, color: '#EC4899' },
  { id: 'd5', rank: 5, name: 'Finance Dept', membersCount: 5, points: 3620, color: '#8B5CF6' },
];

export default function LeaderboardScreen() {
  const [viewType, setViewType] = useState<'Individual' | 'Department'>('Individual');

  const currentUser = REMAINING_INDIVIDUALS.find((user) => user.isCurrentUser);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.outerContainer}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerSubtitle}>LEADERBOARD</Text>
            <Text style={styles.headerTitle}>Sprint Rankings</Text>
          </View>

          {/* Toggle Switcher: Individual vs Department */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[styles.toggleTab, viewType === 'Individual' && styles.activeToggleTab]}
              onPress={() => setViewType('Individual')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.toggleTabText,
                  viewType === 'Individual' && styles.activeToggleTabText,
                ]}
              >
                Individual
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.toggleTab, viewType === 'Department' && styles.activeToggleTab]}
              onPress={() => setViewType('Department')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.toggleTabText,
                  viewType === 'Department' && styles.activeToggleTabText,
                ]}
              >
                Department
              </Text>
            </TouchableOpacity>
          </View>

          {viewType === 'Individual' ? (
            <>
              {/* TOP 3 PODIUM VIEW */}
              <View style={styles.podiumSection}>
                {/* #2 Rank (Left) */}
                <View style={styles.podiumColumn}>
                  <View style={styles.avatarContainer}>
                    <View style={[styles.podiumAvatar, { borderColor: '#94A3B8' }]}>
                      <Text style={styles.podiumAvatarText}>J</Text>
                    </View>
                    <View style={[styles.rankBadgePill, { backgroundColor: '#94A3B8' }]}>
                      <Text style={styles.rankBadgeText}>#2</Text>
                    </View>
                  </View>
                  <Text style={styles.podiumName} numberOfLines={1}>
                    Jon O.
                  </Text>
                  <Text style={styles.podiumDept}>ENG</Text>
                  <Text style={styles.podiumPoints}>1,150 pts</Text>
                </View>

                {/* #1 Rank (Center, Elevated) */}
                <View style={[styles.podiumColumn, styles.podiumCenterColumn]}>
                  <View style={styles.crownContainer}>
                    <Ionicons name="trophy" size={22} color={colors.accentGold} />
                  </View>
                  <View style={styles.avatarContainer}>
                    <View
                      style={[
                        styles.podiumAvatar,
                        styles.podiumAvatarFirst,
                        { borderColor: colors.accentGold },
                      ]}
                    >
                      <Text style={styles.podiumAvatarText}>N</Text>
                    </View>
                    <View style={[styles.rankBadgePill, { backgroundColor: colors.accentGold }]}>
                      <Text style={styles.rankBadgeText}>#1</Text>
                    </View>
                  </View>
                  <Text style={styles.podiumNameFirst} numberOfLines={1}>
                    Nina Patel
                  </Text>
                  <Text style={styles.podiumDept}>DESIGN</Text>
                  <Text style={styles.podiumPointsFirst}>1,284 pts</Text>
                </View>

                {/* #3 Rank (Right) */}
                <View style={styles.podiumColumn}>
                  <View style={styles.avatarContainer}>
                    <View style={[styles.podiumAvatar, { borderColor: '#B45309' }]}>
                      <Text style={styles.podiumAvatarText}>E</Text>
                    </View>
                    <View style={[styles.rankBadgePill, { backgroundColor: '#B45309' }]}>
                      <Text style={styles.rankBadgeText}>#3</Text>
                    </View>
                  </View>
                  <Text style={styles.podiumName} numberOfLines={1}>
                    Elena C.
                  </Text>
                  <Text style={styles.podiumDept}>MKTG</Text>
                  <Text style={styles.podiumPoints}>1,040 pts</Text>
                </View>
              </View>

              {/* Scrollable Rank List (Ranks #4 and onwards) */}
              <View style={styles.listSection}>
                <Text style={styles.listSectionTitle}>REMAINING PARTICIPANTS</Text>
                {REMAINING_INDIVIDUALS.map((user) => {
                  const isUser = user.isCurrentUser;
                  return (
                    <View
                      key={user.id}
                      style={[styles.userRowCard, isUser && styles.userRowCardHighlight]}
                    >
                      <Text style={styles.rowRankText}>#{user.rank}</Text>
                      <View style={[styles.rowAvatar, { backgroundColor: user.avatarColor }]}>
                        <Text style={styles.rowAvatarText}>{user.name[0]}</Text>
                      </View>
                      <View style={styles.rowInfo}>
                        <View style={styles.rowNameRow}>
                          <Text style={styles.rowName}>{user.name}</Text>
                          {isUser ? <Text style={styles.youTag}>YOU</Text> : null}
                        </View>
                        <Text style={styles.rowDept}>{user.department}</Text>
                      </View>
                      <Text style={styles.rowPoints}>{user.points.toLocaleString()} pts</Text>
                    </View>
                  );
                })}
              </View>
            </>
          ) : (
            /* DEPARTMENT RANKINGS VIEW */
            <View style={styles.listSection}>
              <Text style={styles.listSectionTitle}>DEPARTMENT OVERVIEW</Text>
              {DEPARTMENT_RANKINGS.map((dept) => (
                <View key={dept.id} style={styles.userRowCard}>
                  <View style={[styles.deptRankBadge, { backgroundColor: dept.color }]}>
                    <Text style={styles.deptRankText}>#{dept.rank}</Text>
                  </View>
                  <View style={styles.rowInfo}>
                    <Text style={styles.rowName}>{dept.name}</Text>
                    <Text style={styles.rowDept}>{dept.membersCount} active members</Text>
                  </View>
                  <Text style={styles.rowPoints}>{dept.points.toLocaleString()} pts</Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        {/* STICKY BOTTOM USER POSITION CARD */}
        {viewType === 'Individual' && currentUser ? (
          <View style={styles.stickyUserCardContainer}>
            <View style={styles.stickyUserCard}>
              <View style={styles.stickyLeft}>
                <View style={styles.stickyRankBadge}>
                  <Text style={styles.stickyRankText}>#{currentUser.rank}</Text>
                </View>
                <View style={[styles.rowAvatar, { backgroundColor: colors.accentGreen }]}>
                  <Text style={styles.rowAvatarText}>M</Text>
                </View>
                <View>
                  <Text style={styles.stickyUserName}>{currentUser.name}</Text>
                  <Text style={styles.stickyUserDept}>{currentUser.department}</Text>
                </View>
              </View>

              <View style={styles.stickyRight}>
                <Text style={styles.stickyPoints}>{currentUser.points.toLocaleString()} pts</Text>
                {currentUser.deltaRank ? (
                  <View style={styles.deltaPill}>
                    <Ionicons name="arrow-up" size={12} color={colors.accentGreen} />
                    <Text style={styles.deltaPillText}>{currentUser.deltaRank}</Text>
                  </View>
                ) : null}
              </View>
            </View>
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  outerContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 110,
  },
  header: {
    marginBottom: 16,
    marginTop: 8,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.accentGold,
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 24,
  },
  toggleTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeToggleTab: {
    backgroundColor: colors.cardSecondary,
    borderWidth: 1,
    borderColor: colors.cardBorderSubtle,
  },
  toggleTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
  },
  activeToggleTabText: {
    color: colors.textPrimary,
  },
  podiumSection: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 24,
    gap: 12,
  },
  podiumColumn: {
    flex: 1,
    alignItems: 'center',
  },
  podiumCenterColumn: {
    marginBottom: 12,
  },
  crownContainer: {
    marginBottom: 4,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  podiumAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.cardSecondary,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  podiumAvatarFirst: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3.5,
  },
  podiumAvatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  rankBadgePill: {
    position: 'absolute',
    bottom: -8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  rankBadgeText: {
    color: colors.textDark,
    fontSize: 11,
    fontWeight: '800',
  },
  podiumName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 4,
  },
  podiumNameFirst: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 4,
  },
  podiumDept: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textMuted,
    marginTop: 2,
  },
  podiumPoints: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.accentGreen,
    marginTop: 4,
  },
  podiumPointsFirst: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.accentGold,
    marginTop: 4,
  },
  listSection: {
    gap: 10,
  },
  listSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  userRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  userRowCardHighlight: {
    borderColor: colors.accentGreen,
    backgroundColor: colors.cardSecondary,
  },
  rowRankText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textMuted,
    width: 28,
  },
  deptRankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  deptRankText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textDark,
  },
  rowAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rowAvatarText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  rowInfo: {
    flex: 1,
  },
  rowNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rowName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  youTag: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.textDark,
    backgroundColor: colors.accentGreen,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  rowDept: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  rowPoints: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.accentGreen,
  },
  stickyUserCardContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: 'rgba(11, 15, 25, 0.92)',
  },
  stickyUserCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.cardSecondary,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1.5,
    borderColor: colors.accentGreen,
  },
  stickyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stickyRankBadge: {
    width: 28,
    marginRight: 4,
  },
  stickyRankText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.accentGreen,
  },
  stickyUserName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  stickyUserDept: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
  stickyRight: {
    alignItems: 'flex-end',
  },
  stickyPoints: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.accentGreen,
  },
  deltaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  deltaPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.accentGreen,
  },
});
