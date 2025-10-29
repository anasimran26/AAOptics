import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setAuthToken, clearAuthToken } from "../api/index.js";

const AuthContext = createContext();
export function AuthProvider({ children }) {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadAuth = async () => {
            try {
                const savedUser = await AsyncStorage.getItem("user");
                const savedToken = await AsyncStorage.getItem("token");

                if (savedUser && savedToken) {
                    setUser(JSON.parse(savedUser));
                    setToken(savedToken);
                    setAuthToken(savedToken);
                    setIsLoggedIn(true);
                }
            } catch (e) {
                console.warn("Error loading auth:", e);
            } finally {
                setLoading(false);
            }
        };
        loadAuth();
    }, []);

    const login = async (data) => {
        const { user, token } = data;

        setUser(user);
        setToken(token);
        setIsLoggedIn(true);
        setAuthToken(token);

        await AsyncStorage.setItem("user", JSON.stringify(user));
        await AsyncStorage.setItem("token", token);
    };

    const logout = async () => {
        clearAuthToken();

        setUser(null);
        setToken(null);
        setIsLoggedIn(false);

        await AsyncStorage.removeItem("user");
        await AsyncStorage.removeItem("token");
    };

    return (
        <AuthContext.Provider
            value={{ isLoggedIn, user, token, login, logout, loading }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
