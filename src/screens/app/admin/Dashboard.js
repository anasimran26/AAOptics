import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Button } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCurrency } from "../../../contexts/CurrencyContext";
import { fetchDashboard, fetchSales } from "../../../api";
import ChartCard from "../../../components/ChartCard";
import { useTheme } from "../../../contexts/ThemeProvider";

export default function Dashboard() {
  const theme = useTheme();
  const { currency } = useCurrency();
  const [dashboardStats, setDashboardStats] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const result = await fetchDashboard();
        setDashboardStats(result.data);
      } catch (error) {
        console.log("Error fetching dashboard data:", error);
      }
    };
    loadDashboard();
  }, []);

  const loadSales = async () => {
    setLoading(true);
    try {
      const res = await fetchSales();
      const apiData = res?.data?.data || [];
      setSalesData(apiData);
    } catch (error) {
      console.log("Error fetching sales:", error);
    } finally {
      setTimeout(() => setLoading(false), 800);
    }
  };

  useEffect(() => {
    loadSales();
  }, []);

  const StatCard = ({ amount = "0.00", label }) => (
    <View
      className="p-4 rounded-xl shadow-md justify-center"
      style={{ backgroundColor: theme.card, minHeight: 100 }}
    >
      <Text className="text-base font-[Medium]" style={{ color: theme.text }}>
        {label}
      </Text>
      <Text className="text-xl mt-1 font-[Bold]" style={{ color: theme.primary }}>
        {label === "Total Branches"
          ? amount === 1
            ? `${amount} Branch`
            : `${amount} Branches`
          : `${currency}${!amount || isNaN(amount) ? "0.00" : Number(amount).toFixed(2)}`}
      </Text>

    </View>
  );



  const stats = [
    { amount: dashboardStats?.total_sales, label: "Total Sales" },
    { amount: dashboardStats?.total_expense, label: "Total Expense" },
    { amount: dashboardStats?.total_branches, label: "Total Branches" },
    { amount: dashboardStats?.total_payments, label: "Total Payments" },
  ];


  const totalPages = Math.ceil(salesData.length / itemsPerPage);
  const displayedSales = salesData.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
      >
        {/* Stats Section */}
        {loading ? (
          <View className="flex-row flex-wrap justify-between">
            {[...Array(4)].map((_, i) => (
              <View
                key={i}
                className="w-[48%] h-28 bg-gray-300 dark:bg-gray-700 rounded-2xl my-2 animate-pulse"
              />
            ))}
          </View>
        ) : (
          <View className="flex-row flex-wrap justify-between">
            {stats.map((item, index) => (
              <View key={index} className="w-[48%] my-2">
                <StatCard {...item} />
              </View>
            ))}
          </View>
        )}

        {/* Sales Table */}
        <Text
          className="text-xl font-[Bold] text-center mt-6 mb-3"
          style={{ color: theme.text }}
        >
          Recent Sales
        </Text>
        <View
          className="rounded-xl border overflow-hidden"
          style={{ borderColor: theme.border, backgroundColor: theme.card }}
        >
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View>
              {/* ===== Header Row ===== */}
              <View
                className="flex-row border-b"
                style={{
                  borderColor: theme.border,
                  backgroundColor: theme.card,
                }}
              >
                {["#", "Invoice", "Customer", "Total"].map((header, i) => (
                  <Text
                    key={i}
                    className="px-4 py-3 font-[SemiBold] text-sm"
                    style={{
                      color: theme.muted,
                      width: i === 0 ? 70 : 110,
                      textAlign: i === 3 ? "right" : "left",
                    }}
                  >
                    {header}
                  </Text>
                ))}
              </View>
              {loading ? (
                <>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <View
                      key={i}
                      className="flex-row border-b"
                      style={{ borderColor: theme.border }}
                    >
                      {Array.from({ length: 4 }).map((__, j) => (
                        <View
                          key={j}
                          className="px-4 py-3 justify-center"
                          style={{
                            width: j === 0 ? 70 : 110,
                            alignItems: j === 3 ? "flex-end" : "flex-start",
                          }}
                        >
                          <View
                            className="rounded-full animate-pulse"
                            style={{
                              height: 12,
                              width: j === 3 ? 50 : 80,
                              backgroundColor: theme.border,
                            }}
                          />
                        </View>
                      ))}
                    </View>
                  ))}
                </>
              ) : displayedSales.length > 0 ? (
                displayedSales.map((sale, index) => (
                  <View
                    key={sale.id || index}
                    className="flex-row border-b"
                    style={{
                      borderColor: theme.border,
                      backgroundColor: index % 2 === 0 ? theme.bg : theme.card,
                    }}
                  >
                    <Text
                      className="px-4 py-3 font-[Regular] text-sm"
                      style={{
                        color: theme.text,
                        width: 70,
                      }}
                    >
                      {index + 1}
                    </Text>

                    <Text
                      className="px-4 py-3 font-[Regular] text-sm"
                      style={{
                        color: theme.text,
                        width: 110,
                      }}
                    >
                      {sale.invoice_number || "—"}
                    </Text>

                    <Text
                      className="px-4 py-3 font-[Regular] text-sm"
                      style={{
                        color: theme.text,
                        width: 110,
                      }}
                      numberOfLines={1}
                    >
                      {sale.customer_name || "—"}
                    </Text>
                    <Text
                      className="px-4 py-3 font-[Regular] text-sm text-right"
                      style={{
                        color: theme.text,
                        width: 110,
                      }}
                    >
                      {currency}
                      {Number(sale.total || 0).toFixed(2)}
                    </Text>
                  </View>
                ))
              ) : (
                <Text
                  className="text-center py-4 font-[Medium]"
                  style={{ color: theme.muted }}
                >
                  No sales found.
                </Text>
              )}
            </View>
          </ScrollView>
        </View>



        {/* Charts */}
        {dashboardStats && (
          <View className="my-5">
            <ChartCard
              title="Sales Over Time"
              data={dashboardStats.sales_chart_data}
              color={theme.primary}
            />
            <ChartCard
              title="Payments Over Time"
              data={dashboardStats.payments_chart_data}
              color="#8b5cf6"
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}
