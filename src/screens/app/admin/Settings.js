import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import ActionSheet from "react-native-actions-sheet";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../../contexts/AuthContext";
import { useCurrency, allCurrencies } from "../../../contexts/CurrencyContext";
import { useTheme } from "../../../contexts/ThemeProvider";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function Settings() {
  const { logout } = useAuth();
  const { currency, setCurrency } = useCurrency();
  const theme = useTheme();
  const navigation = useNavigation();
  const actionSheetRef = useRef(null);

  const [showMeasurementDropdown, setShowMeasurementDropdown] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const toggleMeasurementDropdown = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowMeasurementDropdown(!showMeasurementDropdown);
  };

  const SectionButton = ({ title, onPress, icon = "chevron-forward-outline" }) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="flex-row items-center justify-between w-[90%] mt-3 rounded-xl py-3 px-4"
      style={{
        backgroundColor: theme.card,
        borderColor: theme.border,
        borderWidth: 1,
      }}
    >
      <Text
        className="text-base font-[SemiBold]"
        style={{ color: theme.text }}
      >
        {title}
      </Text>
      <Ionicons name={icon} size={20} color={theme.muted} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 items-center" style={{ backgroundColor: theme.bg }}>
      {/* Currency Setting */}
      <TouchableOpacity
        onPress={() => actionSheetRef.current?.show()}
        activeOpacity={0.8}
        className="flex-row items-center justify-between w-[90%] mt-5 rounded-xl py-3 px-4"
        style={{
          backgroundColor: theme.card,
          borderColor: theme.border,
          borderWidth: 1,
        }}
      >
        <Text
          className="text-base font-[SemiBold]"
          style={{ color: theme.text }}
        >
          Business Currency
        </Text>

        <View className="flex-row items-center">
          <Text
            className="text-sm font-[Medium] mr-1"
            style={{ color: theme.muted }}
          >
            {currency}
          </Text>
          <Ionicons name="chevron-down-outline" size={20} color={theme.muted} />
        </View>
      </TouchableOpacity>

      {/* Invoice Setting */}
      <SectionButton
        title="Invoice Setting"
        onPress={() => navigation.navigate("InvoiceSetting")}
      />

      {/* Measurement Setting */}
      <TouchableOpacity
        onPress={toggleMeasurementDropdown}
        activeOpacity={0.8}
        className="flex-row items-center justify-between w-[90%] mt-3 rounded-xl py-3 px-4"
        style={{
          backgroundColor: theme.card,
          borderColor: theme.border,
          borderWidth: 1,
        }}
      >
        <Text
          className="text-base font-[SemiBold]"
          style={{ color: theme.text }}
        >
          Measurement Setting
        </Text>
        <Ionicons
          name={showMeasurementDropdown ? "chevron-up-outline" : "chevron-down-outline"}
          size={20}
          color={theme.muted}
        />
      </TouchableOpacity>

      {/* Dropdown Content */}
      {showMeasurementDropdown && (
        <View className="w-full items-center">
          <SectionButton
            title="Measurement Types"
            onPress={() => navigation.navigate("MeasurementTypes")}
          />
          <SectionButton
            title="Measurement Attributes"
            onPress={() => navigation.navigate("MeasurementAttributes")}
          />
        </View>
      )}

      {/* Add Product */}
      <SectionButton
        title="Add Products"
        onPress={() => navigation.navigate("Products")}
      />

      {/* Logout */}
      <SectionButton
        title="Logout"
        onPress={() => setShowLogoutModal(true)}
        icon="log-out-outline"
      />

      {/* Currency Action Sheet */}
      <ActionSheet
        ref={actionSheetRef}
        gestureEnabled
        containerStyle={{
          backgroundColor: theme.card,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        }}
      >
        <View className="p-4">
          <Text
            className="text-lg font-[SemiBold] mb-2"
            style={{ color: theme.text }}
          >
            Select Currency
          </Text>

          <View className="flex-row flex-wrap mb-10">
            {allCurrencies.map((item, index) => {
              const isSelected = currency === item;
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    setCurrency(item);
                    actionSheetRef.current?.hide();
                  }}
                  className="py-2 px-3 m-1 rounded-lg border"
                  style={{
                    borderColor: isSelected ? theme.primary : theme.border,
                    backgroundColor: isSelected ? theme.inputBg : theme.card,
                  }}
                >
                  <Text
                    className="font-[Medium]"
                    style={{ color: isSelected ? theme.primary : theme.text }}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ActionSheet>

      {/* Logout Modal */}
      <Modal
        transparent
        visible={showLogoutModal}
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowLogoutModal(false)}
          className="flex-1 justify-center items-center bg-black/50"
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            className="w-[85%] rounded-2xl p-5 border"
            style={{
              backgroundColor: theme.card,
              borderColor: theme.border,
            }}
          >
            <Text
              className="text-center text-lg font-[SemiBold] mb-5"
              style={{ color: theme.text }}
            >
              Are you sure you want to log out?
            </Text>

            <View className="flex-row justify-between">
              <TouchableOpacity
                onPress={() => setShowLogoutModal(false)}
                activeOpacity={0.8}
                className="flex-1 py-3 rounded-lg mr-2 border"
                style={{
                  backgroundColor: theme.inputBg,
                  borderColor: theme.border,
                }}
              >
                <Text
                  className="text-center font-[SemiBold]"
                  style={{ color: theme.text }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setShowLogoutModal(false);
                  logout();
                }}
                activeOpacity={0.8}
                className="flex-1 py-3 rounded-lg ml-2"
                style={{ backgroundColor: theme.primary }}
              >
                <Text className="text-center font-[SemiBold] text-white">
                  Logout
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}
