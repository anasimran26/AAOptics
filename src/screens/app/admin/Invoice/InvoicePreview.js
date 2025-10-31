import React, { useRef } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import * as Print from "expo-print";
import * as FileSystem from "expo-file-system/legacy";
import * as MediaLibrary from "expo-media-library";
import Toast from "react-native-toast-message";
import { LinearGradient } from "expo-linear-gradient";
import { useCurrency } from "../../../../contexts/CurrencyContext";
import { useTheme } from "../../../../contexts/ThemeProvider";

export default function InvoicePreview({ route }) {
  const { customer, products, discount, notes, paidAmount } = route.params;
  const { currency } = useCurrency();
  const theme = useTheme();
  const invoiceRef = useRef();
  const subtotal = products.reduce((sum, p) => sum + p.stitching_cost * p.qty, 0);
  const discountValue = parseFloat(discount) || 0;
  const taxAmount = products.reduce((sum, p) => sum + (p.stitching_cost * p.qty * (p.tax || 0)) / 100, 0);
  const paid = parseFloat(paidAmount) || 0;
  const total = subtotal - discountValue + taxAmount;
  const balance = total - paid;
  const currentDate = new Date();
  const formattedDate = `${currentDate.getMonth() + 1}/${currentDate.getDate()}/${currentDate.getFullYear()}`;

  const customerName = customer
    ? `${(customer.first_name || "").trim()} ${(customer.second_name || "").trim()}`.trim()
    : "N/A";

  const showToast = (text) => Toast.show({ type: "custom", text1: text });

  const saveToGallery = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        showToast(" Permission denied to access gallery");
        return;
      }
      const base64 = await captureRef(invoiceRef, {
        format: "png",
        quality: 1,
        result: "base64",
      });
      const fileName = `Invoice_${Date.now()}.png`;
      const fileUri = `${FileSystem.cacheDirectory}${fileName}`;
      await FileSystem.writeAsStringAsync(fileUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });
      await MediaLibrary.saveToLibraryAsync(fileUri);
      showToast("Invoice saved to gallery!");
    } catch (error) {
      console.log("SAVE PNG ERROR", error);
      showToast(" Failed to save image");
    }
  };


  const shareInvoice = async () => {
    try {
      const base64 = await captureRef(invoiceRef, { format: "png", quality: 1, result: "base64" });

      const html = `
        <html>
          <head>
            <style>
              @page { margin: 0; }
              html, body { margin: 0; padding: 0; background: none; }
              img { display: block; width: 100%; height: auto; object-fit: contain; }
            </style>
          </head>
          <body>
            <img src="data:image/png;base64,${base64}" />
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });
      const customerName = (customer?.first_name || "Customer").replace(/\s+/g, "_");
      const fileName = `Invoice_${customerName}_${Date.now()}.pdf`;

      const newPath = FileSystem.documentDirectory + fileName;
      await FileSystem.moveAsync({ from: uri, to: newPath });

      await Sharing.shareAsync(newPath, {
        mimeType: "application/pdf",
        dialogTitle: "Share Invoice PDF",
      });
    } catch (error) {
      console.log("SHARE ERROR", error);
      showToast("Failed to Share PDF");
    }
  };

  return (
    <ScrollView
      className="flex-1 p-3"
      style={{ backgroundColor: theme.bg }}
      showsVerticalScrollIndicator={false}
    >

      {/* INVOICE CARD */}
      <View
        ref={invoiceRef}
        collapsable={false}
        className="mt-5 p-3 pt-5 pb-40 shadow-md"
        style={{
          backgroundColor: 'white',
        }}
      >
        {/* <Image
          source={require("../../../../../assets/unpaid.png")}
          style={{
            position: "absolute",
            right: 10,
            width: 62,
            height: 60,
            resizeMode: "contain",
            opacity: 0.08,
          }}
        /> */}

        {/* Logo */}
        {/* <View className="items-center">
          <Image
            source={require("../../../../../assets/Aahoster-1.png")}
            style={{ width: 80, height: 35, resizeMode: "contain" }}
          />
        </View> */}

        <Text
          className="text-center text-xs mt-1"
          style={{ color: theme.primary, fontFamily: "Bold" }}
        >
          INVOICE
        </Text>

        {/* Bill Info */}
        <View className="flex-row justify-between mt-2">
          <View className="flex-1">
            <Text style={{ fontFamily: "SemiBold", fontSize: 10 }}>
              Bill From:
            </Text>
            <Text style={{ fontFamily: "Regular", fontSize: 10 }}>
              AAOptics
            </Text>
            <Text style={{ fontFamily: "Regular", fontSize: 10 }}>
              {formattedDate}
            </Text>
          </View>

          <View className="flex-1 items-end">
            <Text style={{ fontFamily: "SemiBold", fontSize: 10 }}>
              Bill To:
            </Text>
            <Text style={{ fontFamily: "Regular", fontSize: 10 }}>
              {customerName}
            </Text>
            <Text style={{ fontFamily: "Regular", fontSize: 10 }}>
              {customer?.phone_number_1 || "N/A"}
            </Text>
          </View>
        </View>

        {/* Table Header */}
        <View
          className="flex-row rounded-t mt-3 py-1 px-2"
          style={{ backgroundColor: theme.primary }}
        >
          {["Item", "Qty", "Price", "Amount"].map((h, i) => (
            <Text
              key={i}
              className={`text-[10px] text-white`}
              style={{
                flex: i === 0 ? 2 : 1,
                textAlign: i === 0 ? "left" : i === 3 ? "right" : "center",
                fontFamily: "SemiBold",
              }}
            >
              {h}
            </Text>
          ))}
        </View>

        {/* Table Rows */}
        {products.map((item, index) => (
          <View
            key={index}
            className="flex-row border-b px-2 py-1"
            style={{ borderColor: theme.border }}
          >
            <Text
              style={{
                flex: 2,
                fontFamily: "Regular",
                fontSize: 9,
              }}
            >
              {item.name}
            </Text>
            <Text
              style={{
                flex: 1,
                textAlign: "center",

                fontFamily: "Regular",
                fontSize: 9,
              }}
            >
              {item.qty}
            </Text>
            <Text
              style={{
                flex: 1,
                textAlign: "center",

                fontFamily: "Regular",
                fontSize: 9,
              }}
            >
              {currency} {item.stitching_cost.toFixed(2)}
            </Text>
            <Text
              style={{
                flex: 1,
                textAlign: "right",

                fontFamily: "SemiBold",
                fontSize: 9,
              }}
            >
              {currency} {(item.qty * item.stitching_cost).toFixed(2)}
            </Text>
          </View>
        ))}

        {/* Totals */}
        <View className="mt-3">
          {[
            ["Subtotal", subtotal],
            ["Discount", -discountValue],
            ["Tax", taxAmount],
            ["Total", total],
            ["Paid", -paid],
            ["Balance", balance],
          ].map(([label, value], i) => (
            <View key={i} className="flex-row justify-between py-[2px]">
              <Text
                style={{
                  color:
                    label === "Total" || label === "Balance",
                  fontFamily: label === "Total" || label === "Balance" ? "SemiBold" : "Regular",
                  fontSize: 9,
                }}
              >
                {label}
              </Text>
              <Text
                style={{
                  color:
                    label === "Total" || label === "Balance"
                      ? theme.primary
                      : "#000",
                  fontFamily:
                    label === "Total" || label === "Balance"
                      ? "SemiBold"
                      : "Regular",
                  fontSize: 9,
                }}
              >
                {currency} {value.toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        {/* Notes */}
        {notes ? (
          <View className="mt-3">
            <Text
              style={{

                fontFamily: "SemiBold",
                fontSize: 9,
              }}
            >
              Notes:
            </Text>
            <Text
              style={{

                fontFamily: "Regular",
                fontSize: 9,
                lineHeight: 14,
              }}
            >
              {notes}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Buttons */}
      <View className="flex-row justify-between mt-4">
        {[
          ["Share Invoice", shareInvoice, theme.primary, "#fff"],
          ["Save Invoice", saveToGallery, theme.primary, "#fff"],
        ].map(([label, onPress, bgColor, textColor], i) => (
          <TouchableOpacity
            key={i}
            onPress={onPress}
            activeOpacity={0.85}
            className={`flex-1 py-3 rounded-xl ${i ? "ml-2" : "mr-2"}`}
            style={{ backgroundColor: bgColor }}
          >
            <Text
              className="text-center text-lg"
              style={{ color: textColor, fontFamily: "SemiBold" }}
            >
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>


    </ScrollView>
  );
}
