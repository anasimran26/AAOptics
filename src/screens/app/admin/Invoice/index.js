import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from "react-native";
import Toast from "react-native-toast-message";
import { IconButton } from "react-native-paper";
import ProductCard from "../../../../components/ProductCard";
import { useCurrency } from "../../../../contexts/CurrencyContext";
import { fetchProducts, fetchCustomers, createInvoice } from "../../../../api";
import { useNavigation } from "@react-navigation/native";
import { useAds } from "../../../../contexts/ads/AdManager";
import { useTheme } from "../../../../contexts/ThemeProvider";

export default function Invoice() {
  const navigation = useNavigation();
  const theme = useTheme();
  const { currency } = useCurrency();

  const [searchCustomer, setSearchCustomer] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [notes, setNotes] = useState("");
  const [discount, setDiscount] = useState("");
  const [itemProducts, setItemProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchProduct, setSearchProduct] = useState("");
  const [paidAmount, setPaidAmount] = useState("");
  const [payMode, setPayMode] = useState("1");
  const [payModeLabel, setPayModeLabel] = useState("Cash");
  const [payDropdownVisible, setPayDropdownVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const showToast = (text) => Toast.show({ type: "custom", text1: text });
  const { showRewardedInterstitial } = useAds();

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const result = await fetchProducts();
        const allProducts = result.data.data || [];
        const activeProducts = allProducts.filter((p) => p.is_active === 1);
        setItemProducts(activeProducts);
      } catch (error) {
        console.log("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const result = await fetchCustomers();
        const activeCustomers = (result.data.data || []).filter(
          (c) => c.is_active === 1
        );
        setCustomers(activeCustomers);
      } catch (error) {
        console.log("Error fetching customers:", error);
      }
    };
    loadCustomers();
  }, []);

  const onWatchAd = async () => {
    try {
      const result = await showRewardedInterstitial();
      if (result.earned) {
        console.log("User earned:", result.reward);
      } else {
        console.log("No reward (ad closed or not granted)");
      }
    } catch (err) {
      console.warn("Rewarded ad failed:", err);
    }
  };

  const paymentOptions = [
    { label: "Cash", value: "1" },
    { label: "Card", value: "2" },
    { label: "UPI", value: "3" },
    { label: "Cheque", value: "4" },
    { label: "Bank Transfer", value: "5" },
  ];

  const handleSelectCustomer = (customer) => {
    const fullName = `${(customer.first_name || "").trim()} ${(customer.second_name || "").trim()}`.trim();
    setSelectedCustomer(customer);
    setSearchCustomer(fullName);
    setDropdownVisible(false);
  };

  const filteredCustomers = customers.filter((c) => {
    const fullName = `${(c.first_name || "").trim()} ${(c.second_name || "").trim()}`.trim();
    return fullName.toLowerCase().includes(searchCustomer.toLowerCase());
  });

  const filteredProducts = itemProducts.filter((p) =>
    p.name.toLowerCase().includes(searchProduct.toLowerCase())
  );

  const grossTotal = selectedProducts.reduce((acc, item) => {
    const tax = 15;
    const subtotal = item.stitching_cost * item.qty;
    const taxAmount = subtotal * (tax / 100);
    return acc + subtotal + taxAmount;
  }, 0);

  const handleSelectProduct = (product) => {
    setSelectedProducts((prev) => {
      if (prev.some((p) => p.id === product.id)) return prev;
      return [...prev, { ...product, qty: 1, tax: 15 }];
    });
  };

  const handleQtyChange = (id, qty) => {
    setSelectedProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, qty: qty === "" ? "" : Math.max(+qty || 1, 1) } : p
      )
    );
  };

  const handleRemoveProduct = (id) => {
    setSelectedProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleGenerateInvoice = async () => {
    if (!selectedCustomer) return showToast("Please select a customer");
    if (selectedProducts.length === 0)
      return showToast("Please add at least one product");

    const cart_items = selectedProducts.map((i) => ({
      product_id: i.id,
      quantity: i.qty,
      price: i.stitching_cost,
    }));

    const payload = {
      customer_id: selectedCustomer.id,
      salesman_id: 4,
      discount: parseFloat(discount) || 0,
      notes,
      paid_amount: parseFloat(paidAmount) || 0,
      pay_mode: parseInt(payMode),
      cart_items,
    };

    try {
      const res = await createInvoice(payload);
      await onWatchAd();
      showToast("Invoice created successfully!");
      navigation.navigate("InvoicePreview", {
        invoiceData: res.data,
        customer: selectedCustomer,
        products: selectedProducts,
        discount,
        notes,
        paidAmount,
      });
      setSelectedProducts([]);
      setDiscount("");
      setNotes("");
      setPaidAmount("");
    } catch (e) {
      console.log("Error creating invoice:", e);
      showToast("Failed to create invoice");
    }
  };

  return (
    <View
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
            marginTop: 25,
          }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Customer Selection */}
          <View className="mb-3 px-1">
            <View className="flex-row gap-3 items-center">
              <View className="flex-1 relative">
                <TextInput
                  placeholder="Select Customer"
                  value={searchCustomer}
                  editable={true}
                  onChangeText={(text) => {
                    setSearchCustomer(text);
                    setDropdownVisible(true);
                  }}
                  onFocus={() => setDropdownVisible(true)}
                  className="w-full border p-3 rounded-xl text-sm"
                  style={{
                    backgroundColor: theme.inputBg,
                    borderColor: theme.border,
                    color: theme.text,
                    fontFamily: "Regular",
                    fontSize: 14,
                  }}
                  placeholderTextColor={theme.muted}
                />
                {searchCustomer.length > 0 && (
                  <Pressable
                    onPress={() => {
                      setSearchCustomer("");
                      setSelectedCustomer(null);
                      setDropdownVisible(false);
                    }}
                    className="absolute right-4 top-2"
                  >
                    <Text style={{ color: theme.muted, fontSize: 18 }}>✕</Text>
                  </Pressable>
                )}
              </View>

              {!selectedCustomer && (
                <Pressable
                  onPress={() => navigation.navigate("Customers")}
                  className="px-4 py-2 rounded-xl items-center justify-center"
                  style={{ backgroundColor: theme.primary }}
                >
                  <Text
                    style={{
                      color: "#fff",
                      fontFamily: "SemiBold",
                      fontSize: 14,
                    }}
                  >
                    Add
                  </Text>
                </Pressable>
              )}
            </View>

            {dropdownVisible && (
              <ScrollView
                className="mt-1 rounded-lg"
                style={{
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                  borderWidth: 1,
                  maxHeight: 160,
                }}
                nestedScrollEnabled
              >
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((item) => {
                    const fullName = `${(item.first_name || "").trim()} ${(item.second_name || "").trim()}`.trim();
                    return (
                      <TouchableOpacity
                        key={item.id}
                        onPress={() => handleSelectCustomer(item)}
                        className="p-3 border-b"
                        style={{ borderColor: theme.border }}
                      >
                        <Text
                          style={{
                            color: theme.text,
                            fontFamily: "Regular",
                          }}
                        >
                          {fullName}
                        </Text>
                      </TouchableOpacity>
                    );
                  })
                ) : (
                  <View className="h-6 w-[90%] mt-3 ml-4 rounded-lg bg-gray-300 dark:bg-gray-700 animate-pulse"></View>
                )}
              </ScrollView>
            )}
          </View>

          {/* Product Selection */}
          <Text
            className="px-1 my-1 text-[18px]"
            style={{
              color: theme.text,
              fontFamily: "SemiBold",
            }}
          >
            Select Product
          </Text>

          <View className="my-2 px-1">
            <TextInput
              placeholder="Search Product"
              value={searchProduct}
              onChangeText={setSearchProduct}
              className="border p-3 rounded-xl text-sm"
              style={{
                backgroundColor: theme.inputBg,
                borderColor: theme.border,
                color: theme.text,
                fontFamily: "Regular",
              }}
              placeholderTextColor={theme.muted}
            />
          </View>

          <View
            className="rounded-xl my-1"
            style={{ maxHeight: 185 }}
          >
            <ScrollView nestedScrollEnabled>
              {loading
                ? [1, 2, 3, 4].map((_, i) => (
                  <ProductCard key={i} loading={true} />
                ))
                : filteredProducts.map((item) => (
                  <ProductCard
                    key={item.id}
                    product={item}
                    onPress={() => handleSelectProduct(item)}
                  />
                ))}
            </ScrollView>
          </View>

          {/* Product Table */}
          <View
            className="rounded-xl overflow-hidden mb-4 mt-2"
            style={{ borderWidth: 1, borderColor: theme.border }}
          >
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View>
                <View
                  className="flex-row"
                  style={{ backgroundColor: theme.inputBg }}
                >
                  {["Name", "Price", "Qty", "Tax%", "Tax Amt", "Total"].map(
                    (h, i) => (
                      <Text
                        key={i}
                        className="py-3 text-left"
                        style={{
                          width:
                            i === 0
                              ? 160
                              : i === 1
                                ? 100
                                : i === 2
                                  ? 70
                                  : i === 3
                                    ? 80
                                    : 100,
                          paddingHorizontal: 10,
                          color: theme.text,
                          fontFamily: "SemiBold",
                          fontSize: 13,
                        }}
                      >
                        {h}
                      </Text>
                    )
                  )}
                </View>

                {selectedProducts.map((item) => {
                  const taxPercent = 15;
                  const subtotal = item.stitching_cost * item.qty;
                  const taxAmount = subtotal * (taxPercent / 100);
                  const total = subtotal + taxAmount;

                  return (
                    <View
                      key={item.id}
                      className="flex-row border-t"
                      style={{ borderColor: theme.border }}
                    >
                      <Text
                        className="px-3 py-3"
                        style={{
                          width: 160,
                          color: theme.text,
                          fontFamily: "Regular",
                        }}
                      >
                        {item.name}
                      </Text>
                      <Text
                        className="px-3 py-3"
                        style={{
                          width: 100,
                          color: theme.text,
                          fontFamily: "Regular",
                        }}
                      >
                        {currency}
                        {item.stitching_cost}
                      </Text>

                      <View
                        className="py-2 justify-center items-start"
                        style={{ width: 70 }}
                      >
                        <TextInput
                          value={item.qty.toString()}
                          keyboardType="numeric"
                          onChangeText={(val) => handleQtyChange(item.id, val)}
                          className="rounded text-center"
                          style={{
                            borderColor: theme.border,
                            borderWidth: 1,
                            color: theme.text,
                            width: 40,
                            height: 35,
                            fontSize: 11,
                            fontFamily: "Regular",
                          }}
                        />
                      </View>

                      <Text
                        className="px-3 py-3"
                        style={{
                          width: 80,
                          color: theme.text,
                          fontFamily: "Regular",
                        }}
                      >
                        {taxPercent}%
                      </Text>

                      <Text
                        className="px-3 py-3"
                        style={{
                          width: 100,
                          color: theme.text,
                          fontFamily: "Regular",
                        }}
                      >
                        {currency}
                        {taxAmount.toFixed(2)}
                      </Text>

                      <Text
                        className="px-3 py-3"
                        style={{
                          width: 100,
                          color: theme.text,
                          fontFamily: "Medium",
                        }}
                      >
                        {currency}
                        {total.toFixed(2)}
                      </Text>

                      <View className="w-12 items-center justify-center">
                        <IconButton
                          icon="trash-can"
                          size={20}
                          iconColor="#ef4444"
                          onPress={() => handleRemoveProduct(item.id)}
                        />
                      </View>
                    </View>
                  );
                })}
              </View>
            </ScrollView>
          </View>

          {/* Totals Section */}
          <View className="mb-6">
            <View
              className="flex-row items-center rounded-xl"
              style={{
                borderWidth: 1,
                borderColor: theme.border,
                backgroundColor: theme.inputBg,
              }}
            >
              <TextInput
                placeholder="Enter Paid Amount"
                keyboardType="numeric"
                value={paidAmount}
                onChangeText={(val) => {
                  const num = parseFloat(val) || 0;
                  if (num <= grossTotal) setPaidAmount(val);
                  else setPaidAmount(grossTotal.toFixed(2).toString());
                }}
                className="flex-1 p-3 text-sm"
                style={{
                  color: theme.text,
                  fontFamily: "Regular",
                }}
                placeholderTextColor={theme.muted}
              />
              <Text
                className="px-3"
                style={{ color: theme.text, fontFamily: "SemiBold" }}
              >
                {currency}
              </Text>
            </View>

            {/* Payment Method */}
            <View className="mt-4">
              <Pressable
                onPress={() => setPayDropdownVisible(!payDropdownVisible)}
                className="flex-row items-center border p-3 rounded-xl"
                style={{
                  borderColor: theme.border,
                  backgroundColor: theme.inputBg,
                }}
              >
                <Text
                  className="flex-1 text-sm"
                  style={{
                    color: theme.text,
                    fontFamily: "Regular",
                  }}
                >
                  {payModeLabel || "Select Payment Method"}
                </Text>
              </Pressable>

              {payDropdownVisible && (
                <View
                  className="mt-1 rounded-lg"
                  style={{
                    backgroundColor: theme.card,
                    borderColor: theme.border,
                    borderWidth: 1,
                  }}
                >
                  {paymentOptions.map((option, i) => (
                    <TouchableOpacity
                      key={option.value}
                      onPress={() => {
                        setPayMode(option.value);
                        setPayModeLabel(option.label);
                        setPayDropdownVisible(false);
                      }}
                      className="p-3 border-b"
                      style={{
                        borderColor:
                          i !== paymentOptions.length - 1 ? theme.border : "transparent",
                      }}
                    >
                      <Text
                        style={{
                          color: theme.text,
                          fontFamily: "Regular",
                        }}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Discount + Notes */}
            <View
              className="flex-row items-center rounded-xl mt-4"
              style={{
                borderWidth: 1,
                borderColor: theme.border,
                backgroundColor: theme.inputBg,
              }}
            >
              <TextInput
                placeholder="Enter Discount"
                keyboardType="numeric"
                value={discount}
                onChangeText={(val) => {
                  const num = parseFloat(val) || 0;
                  const remaining = grossTotal - (parseFloat(paidAmount) || 0);
                  if (num <= remaining) setDiscount(val);
                  else setDiscount(remaining.toFixed(2).toString());
                }}
                className="flex-1 p-3 text-sm"
                style={{
                  color: theme.text,
                  fontFamily: "Regular",
                }}
                placeholderTextColor={theme.muted}
              />
              <Text
                className="px-3"
                style={{ color: theme.text, fontFamily: "SemiBold" }}
              >
                {currency}
              </Text>
            </View>

            <TextInput
              placeholder="Enter Remarks"
              value={notes}
              onChangeText={setNotes}
              className="border mt-4 p-3 rounded-xl text-sm"
              style={{
                backgroundColor: theme.inputBg,
                borderColor: theme.border,
                color: theme.text,
                fontFamily: "Regular",
              }}
              placeholderTextColor={theme.muted}
              multiline
            />
          </View>

          {/* Buttons */}
          {selectedProducts.length > 0 && (
            <View className="flex-row justify-between mt-2">
              <TouchableOpacity
                activeOpacity={0.8}
                className="flex-1 py-3 rounded-xl mr-2"
                style={{ backgroundColor: theme.inputBg }}
                onPress={() => setSelectedProducts([])}
              >
                <Text
                  className="text-center text-lg"
                  style={{
                    color: theme.text,
                    fontFamily: "SemiBold",
                  }}
                >
                  Clear All
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                className="flex-1 py-3 rounded-xl ml-2"
                style={{ backgroundColor: theme.primary }}
                onPress={handleGenerateInvoice}
              >
                <Text
                  className="text-center text-lg text-white"
                  style={{ fontFamily: "SemiBold" }}
                >
                  Generate Invoice
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
