import React, { createContext, useContext } from "react";
import { useColorScheme } from "react-native";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const colorScheme = useColorScheme();

    const colors = {
        light: {
            bg: "#f9fafb",
            card: "#ffffff",
            text: "#1f2937",
            inputBg: "#e5e7eb",
            primary: "#22c55e",
            secondary: "#16a34a",
            muted: "#6b7280",
            border: "#d1d5db",
        },
        dark: {
            bg: "#0d1117",
            card: "#161b22",
            text: "#f1f5f9",
            inputBg: "#161b22",
            primary: "#4ade80",
            secondary: "#22c55e",
            muted: "#9ca3af",
            border: "#374151",
        },
    };

    const theme = colorScheme === "dark" ? colors.dark : colors.light;

    return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
