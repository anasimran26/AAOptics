import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import Login from "../screens/auth/Login";
import InvoicePreview from "../screens/app/admin/Invoice/InvoicePreview";
import InvoiceSetting from "../screens/app/admin/Invoice/InvoiceSetting";
import MeasurementAttributes from "../screens/app/admin/Measurements/MeasurementAttributes";
import MeasurementTypes from "../screens/app/admin/Measurements/MeasurementTypes";
import Subscription from "../screens/app/admin/Subscription";
import Products from "../screens/app/admin/Products";
import Header from "../components/Header";
import TabNavigator from "./TabNavigator";


const AuthStack = createNativeStackNavigator();
const AppStack = createNativeStackNavigator();

function AuthStackNavigator() {
    return (
        <AuthStack.Navigator screenOptions={{ headerShown: false }}>
            <AuthStack.Screen name="Login" component={Login} />
        </AuthStack.Navigator>
    );
}

function AppStackNavigator() {
    return (
        <AppStack.Navigator
            screenOptions={{
                header: ({ route }) => <Header title={route.name} />,
            }}
        >
            <AppStack.Screen
                name="Main"
                component={TabNavigator}
                options={{ headerShown: false }}
            />
            <AppStack.Screen name="InvoicePreview" component={InvoicePreview} />
            <AppStack.Screen name="InvoiceSetting" component={InvoiceSetting} />
            <AppStack.Screen name="MeasurementAttributes" component={MeasurementAttributes} />
            <AppStack.Screen name="MeasurementTypes" component={MeasurementTypes} />
            <AppStack.Screen name="Products" component={Products} />
            <AppStack.Screen name="Subscription" component={Subscription} />
        </AppStack.Navigator>
    );
}

export default function RootNavigator() {
    const colorScheme = useColorScheme();
    const { isLoggedIn, loading } = useAuth();

    if (loading) return null;

    return (
        <NavigationContainer>
            {isLoggedIn ? <AppStackNavigator /> : <AuthStackNavigator />}
            <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
        </NavigationContainer>
    );
}
