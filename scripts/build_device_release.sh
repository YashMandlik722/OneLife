#!/usr/bin/env bash
set -e

# Set Xcode developer directory environment variable
export DEVELOPER_DIR="/Applications/Xcode.app/Contents/Developer"
export EXPO_NO_TELEMETRY=1

echo "🚀 Searching for connected iOS iPhone..."
DEVICE_INFO=$(xcrun xctrace list devices | grep -i "iPhone" | grep -v "Simulator" | head -n 1 || true)

if [ -n "$DEVICE_INFO" ]; then
  echo "📱 Found device: $DEVICE_INFO"
else
  echo "⚠️ No connected iPhone detected via USB. Make sure device is unlocked."
fi

echo "⚡ Building standalone Release binary and flashing to connected iPhone..."

# Build and flash in Release mode (standalone mode, no Metro server required)
npx expo run:ios --device --configuration Release
