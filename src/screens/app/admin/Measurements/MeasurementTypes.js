import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import {
  fetchMeasurementTypes,
  fetchMeasurementSetting,
  measurementTypeToggle,
  measurementTypeCreate,
  fetchMeasurementAttributes,
} from "../../../../api";
import { useTheme } from "../../../../contexts/ThemeProvider";

export default function MeasurementTypes() {
  const theme = useTheme();
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [name, setName] = useState("");
  const [active, setActive] = useState(true);
  const [attributes, setAttributes] = useState([]);
  const [selectedAttrs, setSelectedAttrs] = useState({});
  const [page, setPage] = useState(1);
  const itemsPerPage = 9;

  // Toast helper
  const showToast = (msg) => {
    Toast.show({
      type: "custom",
      text1: msg,
      position: "top",
      visibilityTime: 2500,
    });
  };

  // Fetch attributes on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await fetchMeasurementSetting();
        setAttributes(res || []);
      } catch (e) {
        console.log(e);
      }
    })();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchMeasurementTypes();
      setTypes(res?.data?.data || res?.data || []);
    } catch (e) {
      console.log(e);
      showToast("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggleAttr = (id) =>
    setSelectedAttrs((prev) => ({ ...prev, [id]: !prev[id] }));

  const toggle = async (id) => {
    try {
      setTypes((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, is_active: t.is_active ? 0 : 1 } : t
        )
      );
      await measurementTypeToggle(id);
      showToast("Status updated");
    } catch {
      showToast("Failed to update status");
    }
  };

  const save = async () => {
    if (!name.trim()) return showToast("Name is required");

    const hasSelected = Object.values(selectedAttrs).some((v) => v);
    if (!hasSelected)
      return showToast("Please select at least one attribute");

    const payload = {
      name: name.trim(),
      is_active: active ? 1 : 0,
      selected_attributes: selectedAttrs,
    };

    try {
      const res = await measurementTypeCreate(payload);
      const measurement = res?.data?.measurement || res?.data;
      const selectedIds = Object.keys(selectedAttrs).filter(
        (id) => selectedAttrs[id]
      );

      setTypes((prev) => [
        {
          id: measurement.id,
          name: measurement.name,
          is_active: measurement.is_active,
          selected_attributes: selectedIds.map((id) => ({
            id: Number(id),
            name:
              attributes.find((a) => a.id === Number(id))?.name || "Unknown",
          })),
        },
        ...prev,
      ]);

      showToast("Added successfully");
      setModalVisible(false);
      resetForm();
    } catch (e) {
      console.log("❌ Save error:", e);
      showToast("Failed to save");
    }
  };

  const resetForm = () => {
    setName("");
    setActive(true);
    setSelectedAttrs({});
  };

  const view = async (id) => {
    try {
      const type = types.find((t) => t.id === id);
      if (!type) return showToast("Item not found");

      setName(type.name);
      setActive(type.is_active === 1);

      const res = await fetchMeasurementAttributes(id);
      const measurementAttributes = res?.data?.attributes || [];
      const preSelectedAttrs = {};
      attributes.forEach(
        (a) =>
        (preSelectedAttrs[a.id] = measurementAttributes.some(
          (ma) => ma.id === a.id
        ))
      );
      setSelectedAttrs(preSelectedAttrs);
      setViewModalVisible(true);
    } catch (e) {
      console.log(e);
      showToast("Failed to fetch attributes");
    }
  };

  const filteredAttributes = attributes.filter((a) => a.is_active === 1);
  const totalPages = Math.ceil(types.length / itemsPerPage);
  const displayedTypes = types.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const renderSkeleton = () => (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <View
          key={i}
          className="flex-row border-t"
          style={{ borderColor: theme.border }}
        >
          {Array.from({ length: 3 }).map((__, j) => (
            <View
              key={j}
              className="w-36 px-3 py-4"
              style={{ justifyContent: "center" }}
            >
              <View
                className="rounded-full animate-pulse"
                style={{
                  height: 12,
                  width: j === 3 ? 20 : 80,
                  backgroundColor: theme.border,
                }}
              />
            </View>
          ))}
        </View>
      ))}
    </>
  );

  const renderTypeRow = (t, i) => (
    <View
      key={t.id || i}
      className="flex-row border-t items-center"
      style={{ borderColor: theme.border }}
    >
      <View className="w-40 px-4 py-3">
        <Text
          style={{
            color: theme.text,
            fontFamily: "Regular",
          }}
        >
          {t.name}
        </Text>
      </View>

      <View className="w-32 px-5 py-3">
        <TouchableOpacity onPress={() => toggle(t.id)}>
          <View
            className="w-12 h-6 rounded-full"
            style={{
              backgroundColor: t.is_active ? theme.primary : theme.border,
            }}
          >
            <View
              className="w-5 h-5 bg-white rounded-full absolute top-0.5"
              style={{
                [t.is_active ? "right" : "left"]: 2,
              }}
            />
          </View>
        </TouchableOpacity>
      </View>

      <View className="w-24 px-5 py-3 items-center justify-center">
        <TouchableOpacity onPress={() => view(t.id)}>
          <Ionicons name="eye-outline" size={22} color={theme.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView
      className="flex-1 px-4"
      style={{ backgroundColor: theme.bg }}
    >
      {/* Add Button */}
      <View className="items-end mb-2">
        <TouchableOpacity
          style={{ backgroundColor: theme.primary }}
          className="py-2 px-3 rounded-lg"
          onPress={() => {
            resetForm();
            setModalVisible(true);
          }}
        >
          <Text
            className="text-lg text-white"
            style={{ fontFamily: "SemiBold" }}
          >
            Add Type
          </Text>
        </TouchableOpacity>
      </View>

      {/* Table */}
      <View
        className="border rounded-lg overflow-hidden mb-4 mt-2"
        style={{ borderColor: theme.border }}
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            <View
              className="flex-row"
              style={{ backgroundColor: theme.card }}
            >
              <Text
                className="w-40 px-4 py-3"
                style={{
                  color: theme.text,
                  fontFamily: "Bold",
                }}
              >
                Name
              </Text>
              <Text
                className="w-32 px-4 py-3"
                style={{
                  color: theme.text,
                  fontFamily: "Bold",
                }}
              >
                Status
              </Text>
              <Text
                className="w-24 px-5 py-3"
                style={{
                  color: theme.text,
                  fontFamily: "Bold",
                }}
              >
                Action
              </Text>
            </View>
            {loading ? renderSkeleton() : displayedTypes.map(renderTypeRow)}
          </View>
        </ScrollView>
      </View>

      {/* Pagination */}
      {totalPages > 1 && (
        <View className="flex-row justify-center items-center gap-5 my-4">
          <TouchableOpacity
            disabled={page === 1}
            onPress={() => setPage(page - 1)}
            style={{
              backgroundColor:
                page === 1 ? theme.border : theme.primary,
            }}
            className="px-6 py-2 rounded-xl"
          >
            <Text
              className="text-white text-base"
              style={{ fontFamily: "Medium" }}
            >
              Prev
            </Text>
          </TouchableOpacity>

          <View
            className="px-4 py-2 rounded-lg border"
            style={{
              backgroundColor: theme.card,
              borderColor: theme.border,
            }}
          >
            <Text
              style={{
                color: theme.text,
                fontFamily: "Medium",
              }}
            >
              Page {page} of {totalPages}
            </Text>
          </View>

          <TouchableOpacity
            disabled={page === totalPages}
            onPress={() => setPage(page + 1)}
            style={{
              backgroundColor:
                page === totalPages ? theme.border : theme.primary,
            }}
            className="px-6 py-2 rounded-xl"
          >
            <Text
              className="text-white text-base"
              style={{ fontFamily: "Medium" }}
            >
              Next
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Add Modal */}
      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View className="flex-1 justify-center items-center bg-black/50">
            <TouchableWithoutFeedback>
              <View
                className="w-[90%] rounded-lg p-4"
                style={{ backgroundColor: theme.card }}
              >
                <Text
                  className="text-lg mb-3"
                  style={{
                    color: theme.text,
                    fontFamily: "SemiBold",
                  }}
                >
                  Add Measurement Type
                </Text>

                <TextInput
                  placeholder="Name"
                  placeholderTextColor={theme.muted}
                  value={name}
                  onChangeText={setName}
                  className="border rounded px-3 py-2 mb-4"
                  style={{
                    backgroundColor: theme.inputBg,
                    borderColor: theme.border,
                    color: theme.text,
                    fontFamily: "Regular",
                  }}
                />

                {/* Attributes */}
                <ScrollView className="max-h-56 mb-4">
                  <View className="flex-row flex-wrap">
                    {filteredAttributes.map((attr) => (
                      <TouchableOpacity
                        key={attr.id}
                        onPress={() => toggleAttr(attr.id)}
                        className="w-[48%] m-[1%] border rounded-lg px-3 py-2 flex-row items-center justify-between"
                        style={{
                          borderColor: selectedAttrs[attr.id]
                            ? theme.primary
                            : theme.border,
                          backgroundColor: selectedAttrs[attr.id]
                            ? theme.primary + "20"
                            : theme.card,
                        }}
                      >
                        <Text
                          style={{
                            color: theme.text,
                            fontFamily: "Regular",
                          }}
                        >
                          {attr.name}
                        </Text>
                        <Ionicons
                          name={
                            selectedAttrs[attr.id]
                              ? "checkbox-outline"
                              : "square-outline"
                          }
                          size={20}
                          color={
                            selectedAttrs[attr.id]
                              ? theme.primary
                              : theme.muted
                          }
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>

                {/* Status toggle */}
                <TouchableOpacity
                  onPress={() => setActive(!active)}
                  className="flex-row items-center mb-4"
                >
                  <View
                    className="w-12 h-6 rounded-full p-1"
                    style={{
                      backgroundColor: active
                        ? theme.primary
                        : theme.border,
                    }}
                  >
                    <View
                      className="w-5 h-5 bg-white rounded-full absolute top-0.5"
                      style={{
                        [active ? "right" : "left"]: 2,
                      }}
                    />
                  </View>
                  <Text
                    className="ml-3"
                    style={{
                      color: theme.text,
                      fontFamily: "Regular",
                    }}
                  >
                    {active ? "Active" : "Inactive"}
                  </Text>
                </TouchableOpacity>

                {/* Save button */}
                <TouchableOpacity
                  onPress={save}
                  className="py-2 rounded-lg"
                  style={{ backgroundColor: theme.primary }}
                >
                  <Text
                    className="text-center text-white"
                    style={{ fontFamily: "SemiBold" }}
                  >
                    Save Measurement Type
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* View Modal */}
      <Modal
        animationType="slide"
        transparent
        visible={viewModalVisible}
        onRequestClose={() => setViewModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setViewModalVisible(false)}>
          <View className="flex-1 justify-center items-center bg-black/50">
            <TouchableWithoutFeedback>
              <View
                className="w-[90%] rounded-lg p-4"
                style={{ backgroundColor: theme.card }}
              >
                <Text
                  className="text-lg mb-3"
                  style={{
                    color: theme.text,
                    fontFamily: "SemiBold",
                  }}
                >
                  View Measurement Type
                </Text>

                <TextInput
                  value={name}
                  editable={false}
                  className="border rounded px-3 py-2 mb-4"
                  style={{
                    backgroundColor: theme.inputBg,
                    borderColor: theme.border,
                    color: theme.text,
                    fontFamily: "Regular",
                  }}
                />

                <ScrollView className="max-h-56 mb-4">
                  <View className="flex-row flex-wrap">
                    {attributes
                      .filter((a) => a.is_active === 1)
                      .map((attr) => (
                        <View
                          key={attr.id}
                          className="w-[48%] m-[1%] border rounded-lg px-3 py-2 flex-row items-center justify-between"
                          style={{
                            borderColor: selectedAttrs[attr.id]
                              ? theme.primary
                              : theme.border,
                            backgroundColor: selectedAttrs[attr.id]
                              ? theme.primary + "20"
                              : theme.card,
                          }}
                        >
                          <Text
                            style={{
                              color: theme.text,
                              fontFamily: "Regular",
                            }}
                          >
                            {attr.name}
                          </Text>
                          <Ionicons
                            name={
                              selectedAttrs[attr.id]
                                ? "checkbox-outline"
                                : "square-outline"
                            }
                            size={20}
                            color={
                              selectedAttrs[attr.id]
                                ? theme.primary
                                : theme.muted
                            }
                          />
                        </View>
                      ))}
                  </View>
                </ScrollView>

                <View className="flex-row items-center mb-4">
                  <View
                    className="w-12 h-6 rounded-full p-1"
                    style={{
                      backgroundColor: active
                        ? theme.primary
                        : theme.border,
                    }}
                  >
                    <View
                      className="w-5 h-5 bg-white rounded-full absolute top-0.5"
                      style={{
                        [active ? "right" : "left"]: 2,
                      }}
                    />
                  </View>
                  <Text
                    className="ml-3"
                    style={{
                      color: theme.text,
                      fontFamily: "Regular",
                    }}
                  >
                    {active ? "Active" : "Inactive"}
                  </Text>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}
