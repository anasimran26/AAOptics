import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
const CurrencyContext = createContext();
export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context)
    throw new Error("useCurrency must be used within CurrencyProvider");
  return context;
};

//All  Currencies
// export const allCurrencies = [
//   "د.إ", "؋", "L", "֏", "ƒ", "Kz", "$", "ƒ", "₼", "KM", "৳",
//   "лв", ".د.ب", "FBu", "Bs.", "R$", "Nu.", "P", "Br", "FC", "CHF",
//   "¥", "₡", "Kč", "Fdj", "kr", "دج", "£", "€", "₾", "₵", "D", "FG",
//   "Q", "L", "kn", "G", "Ft", "Rp", "₪", "₹", "ع.د", "﷼", "د.ا", "KSh",
//   "៛", "CF", "₩", "د.ك", "₸", "₭", "ل.ل", "Rs", "ل.د", "د.م.", "Ar",
//   "ден", "Ks", "₮", "MOP$", "UM", "₨", "Rf", "MK", "RM", "MT", "₦",
//   "C$", "B/.", "S/", "K", "₱", "zł", "₲", "lei", "дин", "₽", "FRw",
//   "Le", "Sh.so.", "Db", "฿", "ЅМ", "m", "د.ت", "T$", "₺", "NT$", "Sh",
//   "₴", "USh", "$U", "so'm", "Bs", "₫", "VT", "WS$", "FCFA", "CFA", "₣",
//   "R", "ZK"
// ];

//Most useable Currencies
export const allCurrencies = ["$", "€", "£", "¥", "Rs", "₹", "₩", "₽", "₫", "₪", "₦", "฿", "₴", "C$", "R$", "₱", "CHF", "₡", "د.إ", "د.م.", "RM", "R"];

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState("Rs");
  useEffect(() => {
    const loadCurrency = async () => {
      try {
        const savedCurrency = await AsyncStorage.getItem("selectedCurrency");
        if (savedCurrency) {
          setCurrency(savedCurrency);
        }
      } catch (error) {
        console.error("Error loading currency:", error);
      }
    };
    loadCurrency();
  }, []);
  const updateCurrency = async (newCurrency) => {
    try {
      setCurrency(newCurrency);
      await AsyncStorage.setItem("selectedCurrency", newCurrency);
    } catch (error) {
      console.error("Error saving currency:", error);
    }
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency: updateCurrency, allCurrencies }}>
      {children}
    </CurrencyContext.Provider>
  );
};
