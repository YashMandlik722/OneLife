#!/usr/bin/env bash
set -e

# Set Xcode developer directory environment variable
export DEVELOPER_DIR="/Applications/Xcode.app/Contents/Developer"
export EXPO_NO_TELEMETRY=1

echo "🚀 Starting iOS build for connected device..."

# Build and run on connected physical iPhone
npx expo run:ios --device
