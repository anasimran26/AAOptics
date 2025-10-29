import axios from "axios";

const BASE_URL = "https://optical.aasols.com/api";

let authToken = null;

const client = axios.create({
    baseURL: BASE_URL,
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
    },
    timeout: 30000,
});

client.interceptors.request.use(
    (config) => {

        if (authToken) {
            config.headers.Authorization = `Bearer ${authToken}`;
        }
        return config;
    },
    (err) => {
        console.log("[axios request error]", err);
        return Promise.reject(err);
    }
);

client.interceptors.response.use(
    (res) => {
        console.log(
            "[axios response]",
            res.status,
            res.config.method?.toUpperCase(),
            res.config.url
        );
        return res;
    },
    (err) => {
        console.log(
            "[axios error]",
            err.response?.status,
            err.response?.data,
            "request method:",
            err.config?.method?.toUpperCase(),
            "request url:",
            err.config?.url
        );
        return Promise.reject(err);
    }
);

// 🔹 Helpers
export function setAuthToken(token) {
    authToken = token;
    client.defaults.headers.common.Authorization = `Bearer ${token}`;
}
export function clearAuthToken() {
    authToken = null;
    delete client.defaults.headers.common.Authorization;
}
function handleResponse(promise) {
    return promise.then((res) => res.data);
}

// ----------------------
// Auth API
// ----------------------
const auth = {
    login: (payload) => handleResponse(client.post("/login", payload)),
    signup: (payload) => handleResponse(client.post("/register", payload)),
    logout: () => handleResponse(client.post("/logout")),
};

// ----------------------
// Export
// ----------------------
export { client };
export default { auth };

//----------------------


// Sliders
export const fetchSliders = () => handleResponse(client.get("/admin/sliders"));

// sales
export const fetchSales = () => handleResponse(client.get("/admin/sales"));

// Dashboard
export const fetchDashboard = () => handleResponse(client.get("/admin/dashboard"));

// Customers
export const fetchCustomers = () => handleResponse(client.get("/admin/customers"));

// Customers Create
export const createCustomer = (payload) => handleResponse(client.post("/admin/customers/create", payload));

// Customer Toggle
export const customerToggle = (id) => handleResponse(client.patch(`/admin/customers/${id}/toggle`));

// Show Customer 
export const showCustomer = (id) => handleResponse(client.get(`/admin/customers/${id}/view`));

// Update Customer 
export const updateCustomer = (id, payload) => handleResponse(client.put(`admin/customers/update/${id}`, payload));

// Measurements
export const fetchMeasurements = () => handleResponse(client.get("/admin/measurements"));

// Measurement with Attributes
export const fetchMeasurementAttributes = (id) => handleResponse(client.get(`/admin/customers/measurements/${id}/attributes`));

// Customer Measurement Details
export const fetchCustomerMeasurementDetails = (customerId, measurementId) => handleResponse(client.get(`/admin/customers/${customerId}/measurements/${measurementId}`));

// Save Customer Measurement
export const saveCustomerMeasurement = (customerId, payload) => handleResponse(client.post(`/admin/customers/${customerId}/measurements/create`, payload));

// Invoice Setting
export const fetchInvoiceSetting = () => handleResponse(client.get("/admin/settings/invoice"));

// Create Invoice Setting
export const createInvoiceSetting = (payload) => handleResponse(client.post("/admin/settings/invoice/create", payload));

// Measurement Types
export const fetchMeasurementTypes = () => handleResponse(client.get("/admin/measurements"));

// Measurement Types Toggle
export const measurementTypeToggle = (id) => handleResponse(client.patch(`/admin/measurements/${id}/toggle`));

// Measurement Types Create 
export const measurementTypeCreate = (payload) => handleResponse(client.post("/admin/measurements/create", payload));

// Measurement Types Update 
export const measurementTypeUpdate = (id, payload) => handleResponse(client.put(`/admin/measurements/${id}/update`, payload));             

// Measurement Setting
export const fetchMeasurementSetting = () => handleResponse(client.get("/admin/settings/measurements"));

// Create Measurement Setting
export const createMeasurementSetting = (payload) => handleResponse(client.post("/admin/settings/measurements/create", payload));

// Show Measurement Setting
export const fetchShowMeasurement = (id) => handleResponse(client.get(`/admin/settings/measurements/${id}/show`));

// Update Measurement Setting
export const updateMeasurement = (id, payload) => handleResponse(client.put(`/admin/settings/measurements/${id}/update`, payload));

// Toggle Measurement Setting
export const toggleMeasurement = (id) => handleResponse(client.patch(`/admin/settings/measurements/${id}/toggle`));

