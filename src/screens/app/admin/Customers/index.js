import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    TextInput,
    Modal,
    TouchableWithoutFeedback,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Edit2 } from "lucide-react-native";
import Toast from "react-native-toast-message";
import { useTheme } from "../../../../contexts/ThemeProvider";
import {
    fetchCustomers,
    createCustomer,
    customerToggle,
    showCustomer,
    updateCustomer,
} from "../../../../api";

export default function Customers() {
    const theme = useTheme();

    const [customers, setCustomers] = useState([]);
    const [page, setPage] = useState(1);
    const itemsPerPage = 10;
    const [modalVisible, setModalVisible] = useState(false);
    const [custId, setCustId] = useState("");
    const [custName, setCustName] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [selectedId, setSelectedId] = useState(null);

    const showToast = (text) => Toast.show({ type: "custom", text1: text });

    useEffect(() => {
        const getCustomers = async () => {
            try {
                const res = await fetchCustomers();
                if (res.status && res.data?.data) setCustomers(res.data.data);
            } catch (e) {
                console.error("Error fetching customers:", e);
                showToast("Failed to fetch customers");
            } finally {
                setLoading(false);
            }
        };
        getCustomers();
    }, []);

    const totalPages = Math.ceil(customers.length / itemsPerPage);
    const displayed = customers.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    const toggleActive = async (id) => {
        try {
            const res = await customerToggle(id);
            if (res.status) {
                setCustomers((prev) =>
                    prev.map((c) => (c.id === id ? { ...c, is_active: !c.is_active } : c))
                );
                showToast("Customer status updated");
            } else showToast("Failed to update status");
        } catch (e) {
            console.error("Error toggling customer:", e);
            showToast("Error updating customer status");
        }
    };

    const resetForm = () => {
        setCustId("");
        setCustName("");
        setPhone("");
        setAddress("");
        setEditMode(false);
        setSelectedId(null);
    };

    const saveCustomer = async () => {
        if (!custId || !custName || !phone)
            return showToast("Please fill all required fields");
        try {
            const payload = {
                file_number: custId,
                first_name: custName,
                phone_number_1: phone,
                address,
                date: new Date().toISOString().split("T")[0],
            };

            if (editMode && selectedId) {
                const res = await updateCustomer(selectedId, payload);
                if (res.status) {
                    setCustomers((prev) =>
                        prev.map((c) =>
                            c.id === selectedId ? { ...c, ...payload } : c
                        )
                    );
                    showToast("Customer updated successfully");
                } else showToast("Failed to update customer");
            } else {
                const res = await createCustomer(payload);
                const newCustomer = {
                    ...payload,
                    id: res.data?.data?.id || Math.random(),
                };
                setCustomers((prev) => [newCustomer, ...prev]);
                showToast("Customer added successfully");
            }

            setModalVisible(false);
            resetForm();
        } catch (e) {
            console.error("Error saving customer:", e);
            showToast("Failed to save customer");
        }
    };

    const handleEdit = async (id) => {
        try {
            const res = await showCustomer(id);
            if ((res.status === 200 || res.status === true) && res.data) {
                const c = res.data.data || res.data;
                setSelectedId(id);
                setCustId(c.file_number?.toString() || "");
                setCustName(c.first_name || "");
                setPhone(c.phone_number_1 || "");
                setAddress(c.address || "");
                setEditMode(true);
                setModalVisible(true);
            } else {
                showToast("Failed to fetch customer details");
            }
        } catch (e) {
            console.error("Error fetching customer details:", e);
            showToast("Error fetching customer details");
        }
    };

    const renderSkeleton = () => (
        <>
            {Array.from({ length: 6 }).map((_, i) => (
                <View
                    key={i}
                    className="flex-row border-t"
                    style={{ borderColor: theme.border }}
                >
                    {Array.from({ length: 4 }).map((__, j) => (
                        <View
                            key={j}
                            className="w-32 px-4 py-3"
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

    const renderRow = (c) => (
        <View
            key={c.id}
            className="flex-row border-t"
            style={{ borderColor: theme.border }}
        >
            <View style={{ width: 160, paddingVertical: 12, paddingHorizontal: 16 }}>
                <Text style={{ color: theme.text, fontFamily: "Regular" }}>
                    {c.first_name} {c.second_name ?? ""}
                </Text>
            </View>
            <View style={{ width: 160, paddingVertical: 12, paddingHorizontal: 16 }}>
                <Text style={{ color: theme.text, fontFamily: "Regular" }}>
                    {c.phone_number_1}
                </Text>
            </View>
            <View
                style={{
                    width: 90,
                    paddingVertical: 12,
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <TouchableOpacity onPress={() => toggleActive(c.id)}>
                    <View
                        style={{
                            width: 40,
                            height: 22,
                            borderRadius: 12,
                            backgroundColor: c.is_active ? theme.primary : theme.border,
                            justifyContent: "center",
                        }}
                    >
                        <View
                            style={{
                                width: 18,
                                height: 18,
                                backgroundColor: "#fff",
                                borderRadius: 9,
                                position: "absolute",
                                top: 2,
                                left: c.is_active ? 20 : 2,
                            }}
                        />
                    </View>
                </TouchableOpacity>
            </View>
            <View
                style={{
                    width: 90,
                    paddingVertical: 12,
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <TouchableOpacity onPress={() => handleEdit(c.id)}>
                    <Edit2 size={20} color={theme.primary} />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView
            className="flex-1"
            style={{ backgroundColor: theme.bg }}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={{
                        paddingHorizontal: 14,
                        paddingBottom: 80,
                    }}
                    keyboardShouldPersistTaps="handled"
                >
                    <View className="items-end mb-3">
                        <TouchableOpacity
                            onPress={() => {
                                resetForm();
                                setModalVisible(true);
                            }}
                            style={{
                                backgroundColor: theme.primary,
                                paddingVertical: 10,
                                paddingHorizontal: 14,
                                borderRadius: 10,
                            }}
                        >
                            <Text
                                style={{
                                    color: "#fff",
                                    fontFamily: "SemiBold",
                                }}
                            >
                                Add Customer
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
                                    {["Name", "Contact", "Status", "Action"].map((h, i) => (
                                        <Text
                                            key={i}
                                            className="px-4 py-3"
                                            style={{
                                                width: i < 2 ? 160 : 90,
                                                color: theme.text,
                                                fontFamily: "SemiBold",
                                                textAlign: i > 1 ? "center" : "left",
                                            }}
                                        >
                                            {h}
                                        </Text>
                                    ))}
                                </View>

                                {loading ? renderSkeleton() : displayed.map(renderRow)}
                            </View>
                        </ScrollView>
                    </View>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <View className="flex-row justify-center items-center space-x-5">
                            <TouchableOpacity
                                disabled={page === 1}
                                onPress={() => setPage(page - 1)}
                                style={{
                                    backgroundColor:
                                        page === 1 ? theme.border : theme.primary,
                                    paddingVertical: 10,
                                    paddingHorizontal: 20,
                                    borderRadius: 10,
                                }}
                            >
                                <Text
                                    style={{
                                        color: "#fff",
                                        fontFamily: "Medium",
                                    }}
                                >
                                    Prev
                                </Text>
                            </TouchableOpacity>
                            <View
                                style={{
                                    backgroundColor: theme.card,
                                    borderColor: theme.border,
                                    borderWidth: 1,
                                    paddingHorizontal: 20,
                                    paddingVertical: 10,
                                    borderRadius: 10,
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
                                        page === totalPages
                                            ? theme.border
                                            : theme.primary,
                                    paddingVertical: 10,
                                    paddingHorizontal: 20,
                                    borderRadius: 10,
                                }}
                            >
                                <Text
                                    style={{
                                        color: "#fff",
                                        fontFamily: "Medium",
                                    }}
                                >
                                    Next
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Modal */}
                    <Modal
                        visible={modalVisible}
                        transparent
                        animationType="slide"
                        onRequestClose={() => setModalVisible(false)}
                    >
                        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                            <View className="flex-1 justify-center items-center bg-black/50">
                                <TouchableWithoutFeedback>
                                    <View
                                        className="w-[90%] rounded-2xl p-4"
                                        style={{
                                            backgroundColor: theme.card,
                                            borderColor: theme.border,
                                            borderWidth: 1,
                                        }}
                                    >
                                        <Text
                                            className="text-lg mb-3"
                                            style={{
                                                color: theme.text,
                                                fontFamily: "SemiBold",
                                            }}
                                        >
                                            {editMode ? "Edit Customer" : "Add Customer"}
                                        </Text>

                                        {/* Inputs */}
                                        {[["Customer ID", custId, setCustId, "numeric"],
                                        ["Customer Name", custName, setCustName],
                                        ["Phone Number", phone, setPhone, "phone-pad"]
                                        ].map(([ph, val, fn, kb], i) => (
                                            <TextInput
                                                key={i}
                                                placeholder={ph}
                                                value={val}
                                                onChangeText={fn}
                                                keyboardType={kb}
                                                style={{
                                                    backgroundColor: theme.inputBg,
                                                    borderColor: theme.border,
                                                    borderWidth: 1,
                                                    borderRadius: 10,
                                                    padding: 10,
                                                    marginTop: 10,
                                                    color: theme.text,
                                                    fontFamily: "Regular",
                                                }}
                                                placeholderTextColor={theme.muted}
                                            />
                                        ))}


                                        {/* Address */}
                                        <TextInput
                                            placeholder="Address"
                                            value={address}
                                            onChangeText={setAddress}
                                            style={{
                                                backgroundColor: theme.inputBg,
                                                borderColor: theme.border,
                                                borderWidth: 1,
                                                borderRadius: 10,
                                                padding: 10,
                                                marginTop: 10,
                                                color: theme.text,
                                                fontFamily: "Regular",
                                            }}
                                            placeholderTextColor={theme.muted}
                                        />

                                        {/* Save Button */}
                                        <TouchableOpacity
                                            onPress={saveCustomer}
                                            style={{
                                                backgroundColor: theme.primary,
                                                paddingVertical: 12,
                                                borderRadius: 10,
                                                marginTop: 16,
                                            }}
                                        >
                                            <Text
                                                style={{
                                                    color: "#fff",
                                                    textAlign: "center",
                                                    fontFamily: "SemiBold",
                                                }}
                                            >
                                                {editMode ? "Update Customer" : "Save Customer"}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </TouchableWithoutFeedback>
                            </View>
                        </TouchableWithoutFeedback>
                    </Modal>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
