import React from "react";
import { StyleProp, ViewStyle } from "react-native";
import { SvgXml } from "react-native-svg";
import orbData from "./ai_orb.json";

export type AIProcessingAnimationProps = {
  width?: number | string;
  height?: number | string;
  style?: StyleProp<ViewStyle>;
};

export default function AIProcessingAnimation({
  width = "100%",
  height = "100%",
  style,
}: AIProcessingAnimationProps) {
  return (
    <SvgXml
      xml={orbData.xml}
      width={width}
      height={height}
      style={style}
    />
  );
}
