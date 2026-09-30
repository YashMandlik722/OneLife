#!/usr/bin/env bash
set -e

# Set Xcode developer directory environment variable
export DEVELOPER_DIR="/Applications/Xcode.app/Contents/Developer"
export EXPO_NO_TELEMETRY=1

echo "🚀 Searching for connected physical iOS device (iPhone/iPad)..."

# Find connected physical iOS device UDID
DEVICE_ID=$(xcrun xctrace list devices 2>/dev/null | grep -v "Mac" | grep -v "Simulator" | grep -v "Offline" | grep -E "\([0-9A-Fa-f-]+\)" | head -n 1 | sed -E 's/.*\(([0-9A-Fa-f-]+)\)/\1/' || true)

if [ -n "$DEVICE_ID" ]; then
  echo "📱 Found connected device UDID: $DEVICE_ID"
  npx expo run:ios --device "$DEVICE_ID" --configuration Release
else
  echo "📱 No pre-filtered device ID found. Running Expo device build..."
  npx expo run:ios --device --configuration Release
fi
