import React, { useEffect, useRef } from "react";
import { StyleSheet, View, Animated, Easing, StyleProp, ViewStyle, DimensionValue } from "react-native";
import Svg, { Defs, LinearGradient, Stop, Circle } from "react-native-svg";

export type AIProcessingAnimationProps = {
  width?: DimensionValue;
  height?: DimensionValue;
  style?: StyleProp<ViewStyle>;
};

// 24 Concentric Particle Ring Layers matching original geometry
const TOTAL_RINGS = 24;
const RINGS = Array.from({ length: TOTAL_RINGS }, (_, i) => {
  const r = 16 + i * 5.75;
  const opacity = 0.1 + (i / TOTAL_RINGS) * 0.86;
  const dashArray = `1.2, ${6 + (i % 3) * 2.5}`;
  const strokeWidth = 1.2 + (i / TOTAL_RINGS) * 0.4;
  const bandIndex = i % 6;
  return { id: i, r, opacity, dashArray, strokeWidth, bandIndex };
});

// 6 Alternating Counter-Rotating Band Configurations
const BAND_CONFIGS = [
  { duration: 8000, clockwise: true },
  { duration: 6200, clockwise: false },
  { duration: 10500, clockwise: true },
  { duration: 7400, clockwise: false },
  { duration: 9200, clockwise: true },
  { duration: 11500, clockwise: false },
];

export default function AIProcessingAnimation({
  width = 260,
  height = 260,
  style,
}: AIProcessingAnimationProps) {
  // 6 Rotation Animated Values (UI thread)
  const bandAnims = useRef(BAND_CONFIGS.map(() => new Animated.Value(0))).current;
  // Breathing Scale Animated Value (UI thread)
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 1. Continuous 60fps Native Rotations for alternating bands
    const rotAnimations = bandAnims.map((anim, index) => {
      const config = BAND_CONFIGS[index];
      return Animated.loop(
        Animated.timing(anim, {
          toValue: 1,
          duration: config.duration,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
    });

    // 2. Continuous Native Breathing Scale Pulse
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.95,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    rotAnimations.forEach((a) => a.start());
    pulseAnimation.start();

    return () => {
      rotAnimations.forEach((a) => a.stop());
      pulseAnimation.stop();
    };
  }, [bandAnims, pulseAnim]);

  return (
    <Animated.View
      style={[
        {
          width: width,
          height: height,
          transform: [{ scale: pulseAnim }],
          justifyContent: "center",
          alignItems: "center",
        },
        style,
      ]}
    >
      {/* 6 Counter-Rotating Native Animated Layers */}
      {BAND_CONFIGS.map((config, bandIdx) => {
        const spin = bandAnims[bandIdx].interpolate({
          inputRange: [0, 1],
          outputRange: config.clockwise ? ["0deg", "360deg"] : ["0deg", "-360deg"],
        });

        const bandRings = RINGS.filter((r) => r.bandIndex === bandIdx);

        return (
          <Animated.View
            key={`band-${bandIdx}`}
            style={[
              StyleSheet.absoluteFill,
              {
                transform: [{ rotate: spin }],
              },
            ]}
          >
            <Svg width="100%" height="100%" viewBox="0 0 340 340">
              <Defs>
                <LinearGradient
                  id={`gradient-${bandIdx}`}
                  x1="170"
                  y1="10"
                  x2="170"
                  y2="330"
                  gradientUnits="userSpaceOnUse"
                >
                  <Stop offset="0%" stopColor="#ff66b5" />
                  <Stop offset="25%" stopColor="#b99aff" />
                  <Stop offset="50%" stopColor="#92b1ff" />
                  <Stop offset="75%" stopColor="#249f94" />
                  <Stop offset="100%" stopColor="#20ff98" />
                </LinearGradient>
              </Defs>

              {/* Center Core Glowing Orb on base band */}
              {bandIdx === 0 && (
                <>
                  <Circle cx="170" cy="170" r="10" fill={`url(#gradient-${bandIdx})`} opacity={0.9} />
                  <Circle
                    cx="170"
                    cy="170"
                    r="16"
                    stroke={`url(#gradient-${bandIdx})`}
                    strokeWidth={1.5}
                    opacity={0.5}
                    strokeDasharray="3, 3"
                  />
                </>
              )}

              {/* Particle Rings for this Band */}
              {bandRings.map((ring) => (
                <Circle
                  key={`ring-${ring.id}`}
                  cx="170"
                  cy="170"
                  r={ring.r}
                  stroke={`url(#gradient-${bandIdx})`}
                  strokeWidth={ring.strokeWidth}
                  strokeDasharray={ring.dashArray}
                  strokeLinecap="round"
                  opacity={ring.opacity}
                  fill="none"
                />
              ))}
            </Svg>
          </Animated.View>
        );
      })}
    </Animated.View>
  );
}
