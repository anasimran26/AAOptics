import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../contexts/ThemeProvider";

export default function Header({ title }) {
  const navigation = useNavigation();
  const theme = useTheme();

  return (
    <View
      style={{
        backgroundColor: theme.card,
        paddingTop: 45,
        paddingHorizontal: 18,
        flexDirection: "row",
        alignItems: "center",
        borderBottomColor: theme.border,
      }}
    >
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={{
          paddingVertical: 10,
          paddingRight: 20,
        }}
      >
        <Ionicons
          name="arrow-back"
          size={26}
          color={theme.text}
        />
      </TouchableOpacity>

      <View style={{ flex: 1, alignItems: "center" }}>
        <Text
          style={{
            fontSize: 24,
            color: theme.text,
            fontFamily: "SemiBold",
            textAlign: "center",
          }}
          numberOfLines={1}
        >
          {title}
        </Text>
      </View>
      <View style={{ width: 40 }} />
    </View>
  );
}
