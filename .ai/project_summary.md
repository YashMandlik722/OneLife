# Project Summary: Olympus (StepCounter POC)

## 📌 What It Is
**Olympus** is a cross-platform mobile application built with React Native and Expo for corporate step tracking, employee health challenges, and team competitions.

## ⚙️ What It Does
- Reads daily physical step count data directly from device native health stores (**Apple HealthKit** on iOS, **Google Health Connect** on Android).
- Syncs step activity to a central backend service in foreground and background.
- Displays personal progress, team goal metrics, department rankings, and AI-generated step challenges.

## 🚀 Key Features
- **OTP Authentication**: Passwordless login via email and 6-digit OTP verification.
- **Cross-Platform Health Integration**: Native SDK adapters for iOS HealthKit and Android Health Connect, with a mock data fallback for development/simulators.
- **Activity Synchronization**: Automated foreground and background sync managers for syncing step metrics to the backend.
- **Challenges & AI Sprints**: Interactive team challenge tracking with dynamic AI-generated step sprints.
- **Leaderboards**: Dual-view leaderboards (Individual employee and Department rankings) powered by Stale-While-Revalidate (SWR) caching.
- **Personal Analytics**: Historical step statistics (Daily, Weekly, Monthly views) and health connection controls.

## 📱 Screens
1. **`LoginScreen`**: Email entry interface to trigger OTP verification.
2. **`VerifyOtpScreen`**: 6-digit passcode input & verification flow.
3. **`ChallengeScreen`**: Active challenge goal progress, team step visualizer, manual sync trigger, and AI challenge generator modal.
4. **`LeaderboardScreen`**: Live leaderboards with toggle tabs for Individual and Department ranks.
5. **`MeScreen`**: Personal profile, daily/weekly/monthly activity trends, health permission status, sync actions, and logout.

## 🧠 Core Architecture & Logic
- **Tech Stack**: React Native (0.86.3), Expo SDK (57), TypeScript, React Navigation (Bottom Tabs).
- **Navigation & Auth**: State-driven root auth router (`login` → `otp` → `authenticated`) rendering custom `TabNavigator`.
- **Health Abstraction Layer (`src/health/`)**: Factory pattern (`getHealthProvider()`) routing calls to platform-specific adapters (`ios.ts`, `android.ts`, or `mock.ts`).
- **Sync Pipeline (`src/services/activitySyncManager.ts`)**: Periodically queries native health providers for date-range step counts and syncs payload to server via `api/activity.ts`.
- **API & Caching (`src/api/`)**: Centralized HTTP fetch client using SWR (Stale-While-Revalidate) caching for responsive UI loading.
