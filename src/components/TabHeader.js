import React from "react";
import { View, Text } from "react-native";
import { useTheme } from "../contexts/ThemeProvider";

export default function TabHeader({ title = "Title" }) {
  const theme = useTheme();

  return (
    <View
      className="w-full h-28 items-center justify-center"
      style={{
        backgroundColor: theme.card,
        borderBottomColor: theme.border,
      }}
    >
      <Text
        className="text-4xl mt-10"
        style={{
          color: theme.text,
          fontFamily: "SemiBold",
          letterSpacing: 0.5,
        }}
      >
        {title}
      </Text>
    </View>
  );
}
