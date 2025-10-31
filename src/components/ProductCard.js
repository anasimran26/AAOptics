import { View, Text, TouchableOpacity, Image, Dimensions } from "react-native";
import React from "react";
import { useCurrency } from "../contexts/CurrencyContext";
import { useTheme } from "../contexts/ThemeProvider";

export default function ProductCard({ product, onPress, loading = false }) {
  const BASE_URL = "https://optical.aasols.com/";
  const screenWidth = Dimensions.get("window").width;
  const imageWidth = screenWidth * 0.3;
  const { currency } = useCurrency();
  const theme = useTheme();

  if (loading) {
    return (
      <View
        className="flex-row items-center m-1 rounded-xl overflow-hidden"
        style={{
          height: 85,
          backgroundColor: theme.card,
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 2,
        }}
      >
        <View
          className="animate-pulse"
          style={{
            width: imageWidth,
            height: "100%",
            backgroundColor: theme.border,
          }}
        />
        <View className="flex-1 p-3 justify-between">
          <View
            className="rounded-lg animate-pulse"
            style={{
              height: 14,
              width: "70%",
              backgroundColor: theme.border,
              marginBottom: 8,
            }}
          />
          <View
            className="rounded-lg animate-pulse"
            style={{
              height: 10,
              width: "50%",
              backgroundColor: theme.border,
              marginBottom: 6,
            }}
          />
          <View
            className="rounded-lg animate-pulse"
            style={{
              height: 14,
              width: "30%",
              backgroundColor: theme.border,
            }}
          />
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      accessibilityRole="button"
      className="m-1 rounded-xl"
      style={{
        flexDirection: "row",
        backgroundColor: theme.card,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      {/* Product Image */}
      <Image
        source={{ uri: `${BASE_URL}${product.image}` }}
        style={{
          width: imageWidth,
          height: 85,
          resizeMode: "cover",
        }}
      />

      {/* Product Info */}
      <View className="flex-1 p-3 justify-between">
        <Text
          className="text-[16px]"
          style={{
            color: theme.text,
            fontFamily: "SemiBold",
          }}
          numberOfLines={1}
        >
          {product.name}
        </Text>

        <Text
          className="text-[12px]"
          style={{
            color: theme.muted,
            fontFamily: "Regular",
          }}
          numberOfLines={1}
        >
          {product.item_code}
        </Text>

        <Text
          className="text-[14px] mt-1"
          style={{
            color: theme.primary,
            fontFamily: "Bold",
          }}
        >
          {currency} {product.stitching_cost}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
