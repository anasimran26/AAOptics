import React from "react";
import { Text, View, Dimensions } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { useTheme } from "../contexts/ThemeProvider"; // import your theme

export default function ChartCard({ title, data, color = "#3b82f6" }) {
  const theme = useTheme();
  const screenWidth = Dimensions.get("window").width;

  const formattedData =
    data?.map((item) => ({
      value: item.y,
      label: item.x.slice(5),
    })) || [];

  return (
    <View
      className="p-4 my-3 px-3 rounded-xl w-full justify-center items-center"
      style={{ backgroundColor: theme.card }}
    >
      <Text
        className="text-xl text-center font-[SemiBold] mb-3"
        style={{ color: theme.text }}
      >
        {title}
      </Text>

      <LineChart
        data={formattedData}
        thickness={3}
        color={color || theme.primary}
        hideDataPoints={true}
        curved
        areaChart
        startFillColor={color || theme.primary}
        endFillColor="transparent"
        startOpacity={0.4}
        endOpacity={0.1}
        initialSpacing={10}
        spacing={40}
        width={screenWidth * 0.69}
        yAxisTextStyle={{
          color: theme.muted,
          fontFamily: "Regular",
          fontSize: 11,
        }}
        xAxisLabelTextStyle={{
          color: theme.muted,
          fontFamily: "Regular",
          fontSize: 11,
        }}
      />
    </View>
  );
}
