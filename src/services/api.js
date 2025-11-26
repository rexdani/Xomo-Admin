// src/services/api.js
import axios from "axios";

// Detect backend host dynamically for LAN access
const host = window.location.hostname; 
const BASE_URL = `http://${host}:8081`; // auto-connect PC IP from any device

console.log("🔗 Backend URL:", BASE_URL);

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

// attach token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("xomo_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

export default api;

export async function getDashboardStats() {
  const res = await api.get("/dashboard/stats");
  return res.data;
}

// PRODUCTS
export async function getProducts(params = {}) {
  // params: { categoryId, keyword }
  if (params.categoryId) {
    const res = await api.get(`/products/category/${params.categoryId}`);
    return res.data;
  }
  if (params.keyword) {
    const res = await api.get(`/products/search`, { params: { keyword: params.keyword } });
    return res.data;
  }
  const res = await api.get(`/products`);
  return res.data;
}

export async function getProductById(id) {
  const res = await api.get(`/products/${id}`);
  return res.data;
}

export async function createProduct(productData, imageFile) {
  const fd = new FormData();
  fd.append("data", JSON.stringify(productData));
  if (imageFile) fd.append("image", imageFile);
  const res = await api.post(`/products/add`, fd, { headers: { "Content-Type": "multipart/form-data" } });
  return res.data;
}

export async function updateProduct(id, productData, imageFile) {
  const fd = new FormData();
  fd.append("data", JSON.stringify(productData));
  if (imageFile) fd.append("image", imageFile);
  const res = await api.put(`/products/${id}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
  return res.data;
}

export async function deleteProduct(id) {
  const res = await api.delete(`/products/${id}`);
  return res.data;
}

export function getProductImageUrl(id) {
  return `${BASE_URL}/products/image/${id}`;
}

// CATEGORIES
export async function getCategories() {
  try {
    const res = await api.get(`/categories`);
    return res.data;
  } catch (err) {
    console.error("getCategories error:", err.response?.status, err.response?.data);
    throw err;
  }
}

export async function createCategory(category) {
  try {
    const res = await api.post(`/categories`, category);
    return res.data;
  } catch (err) {
    console.error("createCategory error:", err.response?.status, err.response?.data);
    throw err;
  }
}

export async function getCategoryById(id) {
  try {
    const res = await api.get(`/categories/${id}`);
    return res.data;
  } catch (err) {
    console.error("getCategoryById error:", err.response?.status, err.response?.data);
    throw err;
  }
}

export async function updateCategory(id, category) {
  try {
    const res = await api.put(`/categories/${id}`, category);
    return res.data;
  } catch (err) {
    console.error("updateCategory error:", err.response?.status, err.response?.data);
    throw err;
  }
}

export async function deleteCategory(id) {
  try {
    const res = await api.delete(`/categories/${id}`);
    return res.data;
  } catch (err) {
    console.error("deleteCategory error:", err.response?.status, err.response?.data);
    throw err;
  }
}

// USERS
export async function getUsers() {
  try {
    const res = await api.get(`/user/admin/all`);
    return res.data;
  } catch (err) {
    console.error("getUsers error:", err.response?.status, err.response?.data);
    throw err;
  }
}

export async function getUserById(id) {
  try {
    const res = await api.get(`/user/${id}`);
    return res.data;
  } catch (err) {
    console.error("getUserById error:", err.response?.status, err.response?.data);
    throw err;
  }
}

export async function deleteUser(id) {
  try {
    const res = await api.delete(`/user/${id}`);
    return res.data;
  } catch (err) {
    console.error("deleteUser error:", err.response?.status, err.response?.data);
    throw err;
  }
}

// ORDERS
export async function getOrders() {
  try {
    const res = await api.get(`/orders`);
    return res.data;
  } catch (err) {
    console.error("getOrders error:", err.response?.status, err.response?.data);
    throw err;
  }
}

export async function getOrderById(id) {
  try {
    const res = await api.get(`/orders/${id}`);
    return res.data;
  } catch (err) {
    console.error("getOrderById error:", err.response?.status, err.response?.data);
    throw err;
  }
}

