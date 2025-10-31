import "./global.css";
import { useEffect, useState } from "react";
import * as Font from "expo-font";
import { useColorScheme } from "react-native";
import RootNavigator from "./src/navigation/root";
import { AuthProvider, useAuth } from "./src/contexts/AuthContext";
import { CurrencyProvider } from "./src/contexts/CurrencyContext";
import { ThemeProvider } from "./src/contexts/ThemeProvider";
import Toast, { BaseToast } from "react-native-toast-message";
import api from "./src/api";
import { configureReanimatedLogger, ReanimatedLogLevel } from "react-native-reanimated";
import mobileAds from "react-native-google-mobile-ads";
import { AdsProvider } from "./src/contexts/ads/AdManager";



configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

function AutoLoginWrapper({ children }) {
  const { login } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const autoLogin = async () => {
      try {
        const payload = {
          email: "admin@admin.com",
          password: "123456",
        };
        const res = await api.auth.login(payload);
        if (res.status) {
          login(res);
        } else {
          console.warn("Auto-login failed:", res.message);
        }
      } catch (err) {
        console.warn("Auto-login error:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    autoLogin();
  }, []);

  if (loading) return null;

  return children;
}

export default function App() {
  const colorScheme = useColorScheme();
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    mobileAds()
      .initialize()
      .then((adapterStatuses) => {
        console.log("AdMob initialized", adapterStatuses);
      });
  }, []);

  useEffect(() => {
    async function loadResources() {
      try {
        await Font.loadAsync({
          Regular: require("./src/assets/fonts/Outfit-Regular.ttf"),
          Medium: require("./src/assets/fonts/Outfit-Medium.ttf"),
          SemiBold: require("./src/assets/fonts/Outfit-SemiBold.ttf"),
          Bold: require("./src/assets/fonts/Outfit-Bold.ttf"),
        });
        setAppIsReady(true);
      } catch (e) {
        console.warn("Font loading error:", e);
      }
    }
    loadResources();
  }, []);

  if (!appIsReady) return null;

  const toastConfig = {
    custom: ({ text1 }) => (
      <BaseToast
        style={{
          backgroundColor: colorScheme === "dark" ? "#1f2937" : "#f3f4f6",
          borderLeftColor: colorScheme === "dark" ? "#22c55e" : "#16a34a",
          borderLeftWidth: 8,
        }}
        contentContainerStyle={{ paddingHorizontal: 15 }}
        text1Style={{
          fontSize: 16,
          color: colorScheme === "dark" ? "#fff" : "#000",
          fontFamily: "Outfit-Medium",
        }}
        text1={text1}
      />
    ),
  };

  return (
    <AdsProvider showAppOpenOnForeground={true}>
      <AuthProvider>
        <AutoLoginWrapper>
          <ThemeProvider>
            <CurrencyProvider>
              <RootNavigator />
              <Toast config={toastConfig} />
            </CurrencyProvider>
          </ThemeProvider>
        </AutoLoginWrapper>
      </AuthProvider>
    </AdsProvider>

  );
}
