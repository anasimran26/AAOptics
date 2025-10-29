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
import { useTheme } from "../../../../contexts/ThemeProvider";
import {
  fetchMeasurementSetting,
  createMeasurementSetting,
  toggleMeasurement,
  fetchShowMeasurement,
  updateMeasurement,
} from "../../../../api";
import Toast from "react-native-toast-message";

export default function MeasurementAttributes() {
  const theme = useTheme();

  const [measurements, setMeasurements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editId, setEditId] = useState(null);
  const [name, setName] = useState("");
  const [active, setActive] = useState(true);
  const [page, setPage] = useState(1);
  const perPage = 9;

  const showToast = (t) => Toast.show({ type: "custom", text1: t });

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchMeasurementSetting();
      setMeasurements(res);
    } catch (e) {
      console.log(e);
      showToast("Failed to load data");
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const toggle = async (id) => {
    try {
      setMeasurements((p) =>
        p.map((m) => (m.id === id ? { ...m, is_active: m.is_active ? 0 : 1 } : m))
      );
      await toggleMeasurement(id);
      showToast("Status updated");
    } catch {
      showToast("Failed to update status");
    }
  };

  const save = async () => {
    if (!name.trim()) return showToast("Name is required");

    try {
      const payload = { name, is_active: active ? 1 : 0, created_by: 1 };

      if (editId) {
        await updateMeasurement(editId, payload);
        setMeasurements((p) =>
          p.map((m) => (m.id === editId ? { ...m, name, is_active: active ? 1 : 0 } : m))
        );
        showToast("Updated successfully");
      } else {
        const r = await createMeasurementSetting(payload);
        const d = r?.data?.data || r?.data || r;
        setMeasurements((p) => [{ id: d.id, name: d.name, is_active: d.is_active }, ...p]);
        showToast("Added successfully");
      }

      setModalVisible(false);
      setName("");
      setActive(true);
      setEditId(null);
    } catch {
      showToast("Failed to save");
    }
  };

  const edit = async (id) => {
    try {
      const r = await fetchShowMeasurement(id);
      const d = r?.data?.data || r?.data || r;
      setEditId(d.id);
      setName(d.name);
      setActive(d.is_active === 1);
      setModalVisible(true);
    } catch {
      showToast("Failed to load item");
    }
  };

  const totalPages = Math.ceil(measurements.length / perPage);
  const data = measurements.slice((page - 1) * perPage, page * perPage);

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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg, paddingHorizontal: 16 }}>
      {/* Add Button */}
      <View style={{ alignItems: "flex-end", marginBottom: 8 }}>
        <TouchableOpacity
          style={{
            backgroundColor: theme.primary,
            paddingVertical: 10,
            paddingHorizontal: 14,
            borderRadius: 10,
          }}
          onPress={() => setModalVisible(true)}
        >
          <Text style={{ fontSize: 16, fontFamily: "SemiBold", color: "#fff" }}>
            Add Attribute
          </Text>
        </TouchableOpacity>
      </View>

      {/* Table */}
      <View
        style={{
          borderWidth: 1,
          borderColor: theme.border,
          borderRadius: 10,
          overflow: "hidden",
          marginTop: 8,
          marginBottom: 16,
        }}
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            {/* Header */}
            <View style={{ flexDirection: "row", backgroundColor: theme.inputBg }}>
              <Text
                style={{
                  width: 160,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  color: theme.text,
                  fontFamily: "Bold",
                }}
              >
                Name
              </Text>
              <Text
                style={{
                  width: 100,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  color: theme.text,
                  fontFamily: "Bold",
                }}
              >
                Status
              </Text>
              <Text
                style={{
                  width: 80,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  color: theme.text,
                  fontFamily: "Bold",
                }}
              >
                Action
              </Text>
            </View>

            {/* Rows */}
            {loading ? (
              renderSkeleton()
            ) : (
              data.map((m, i) => (
                <View
                  key={m.id || i}
                  style={{
                    flexDirection: "row",
                    borderTopWidth: 1,
                    borderColor: theme.border,
                    alignItems: "center",
                  }}
                >
                  {/* Name */}
                  <View style={{ width: 160, paddingHorizontal: 16, paddingVertical: 12 }}>
                    <Text style={{ color: theme.text, fontFamily: "Regular" }}>{m.name}</Text>
                  </View>

                  {/* Status */}
                  <View style={{ width: 100, paddingHorizontal: 16, paddingVertical: 12 }}>
                    <TouchableOpacity onPress={() => toggle(m.id)}>
                      <View
                        style={{
                          width: 48,
                          height: 24,
                          borderRadius: 12,
                          backgroundColor: m.is_active ? theme.primary : theme.border,
                          justifyContent: "center",
                        }}
                      >
                        <View
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: 10,
                            backgroundColor: "#fff",
                            position: "absolute",
                            top: 2,
                            left: m.is_active ? 26 : 2,
                          }}
                        />
                      </View>
                    </TouchableOpacity>
                  </View>

                  {/* Action */}
                  <View
                    style={{
                      width: 80,
                      alignItems: "center",
                      justifyContent: "center",
                      paddingVertical: 12,
                    }}
                  >
                    <TouchableOpacity onPress={() => edit(m.id)}>
                      <Ionicons name="pencil-outline" size={22} color={theme.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </View>

      {/* Pagination */}
      {totalPages > 1 && (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            gap: 20,
            marginVertical: 16,
          }}
        >
          <TouchableOpacity
            disabled={page === 1}
            onPress={() => setPage(page - 1)}
            style={{
              paddingHorizontal: 24,
              paddingVertical: 8,
              borderRadius: 12,
              backgroundColor: page === 1 ? theme.border : theme.primary,
            }}
          >
            <Text style={{ color: "#fff", fontFamily: "Medium" }}>Prev</Text>
          </TouchableOpacity>

          <View
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              backgroundColor: theme.card,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: theme.border,
            }}
          >
            <Text style={{ color: theme.text, fontFamily: "Medium" }}>
              Page {page} of {totalPages}
            </Text>
          </View>

          <TouchableOpacity
            disabled={page === totalPages}
            onPress={() => setPage(page + 1)}
            style={{
              paddingHorizontal: 24,
              paddingVertical: 8,
              borderRadius: 12,
              backgroundColor: page === totalPages ? theme.border : theme.primary,
            }}
          >
            <Text style={{ color: "#fff", fontFamily: "Medium" }}>Next</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Modal */}
      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "rgba(0,0,0,0.5)",
            }}
          >
            <TouchableWithoutFeedback>
              <View
                style={{
                  width: "90%",
                  backgroundColor: theme.card,
                  borderRadius: 12,
                  padding: 16,
                }}
              >
                <Text
                  style={{
                    fontSize: 18,
                    fontFamily: "SemiBold",
                    color: theme.text,
                    marginBottom: 12,
                  }}
                >
                  {editId ? "Edit Attribute" : "Add Attribute"}
                </Text>

                {/* Name Input */}
                <TextInput
                  placeholder="Name"
                  placeholderTextColor={theme.muted}
                  value={name}
                  onChangeText={setName}
                  style={{
                    borderWidth: 1,
                    borderColor: theme.border,
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    marginBottom: 16,
                    backgroundColor: theme.inputBg,
                    color: theme.text,
                    fontFamily: "Regular",
                  }}
                />

                {/* Active Switch */}
                <TouchableOpacity
                  onPress={() => setActive(!active)}
                  style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}
                >
                  <View
                    style={{
                      width: 48,
                      height: 24,
                      borderRadius: 12,
                      backgroundColor: active ? theme.primary : theme.border,
                      justifyContent: "center",
                    }}
                  >
                    <View
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 10,
                        backgroundColor: "#fff",
                        position: "absolute",
                        top: 2,
                        left: active ? 26 : 2,
                      }}
                    />
                  </View>
                  <Text style={{ marginLeft: 12, color: theme.text, fontFamily: "Regular" }}>
                    {active ? "Active" : "Inactive"}
                  </Text>
                </TouchableOpacity>

                {/* Save Button */}
                <TouchableOpacity
                  onPress={save}
                  style={{
                    backgroundColor: theme.primary,
                    paddingVertical: 10,
                    borderRadius: 8,
                  }}
                >
                  <Text
                    style={{
                      textAlign: "center",
                      color: "#fff",
                      fontFamily: "SemiBold",
                      fontSize: 16,
                    }}
                  >
                    {editId ? "Update Attribute" : "Save Attribute"}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}
