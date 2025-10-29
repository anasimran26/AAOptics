import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Chip } from "react-native-paper";
import ActionSheet from "react-native-actions-sheet";
import Toast from "react-native-toast-message";
import { useTheme } from "../../../../contexts/ThemeProvider";
import {
  fetchMeasurements,
  fetchCustomers,
  fetchMeasurementAttributes,
  fetchCustomerMeasurementDetails,
  saveCustomerMeasurement,
} from "../../../../api";

export default function Measurements() {
  const theme = useTheme();
  const [searchCustomer, setSearchCustomer] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [measurements, setMeasurements] = useState([]);
  const [selected, setSelected] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState({ id: 1, name: "mm" });
  const [notes, setNotes] = useState("");
  const [attributes, setAttributes] = useState([]);
  const [attributeValues, setAttributeValues] = useState({});
  const [loading, setLoading] = useState(true);
  const actionSheetRef = useRef(null);
  const units = ["Inches", "Cm", "Mtr", "Yrd", "Ft"].map((n, i) => ({ id: i + 1, name: n }));


  const showToast = (text) => Toast.show({ type: "custom", text1: text });

  useEffect(() => {
    (async () => {
      try {
        const [mRes, cRes] = await Promise.all([
          fetchMeasurements(),
          fetchCustomers(),
        ]);

        if (mRes?.status && Array.isArray(mRes.data)) {
          const activeMeasurements = mRes.data
            .filter((m) => m.is_active === 1)
            .sort((a, b) => a.id - b.id);
          setMeasurements(activeMeasurements);

          const first = activeMeasurements[0];
          if (first) {
            setSelected(first.name);
            const aRes = await fetchMeasurementAttributes(first.id);
            if (aRes?.status) setAttributes(aRes.data.attributes || []);
          }
        }

        const allCustomers = cRes?.data?.data || [];
        const activeCustomers = allCustomers.filter((c) => c.is_active === 1);
        setCustomers(activeCustomers);
      } catch (e) {
        console.log(e);
      } finally {
        setTimeout(() => setLoading(false), 1000);
      }
    })();
  }, []);

  const loadMeasurementData = async (customerId, m) => {
    try {
      const [detailRes, attrRes] = await Promise.all([
        customerId ? fetchCustomerMeasurementDetails(customerId, m.id) : null,
        fetchMeasurementAttributes(m.id),
      ]);

      const attrs = attrRes?.data?.attributes || [];
      setAttributes(attrs);

      const values = {};
      attrs.forEach((a) => (values[a.detail_id || a.id] = ""));

      if (!detailRes?.status || !customerId) {
        setAttributeValues(values);
        setNotes("");
        setSelectedUnit(units[0]);
        return;
      }

      const d = detailRes.data || detailRes;
      attrs.forEach((a) => {
        const k = a.detail_id || a.id;
        values[k] =
          (d.userattributes?.[k] ||
            d.attributes?.find((x) => x.id === k)?.value ||
            "").toString();
      });

      setAttributeValues(values);
      setSelectedUnit(units.find((u) => u.id === d.unit) || units[0]);
      setNotes(d.notes || "");
    } catch (e) {
      console.error("Load measurement data error:", e);
      const reset = {};
      attributes.forEach((a) => (reset[a.detail_id || a.id] = ""));
      setAttributeValues(reset);
      setNotes("");
      setSelectedUnit(units[0]);
    }
  };

  const handleSaveMeasurement = async () => {
    if (!selectedCustomer || !selected) return showToast("Select Customer!");
    try {
      const m = measurements.find((m) => m.name === selected);
      if (!m) return showToast("Measurement not found!");
      const r = await saveCustomerMeasurement(selectedCustomer.id, {
        type: m.id,
        unit: selectedUnit.id,
        notes,
        userattributes: attributeValues,
      });
      showToast(
        r?.status ? "Measurement saved successfully!" : "Failed to save measurement"
      );
    } catch {
      showToast("Error saving measurement");
    }
  };

  const handleSelectMeasurement = async (name) => {
    setSelected(name);
    const m = measurements.find((x) => x.name === name);
    if (m) await loadMeasurementData(selectedCustomer?.id, m);
  };

  const handleSelectCustomer = async (c) => {
    setSelectedCustomer(c);
    setSearchCustomer(`${c.first_name || ""} ${c.second_name || ""}`.trim());
    setDropdownVisible(false);
    try {
      if (measurements.length) {
        const first = measurements[0];
        setSelected(first.name);
        await loadMeasurementData(c.id, first);
      } else {
        setAttributes([]);
        setAttributeValues({});
        setNotes("");
      }
    } catch (e) {
      console.error("Customer load error:", e);
    }
  };

  const filteredCustomers = customers.filter((c) =>
    `${(c.first_name || "")} ${(c.second_name || "")}`
      .toLowerCase()
      .includes(searchCustomer.toLowerCase())
  );

  return (
    <SafeAreaView className="flex-1 px-5" style={{ backgroundColor: theme.bg }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 80 }}
        >
          {/* Measurement Tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {(loading ? [...Array(6)] : measurements.filter((m) => m.is_active)).map(
              (m, i) =>
                loading ? (
                  <View
                    key={i}
                    className="w-28 h-10 rounded-full mr-2"
                    style={{ backgroundColor: theme.inputBg }}
                  />
                ) : (
                  <Chip
                    showSelectedCheck={false}
                    key={m.id}
                    selected={selected === m.name}
                    onPress={() => handleSelectMeasurement(m.name)}
                    style={{
                      backgroundColor:
                        selected === m.name ? theme.inputBg : "transparent",
                      marginRight: 8,
                      borderColor: theme.border,
                      borderWidth: 1,
                      height: 36,
                      borderRadius: 20,
                    }}
                    textStyle={{
                      color: selected === m.name ? theme.text : theme.muted,
                      fontFamily:
                        selected === m.name ? "SemiBold" : "Regular",
                      fontSize: 16,
                    }}
                  >
                    {m.name}
                  </Chip>
                )
            )}
          </ScrollView>

          {/* Customer Details */}
          <Text
            className="mt-5 text-lg font-[SemiBold]"
            style={{ color: theme.text }}
          >
            Customer Details
          </Text>

          {/* Customer Search */}
          <View className="mt-2 relative">
            <TextInput
              placeholder="Select Customer"
              value={searchCustomer}
              onChangeText={(t) => {
                setSearchCustomer(t);
                setDropdownVisible(true);
              }}
              onFocus={() => setDropdownVisible(true)}
              placeholderTextColor={theme.muted}
              className="w-full border rounded-lg p-3 text-sm font-[Regular]"
              style={{
                borderColor: theme.border,
                backgroundColor: theme.inputBg,
                color: theme.text,
              }}
            />
            {selectedCustomer && (
              <TouchableOpacity
                onPress={() => {
                  setSelectedCustomer(null);
                  setSearchCustomer("");
                }}
                className="absolute right-4 top-2.5"
              >
                <Text style={{ color: theme.muted, fontSize: 18 }}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Dropdown */}
          {dropdownVisible && (
            <ScrollView
              className="mt-1 rounded-lg max-h-40"
              style={{
                borderWidth: 1,
                borderColor: theme.border,
                backgroundColor: theme.card,
              }}
            >
              {filteredCustomers.length ? (
                filteredCustomers.map((i) => {
                  const name = `${(i.first_name || "").trim()} ${(i.second_name || "").trim()}`.trim();
                  return (
                    <TouchableOpacity
                      key={i.id}
                      onPress={() => handleSelectCustomer(i)}
                      className="p-3 border-b"
                      style={{ borderBottomColor: theme.border }}
                    >
                      <Text
                        className="font-[Regular]"
                        style={{ color: theme.text }}
                      >
                        {name}
                      </Text>
                    </TouchableOpacity>
                  );
                })
              ) : (
                <Text
                  className="p-3 font-[Regular]"
                  style={{ color: theme.muted }}
                >
                  No customers found
                </Text>
              )}
            </ScrollView>
          )}

          {/* Email + Phone */}
          {["email", "phone_number_1"].map((f) => (
            <TextInput
              key={f}
              value={selectedCustomer?.[f] || ""}
              editable={false}
              placeholder={f === "email" ? "Email" : "Phone Number"}
              placeholderTextColor={theme.muted}
              className="border rounded-lg p-3 mt-2 text-sm font-[Regular] opacity-80"
              style={{
                borderColor: theme.border,
                backgroundColor: theme.inputBg,
                color: theme.text,
              }}
            />
          ))}

          {/* Measurements Header */}
          <View className="mt-3 flex-row justify-between items-center">
            <Text
              className="text-lg font-[SemiBold]"
              style={{ color: theme.text }}
            >
              Measurements
            </Text>
            <Pressable
              onPress={() => actionSheetRef.current?.show()}
              className="border rounded-lg px-4 py-1"
              style={{
                borderColor: theme.border,
                backgroundColor: theme.inputBg,
              }}
            >
              <Text className="font-[Medium]" style={{ color: theme.text }}>
                Unit: {selectedUnit.name}
              </Text>
            </Pressable>
          </View>

          {/* Attributes */}
          {!loading &&
            attributes.map((a) => {
              const key = a.detail_id || a.id;
              return (
                <TextInput
                  key={a.id}
                  placeholder={a.name}
                  keyboardType="numeric"
                  placeholderTextColor={theme.muted}
                  value={attributeValues[key]?.toString() || ""}
                  onChangeText={(v) =>
                    setAttributeValues((p) => ({ ...p, [key]: v }))
                  }
                  className="border rounded-lg p-3 mt-2 text-sm font-[Regular]"
                  style={{
                    borderColor: theme.border,
                    backgroundColor: theme.inputBg,
                    color: theme.text,
                  }}
                />
              );
            })}

          {/* Notes */}
          <TextInput
            placeholder="Enter Note"
            value={notes}
            onChangeText={setNotes}
            multiline
            textAlignVertical="top"
            numberOfLines={4}
            placeholderTextColor={theme.muted}
            className="border rounded-xl p-3 mt-3 text-base font-[Regular]"
            style={{
              borderColor: theme.border,
              backgroundColor: theme.inputBg,
              color: theme.text,
            }}
          />

          {/* Save Button */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleSaveMeasurement}
            className="rounded-lg py-3 mt-6"
            style={{ backgroundColor: theme.primary }}
          >
            <Text className="text-center text-white text-base font-[SemiBold]">
              Save Measurements
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Unit Selector */}
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
            className="text-lg font-[SemiBold] mb-3"
            style={{ color: theme.text }}
          >
            Select Unit
          </Text>
          <View className="flex-row flex-wrap mb-10">
            {units.map((u) => {
              const a = selectedUnit.id === u.id;
              return (
                <TouchableOpacity
                  key={u.id}
                  onPress={() => {
                    setSelectedUnit(u);
                    actionSheetRef.current?.hide();
                  }}
                  className="px-3 py-2 m-1 rounded-md border"
                  style={{
                    borderColor: a ? theme.secondary : theme.border,
                    backgroundColor: a ? theme.secondary + "20" : theme.inputBg,
                  }}
                >
                  <Text
                    className="font-medium"
                    style={{
                      color: a ? theme.secondary : theme.text,
                    }}
                  >
                    {u.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ActionSheet>
    </SafeAreaView>
  );
}
