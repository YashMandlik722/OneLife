#!/usr/bin/env bash
set -e

export JAVA_HOME="/opt/homebrew/opt/openjdk@17"
export PATH="/opt/homebrew/opt/openjdk@17/bin:/Users/csuite/Library/Android/sdk/platform-tools:$PATH"
export EXPO_NO_TELEMETRY=1

echo "🚀 Searching for connected Android device..."
DEVICE_INFO=$(adb devices | grep -v "List of devices" | grep "device" | head -n 1 || true)

if [ -n "$DEVICE_INFO" ]; then
  echo "📱 Found Android device: $DEVICE_INFO"
else
  echo "⚠️ No connected Android device detected via ADB. Make sure USB debugging is enabled."
fi

echo "⚡ Building standalone Release APK and flashing to connected Android phone..."

npx expo run:android --variant release
