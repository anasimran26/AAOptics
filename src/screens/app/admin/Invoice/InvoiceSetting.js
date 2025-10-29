import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { fetchInvoiceSetting, createInvoiceSetting } from "../../../../api";
import { useTheme } from "../../../../contexts/ThemeProvider";

export default function InvoiceSetting() {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    invoicePrefix: "",
    invoiceIndex: "",
    sandboxUrl: "",
    sandboxToken: "",
    bposId: "",
    invoiceType: "",
    saleType: "",
  });

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    const loadInvoiceSetting = async () => {
      try {
        setLoading(true);
        const result = await fetchInvoiceSetting();
        const data = result?.data?.data || result?.data || result;
        setForm({
          invoicePrefix: data?.default_invoice_prefix || "",
          invoiceIndex: data?.default_invoice_index || "",
          sandboxUrl: data?.sandbox_url || "",
          sandboxToken: data?.sandbox_security_token || "",
          bposId: data?.bposid || "",
          invoiceType: data?.invoice_type || "",
          saleType: data?.sale_type || "",
        });
      } catch {
        Toast.show({
          type: "custom",
          text1: "Failed to fetch invoice settings.",
        });
      } finally {
        setLoading(false);
      }
    };
    loadInvoiceSetting();
  }, []);

  const handleUpdate = async () => {
    try {
      const payload = {
        default_invoice_prefix: form.invoicePrefix,
        default_invoice_index: form.invoiceIndex,
        sandbox_url: form.sandboxUrl,
        sandbox_security_token: form.sandboxToken,
        bposid: form.bposId,
        invoice_type: form.invoiceType,
        sale_type: form.saleType,
      };
      const response = await createInvoiceSetting(payload);
      const data = response?.data || response;
      Toast.show({
        type: "custom",
        text1: data ? "Invoice settings saved." : "Failed to save settings.",
      });
    } catch (error) {
      Toast.show({
        type: "custom",
        text1:
          error.response?.data?.message ||
          "Something went wrong while saving settings.",
      });
    }
  };

  const SkeletonField = () => (
    <View className="mb-3">
      <View
        className="rounded-md h-4 w-1/3 mb-1 animate-pulse"
        style={{ backgroundColor: theme.border }}
      />
      <View
        className="rounded-lg h-12 w-full animate-pulse"
        style={{ backgroundColor: theme.inputBg }}
      />
    </View>
  );

  const fields = [
    { label: "Invoice Prefix", key: "invoicePrefix", placeholder: "Eg: INV-" },
    {
      label: "Invoice Index",
      key: "invoiceIndex",
      placeholder: "Enter Invoice Index",
      keyboardType: "numeric",
    },
    { label: "Sandbox URL", key: "sandboxUrl", placeholder: "Enter Sandbox URL" },
    {
      label: "Sandbox Security Token",
      key: "sandboxToken",
      placeholder: "Enter Security Token",
    },
    {
      label: "BPOS ID",
      key: "bposId",
      placeholder: "Enter BPOS ID",
      keyboardType: "numeric",
    },
    { label: "Invoice Type", key: "invoiceType", placeholder: "Enter Invoice Type" },
    { label: "Sale Type", key: "saleType", placeholder: "Enter Sale Type" },
  ];

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: theme.bg }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 80 }}
          keyboardShouldPersistTaps="handled"
        >
          {loading ? (
            fields.map((_, idx) => <SkeletonField key={idx} />)
          ) : (
            <>
              {fields.map((item) => (
                <View key={item.key} className="mb-4">
                  <Text
                    className="mb-1 text-[15px]"
                    style={{
                      color: theme.text,
                      fontFamily: "SemiBold",
                    }}
                  >
                    {item.label}
                  </Text>

                  <TextInput
                    placeholder={item.placeholder}
                    value={form[item.key]}
                    onChangeText={(text) => handleChange(item.key, text)}
                    keyboardType={item.keyboardType || "default"}
                    className="rounded-lg p-3 text-sm"
                    style={{
                      backgroundColor: theme.inputBg,
                      borderColor: theme.border,
                      borderWidth: 1,
                      color: theme.text,
                      fontFamily: "Medium",
                    }}
                    placeholderTextColor={theme.muted}
                  />
                </View>
              ))}

              <TouchableOpacity
                onPress={handleUpdate}
                activeOpacity={0.8}
                className="rounded-lg py-3 items-center mt-4"
                style={{ backgroundColor: theme.primary }}
              >
                <Text
                  className="text-base"
                  style={{
                    color: "#fff",
                    fontFamily: "SemiBold",
                  }}
                >
                  Save Settings
                </Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
