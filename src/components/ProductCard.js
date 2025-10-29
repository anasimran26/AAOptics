import { View, Text, TouchableOpacity, Image, Dimensions } from "react-native";
import React from "react";
import { useCurrency } from "../contexts/CurrencyContext";

export default function ProductCard({ product, onPress, loading = false }) {
  const BASE_URL = "https://optical.aasols.com/";
  const screenWidth = Dimensions.get("window").width;
  const imageWidth = screenWidth * 0.3;
  const { currency } = useCurrency();

  if (loading) {
    return (
      <View className="flex-row items-center m-1 bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
        style={{ height: 85 }}>
        <View className="bg-gray-300 dark:bg-gray-700 w-[30%] h-full rounded-none animate-pulse" />
        <View className="flex-1 p-3 justify-between">
          <View className="bg-gray-300 dark:bg-gray-700 h-4 w-[70%] mb-3 rounded-lg animate-pulse" />
          <View className="bg-gray-300 dark:bg-gray-700 h-3 w-[50%] mb-2 rounded-lg animate-pulse" />
          <View className="bg-gray-300 dark:bg-gray-700 h-4 w-[30%] rounded-lg animate-pulse" />
        </View>
      </View>
    );
  }

  //  Product Card
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      accessibilityRole="button"
      className="m-1 bg-white dark:bg-gray-800 rounded-lg shadow-md"
      style={{ flexDirection: "row", overflow: "hidden" }}
    >
      {/* Left Image */}
      <Image
        source={{ uri: `${BASE_URL}${product.image}` }}
        style={{
          width: imageWidth,
          height: 85,
          resizeMode: "cover",
        }}
      />

      {/* Product Info */}
      <View className="p-3 justify-between flex-1">
        <Text className="font-semibold text-[16px] text-gray-700 dark:text-gray-300">
          {product.name}
        </Text>
        <Text className="font-semibold text-[12px] text-gray-700 dark:text-gray-300">
          {product.item_code}
        </Text>
        <Text className="font-extrabold text-blue-500 dark:text-blue-400 text-sm mt-1">
          {currency} {product.stitching_cost}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
