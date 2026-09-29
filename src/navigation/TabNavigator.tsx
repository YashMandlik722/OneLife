import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import ChallengeScreen from '../screens/ChallengeScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import MeScreen from '../screens/MeScreen';

export type TabType = 'Challenge' | 'Leaderboard' | 'Me';

interface TabNavigatorProps {
  onSignOut?: () => void;
}

export default function TabNavigator({ onSignOut }: TabNavigatorProps) {
  const [activeTab, setActiveTab] = useState<TabType>('Challenge');

  return (
    <View style={styles.container}>
      {/* Screen Body: Persistent mounting for instant 0ms tab switching */}
      <View style={styles.screenContainer}>
        <View style={[styles.screenWrapper, activeTab !== 'Challenge' && styles.hiddenScreen]}>
          <ChallengeScreen />
        </View>
        <View style={[styles.screenWrapper, activeTab !== 'Leaderboard' && styles.hiddenScreen]}>
          <LeaderboardScreen />
        </View>
        <View style={[styles.screenWrapper, activeTab !== 'Me' && styles.hiddenScreen]}>
          <MeScreen />
        </View>
      </View>

      {/* Custom Bottom Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('Challenge')}
          activeOpacity={0.7}
        >
          <Ionicons
            name={activeTab === 'Challenge' ? 'trophy' : 'trophy-outline'}
            size={22}
            color={activeTab === 'Challenge' ? colors.tabBarActive : colors.tabBarInactive}
          />
          <Text
            style={[
              styles.tabLabel,
              { color: activeTab === 'Challenge' ? colors.tabBarActive : colors.tabBarInactive },
            ]}
          >
            Challenge
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('Leaderboard')}
          activeOpacity={0.7}
        >
          <Ionicons
            name={activeTab === 'Leaderboard' ? 'podium' : 'podium-outline'}
            size={22}
            color={activeTab === 'Leaderboard' ? colors.tabBarActive : colors.tabBarInactive}
          />
          <Text
            style={[
              styles.tabLabel,
              { color: activeTab === 'Leaderboard' ? colors.tabBarActive : colors.tabBarInactive },
            ]}
          >
            Leaderboard
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('Me')}
          activeOpacity={0.7}
        >
          <Ionicons
            name={activeTab === 'Me' ? 'person' : 'person-outline'}
            size={22}
            color={activeTab === 'Me' ? colors.tabBarActive : colors.tabBarInactive}
          />
          <Text
            style={[
              styles.tabLabel,
              { color: activeTab === 'Me' ? colors.tabBarActive : colors.tabBarInactive },
            ]}
          >
            Me
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screenContainer: {
    flex: 1,
  },
  screenWrapper: {
    flex: 1,
  },
  hiddenScreen: {
    display: 'none',
  },
  tabBar: {
    flexDirection: 'row',
    height: 64,
    backgroundColor: colors.tabBarBackground,
    borderTopWidth: 1,
    borderTopColor: colors.tabBarBorder,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
});
