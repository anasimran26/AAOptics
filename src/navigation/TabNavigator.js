import React from "react";
import { View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import * as LucideIcons from "lucide-react-native";
import { useTheme } from "../contexts/ThemeProvider";
import Dashboard from "../screens/app/admin/Dashboard";
import Customers from "../screens/app/admin/Customers";
import Invoice from "../screens/app/admin/Invoice";
import Measurements from "../screens/app/admin/Measurements";
import Settings from "../screens/app/admin/Settings";
import TabHeader from "../components/TabHeader";

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
    const theme = useTheme();

    const TabIcon = ({ name, focused }) => {
        const Icon = LucideIcons[name];
        const color = focused ? theme.primary : theme.muted;

        return (
            <View className="items-center justify-center mt-4">
                {Icon && <Icon size={28} color={color} />}
            </View>
        );
    };

    return (
        <View className="flex-1" style={{ backgroundColor: theme.bg }}>
            <Tab.Navigator
                screenOptions={{
                    tabBarShowLabel: false,
                    tabBarStyle: {
                        backgroundColor: theme.card,
                        borderTopWidth: 0,
                        height: 85,
                        elevation: 0,
                        shadowOpacity: 0,
                    },
                    tabBarItemStyle: {
                        justifyContent: "center",
                        alignItems: "center",
                    },
                }}
            >
                <Tab.Screen
                    name="Dashboard"
                    component={Dashboard}
                    options={{
                        header: () => <TabHeader title="Dashboard" />,
                        tabBarIcon: ({ focused }) => (
                            <TabIcon name="LayoutDashboard" focused={focused} />
                        ),
                    }}
                />
                <Tab.Screen
                    name="Customers"
                    component={Customers}
                    options={{
                        header: () => <TabHeader title="Customers" />,
                        tabBarIcon: ({ focused }) => (
                            <TabIcon name="Users" focused={focused} />
                        ),
                    }}
                />

                <Tab.Screen
                    name="Invoice"
                    component={Invoice}
                    options={{
                        header: () => <TabHeader title="Invoice" />,
                        tabBarIcon: ({ focused }) => (
                            <TabIcon name="ReceiptText" focused={focused} />
                        ),
                    }}
                />
                <Tab.Screen
                    name="Measurements"
                    component={Measurements}
                    options={{
                        header: () => <TabHeader title="Measurements" />,
                        tabBarIcon: ({ focused }) => (
                            <TabIcon name="BarChart3" focused={focused} />
                        ),
                    }}
                />
                <Tab.Screen
                    name="Settings"
                    component={Settings}
                    options={{
                        header: () => <TabHeader title="Settings" />,
                        tabBarIcon: ({ focused }) => (
                            <TabIcon name="Settings" focused={focused} />
                        ),
                    }}
                />
            </Tab.Navigator>
        </View>
    );
}
