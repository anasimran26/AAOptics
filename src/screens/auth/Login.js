import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    ScrollView,
    TouchableWithoutFeedback,
    Keyboard,
    Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CheckBox from "react-native-check-box";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeProvider";
import api, { setAuthToken } from "../../api";

export default function Login({ route }) {
    const { fromHome } = route.params || {};
    const navigation = useNavigation();
    const { login } = useAuth();
    const theme = useTheme();

    const [form, setForm] = useState({ email: "", password: "" });
    const [isPasswordVisible, setPasswordVisible] = useState(false);
    const [isChecked, setIsChecked] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (key, value) =>
        setForm((prev) => ({ ...prev, [key]: value }));

    const handleLogin = async () => {
        setError("");
        if (!form.email || !form.password) {
            setError("Please fill in all fields");
            return;
        }
        setLoading(true);
        try {
            const res = await api.auth.login({
                email: form.email,
                password: form.password,
            });
            if (res.status) {
                setAuthToken(res.token);
                login(res);
            } else {
                alert(res.message || "Login failed");
            }
        } catch (err) {
            setError("Login failed");
            console.log("Login error:", err.response?.data || err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView
            className="flex-1 bg-white dark:bg-[#0d1117]"
            style={{ backgroundColor: theme.bg }}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                    className="flex-1"
                >
                    <ScrollView
                        contentContainerStyle={{ flexGrow: 1 }}
                        keyboardShouldPersistTaps="handled"
                    >
                        <View className="flex-1 justify-center items-center px-6">

                            {/* Header */}
                            <View className="items-center mb-8">
                                <Text className="text-4xl font-[Bold] text-gray-900 dark:text-gray-100">
                                    Welcome Back
                                </Text>
                            </View>

                            {/* Email Input */}
                            <View className="flex-row items-center bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 h-14 w-full mb-4 border border-gray-200 dark:border-gray-700">
                                <Ionicons
                                    name="mail-outline"
                                    size={20}
                                    color={theme.muted}
                                    className="mr-2"
                                />
                                <TextInput
                                    placeholder="Email address"
                                    placeholderTextColor={theme.muted}
                                    value={form.email}
                                    onChangeText={(text) => handleChange("email", text)}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    className="flex-1 text-gray-900 dark:text-gray-100 text-base font-[Medium]"
                                />
                            </View>

                            {/* Password Input */}
                            <View className="flex-row items-center bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 h-14 w-full border border-gray-200 dark:border-gray-700">
                                <Ionicons
                                    name="lock-closed-outline"
                                    size={20}
                                    color={theme.muted}
                                    className="mr-2"
                                />
                                <TextInput
                                    placeholder="Password"
                                    placeholderTextColor={theme.muted}
                                    secureTextEntry={!isPasswordVisible}
                                    value={form.password}
                                    onChangeText={(text) => handleChange("password", text)}
                                    className="flex-1 text-gray-900 dark:text-gray-100 text-base font-[Medium]"
                                />
                                <TouchableOpacity
                                    onPress={() => setPasswordVisible(!isPasswordVisible)}
                                >
                                    <Ionicons
                                        name={isPasswordVisible ? "eye-outline" : "eye-off-outline"}
                                        size={22}
                                        color={theme.muted}
                                    />
                                </TouchableOpacity>
                            </View>

                            {/* Remember Me + Error */}
                            <View className="flex-row items-center mt-4 self-start">
                                <CheckBox
                                    isChecked={isChecked}
                                    onClick={() => setIsChecked(!isChecked)}
                                    checkBoxColor={theme.primary}
                                />
                                <Text className="text-sm font-[SemiBold] text-gray-600 ml-2 dark:text-gray-400">
                                    Remember me
                                </Text>
                            </View>

                            {error ? (
                                <Text className="text-red-500 text-center mt-3">{error}</Text>
                            ) : null}

                            {/* Login Button */}
                            <TouchableOpacity
                                onPress={handleLogin}
                                disabled={loading}
                                className="bg-green-500 dark:bg-green-400 w-full rounded-2xl py-3.5 mt-7 shadow-md active:scale-95"
                            >
                                <Text className="text-white text-xl font-[Bold] text-center tracking-wide">
                                    {loading ? "Logging in..." : "Sign In"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
        </SafeAreaView>
    );
}
