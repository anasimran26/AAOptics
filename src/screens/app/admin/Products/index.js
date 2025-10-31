import React, { useState, useEffect } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, KeyboardAvoidingView,
  Platform, Image, Modal, TextInput, ActivityIndicator, TouchableWithoutFeedback
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Edit2 } from "lucide-react-native";
import Toast from "react-native-toast-message";
import * as ImagePicker from "expo-image-picker";
import { fetchProducts, createProducts, productToggle, updateProduct } from "../../../../api";
import { useCurrency } from "../../../../contexts/CurrencyContext";
import { useTheme } from "../../../../contexts/ThemeProvider";

const BASE_URL = "https://optical.aasols.com";

export default function Products() {
  const theme = useTheme();
  const { currency } = useCurrency();
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    name: "", item_code: "", stitching_cost: "",
    description: "", is_featured: false, image: null
  });

  const showToast = (text) => Toast.show({ type: "custom", text1: text });

  useEffect(() => { loadProducts(); }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await fetchProducts();
      const items = res?.data?.data?.data || res?.data?.data || [];
      setProducts(items);
    } catch {
      showToast("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const itemsPerPage = 8;
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const displayed = products.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const toggleActive = async (id) => {
    try {
      const res = await productToggle(id);
      if (res?.status) {
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, is_active: !p.is_active } : p))
        );
        showToast("Status updated");
      } else showToast("Failed to update status");
    } catch {
      showToast("Error toggling product");
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.7,
      });
      if (!result.canceled && result.assets?.[0])
        setForm((f) => ({ ...f, image: result.assets[0] }));
    } catch {
      showToast("Failed to pick image");
    }
  };

  const handleEdit = (p) => {
    setEditing(true);
    setEditId(p.id);
    setForm({
      name: p.name || "",
      item_code: p.item_code || "",
      stitching_cost: p.stitching_cost?.toString() || "",
      description: p.description || "",
      is_featured: !!p.is_featured,
      image: p.image ? { uri: `${BASE_URL}${p.image}` } : null,
    });
    setModalVisible(true);
  };

  const resetForm = () => {
    setForm({
      name: "", item_code: "", stitching_cost: "",
      description: "", is_featured: false, image: null
    });
    setEditing(false);
    setEditId(null);
  };

  const handleSave = async () => {
    if (!form.name || !form.item_code || !form.stitching_cost)
      return showToast("Please fill all required fields");

    const payload = new FormData();
    Object.entries({
      name: form.name,
      item_code: form.item_code,
      stitching_cost: form.stitching_cost,
      description: form.description,
      is_featured: form.is_featured ? 1 : 0,
    }).forEach(([k, v]) => payload.append(k, v));

    if (form.image?.uri?.startsWith("file")) {
      const ext = form.image.uri.split(".").pop().toLowerCase();
      payload.append("image", {
        uri: Platform.OS === "ios"
          ? form.image.uri.replace("file://", "")
          : form.image.uri,
        type: `image/${ext === "jpg" ? "jpeg" : ext}`,
        name: `product_${Date.now()}.${ext}`,
      });
    }

    try {
      setSaving(true);
      const res = editing
        ? await updateProduct(editId, payload)
        : await createProducts(payload);

      if (res?.status) {
        showToast(editing ? "Product updated!" : "Product added!");
        await loadProducts();
        setModalVisible(false);
        resetForm();
      } else {
        showToast(res?.message || "Operation failed");
      }
    } catch {
      showToast("Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  const renderSkeleton = () =>
    Array.from({ length: itemsPerPage }).map((_, i) => (
      <View key={i} className="flex-row items-center border-b border-gray-200 dark:border-gray-700">
        {[80, 180, 80, 80, 80].map((w, j) => (
          <View key={j} className="flex-1 items-center justify-center py-4">
            <View
              style={{
                width: w - 20,
                height: 14,
                borderRadius: 6,
                backgroundColor: theme.border,
                opacity: 0.4,
              }}
            />
          </View>
        ))}
      </View>
    ));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 80 }}>
          {/* Add Product Button */}
          <View className="items-end mb-3">
            <TouchableOpacity
              style={{ backgroundColor: theme.primary }}
              className="py-2.5 px-4 rounded-lg"
              onPress={() => { resetForm(); setModalVisible(true); }}
            >
              <Text style={{ color: "#fff", fontFamily: "Medium" }}>Add Product</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="border rounded-lg overflow-hidden"
            style={{ borderColor: theme.border }}
          >
            <View className="min-w-[700px]">
              <View
                className="flex-row border-b"
                style={{
                  backgroundColor: theme.card,
                  borderBottomColor: theme.border,
                }}
              >
                {[
                  ["Item Code", "w-[12%]"],
                  ["Product Name", "w-[30%]"],
                  ["Cost", "w-[20%]"],
                  ["Status", "w-[15%]"],
                  ["Action", "w-[15%]"],
                ].map(([title, width]) => (
                  <Text
                    key={title}
                    className={`${width} text-center py-3 text-sm`}
                    style={{
                      color: theme.text,
                      fontFamily: "SemiBold",
                      textTransform: "uppercase",
                    }}
                  >
                    {title}
                  </Text>
                ))}
              </View>

              {/* Rows */}
              {loading ? (
                renderSkeleton()
              ) : displayed.length ? (
                displayed.map((p) => (
                  <View
                    key={p.id}
                    className="flex-row items-center border-b"
                    style={{
                      borderBottomColor: theme.border,
                      backgroundColor: theme.bg,
                    }}
                  >
                    <Text
                      className="w-[12%] text-center py-3 text-sm"
                      style={{ color: theme.text, fontFamily: "Regular" }}
                    >
                      {p.item_code}
                    </Text>
                    <View className="w-[30%] flex-row items-center justify-center px-3 py-3">
                      {p.image ? (
                        <Image
                          source={{ uri: `${BASE_URL}${p.image}` }}
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 8,
                            marginRight: 8,
                          }}
                        />
                      ) : (
                        <View
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 8,
                            backgroundColor: theme.border,
                            marginRight: 8,
                          }}
                        />
                      )}
                      <Text
                        numberOfLines={1}
                        style={{
                          color: theme.text,
                          fontFamily: "Regular",
                          fontSize: 14,
                          flexShrink: 1,
                        }}
                      >
                        {p.name}
                      </Text>
                    </View>

                    {/* Cost */}
                    <Text
                      className="w-[20%] text-center py-3 text-sm"
                      style={{ color: theme.text, fontFamily: "Regular" }}
                    >
                      {currency}
                      {p.stitching_cost}
                    </Text>

                    {/* Status Switch */}
                    <View className="w-[15%] items-center justify-center py-3">
                      <TouchableOpacity onPress={() => toggleActive(p.id)}>
                        <View
                          className="w-12 h-6 rounded-full"
                          style={{
                            backgroundColor: p.is_active ? theme.primary : theme.border,
                          }}
                        >
                          <View
                            className="w-5 h-5 bg-white rounded-full absolute top-0.5"
                            style={{ [p.is_active ? "right" : "left"]: 2 }}
                          />
                        </View>
                      </TouchableOpacity>
                    </View>

                    {/* Action (Edit Button) */}
                    <View className="w-[15%] items-center justify-center py-3">
                      <TouchableOpacity onPress={() => handleEdit(p)}>
                        <Edit2 size={20} color={theme.primary} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              ) : (
                <Text
                  className="text-center py-5"
                  style={{ color: theme.muted, fontFamily: "Regular" }}
                >
                  No products found
                </Text>
              )}
            </View>
          </ScrollView>
          {totalPages > 1 && (
            <View className="flex-row justify-center items-center gap-4 mt-4">
              {["Prev", "Next"].map((btn) => {
                const isPrev = btn === "Prev";
                const disabled = isPrev ? page === 1 : page === totalPages;
                return (
                  <TouchableOpacity
                    key={btn}
                    disabled={disabled}
                    onPress={() => setPage((p) => p + (isPrev ? -1 : 1))}
                    style={{
                      backgroundColor: disabled ? theme.border : theme.primary,
                    }}
                    className="px-5 py-2 rounded-lg"
                  >
                    <Text style={{ color: "#fff", fontFamily: "Medium" }}>{btn}</Text>
                  </TouchableOpacity>
                );
              })}
              <Text style={{ color: theme.text, fontFamily: "Medium" }}>
                Page {page} of {totalPages}
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View className="flex-1 justify-center items-center bg-black/50">
            <TouchableWithoutFeedback>
              <View style={{ backgroundColor: theme.card }} className="w-[90%] rounded-lg p-4">
                <Text style={{ color: theme.text, fontFamily: "SemiBold" }} className="text-lg mb-3">
                  {editing ? "Edit Product" : "Add Product"}
                </Text>

                <TouchableOpacity
                  onPress={pickImage}
                  style={{ borderColor: theme.border, backgroundColor: theme.inputBg }}
                  className="border mt-4 p-4 rounded-lg flex-row justify-center items-center"
                >
                  {form.image ? (
                    <Image source={{ uri: form.image.uri }} style={{ width: 80, height: 80, borderRadius: 8 }} />
                  ) : (
                    <Text style={{ color: theme.muted, fontFamily: "Regular", fontSize: 13 }}>
                      Tap to upload product image
                    </Text>
                  )}
                </TouchableOpacity>

                {[
                  ["Product Name", "name"],
                  ["Item Code", "item_code", "numeric"],
                  ["Cost", "stitching_cost", "numeric"],
                  ["Description", "description", "default", true],
                ].map(([ph, key, kb, multi], i) => (
                  <TextInput
                    key={i}
                    placeholder={ph}
                    value={form[key]}
                    onChangeText={(t) => setForm({ ...form, [key]: t })}
                    keyboardType={kb}
                    multiline={multi}
                    style={{
                      borderColor: theme.border,
                      backgroundColor: theme.inputBg,
                      color: theme.text,
                      fontFamily: "Regular",
                    }}
                    className="border mt-4 p-3 rounded-lg text-sm"
                    placeholderTextColor={theme.muted}
                  />
                ))}

                {/* Featured Switch */}
                <View className="flex-row justify-between items-center mt-3">
                  <Text style={{ color: theme.text, fontFamily: "Regular" }} className="text-sm">
                    Is Featured?
                  </Text>
                  <TouchableOpacity onPress={() => setForm({ ...form, is_featured: !form.is_featured })}>
                    <View
                      className="w-12 h-6 rounded-full"
                      style={{ backgroundColor: form.is_featured ? theme.primary : theme.border }}
                    >
                      <View
                        className="w-5 h-5 bg-white rounded-full absolute top-0.5"
                        style={{ [form.is_featured ? "right" : "left"]: 2 }}
                      />
                    </View>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  onPress={handleSave}
                  disabled={saving}
                  style={{ backgroundColor: theme.primary }}
                  className="py-3 rounded-lg mt-6"
                >
                  {saving ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={{ color: "#fff", fontFamily: "SemiBold" }} className="text-center">
                      {editing ? "Update Product" : "Save Product"}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}
