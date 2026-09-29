#!/usr/bin/env bash

# Open Xcode project
echo "🚀 Opening olympuspoc in Xcode..."
open ios/olympuspoc.xcodeproj

echo "
======================================================
📱 XCODE SWIFT PACKAGE MANAGER (SPM) SETUP STEPS
======================================================

1. ADD SWIFT PACKAGES:
   - In Xcode, go to File -> Add Package Dependencies...
   - Enter your Swift Package URL (e.g., https://github.com/...)
   - Click 'Add Package' and attach it to target 'olympuspoc'.

2. CONFIGURE SIGNING & HEALTHKIT:
   - Select 'olympuspoc' project in the left sidebar.
   - Click the 'Signing & Capabilities' tab.
   - Select your Development Team.
   - Click '+ Capability' and add 'HealthKit' if not already present.

3. RUN ON YOUR CONNECTED IPHONE:
   - In the top toolbar, set the build destination to your connected iPhone.
   - Press ⌘R (or click the Play button) to build and run!
======================================================
"
