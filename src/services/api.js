// src/services/api.js
import axios from "axios";
// Detect backend host dynamically for LAN access
// Use production URL if available, otherwise use local development
const BASE_URL = "https://clothing-ecom-backend.onrender.com";
// const BASE_URL = "http://localhost:8081";


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

// AUTH - Google Login
export async function googleLogin(credential) {
  try {
    // Ensure credential is a string
    if (!credential || typeof credential !== 'string') {
      throw new Error("Invalid credential: credential must be a non-empty string");
    }
    
    console.log("Sending Google login request");
    console.log("Credential type:", typeof credential);
    console.log("Credential length:", credential.length);
    
    // Backend expects GoogleLoginRequest with idToken field
    const payload = {
      idToken: credential
    };
    
    console.log("Request payload:", { idToken: credential.substring(0, 50) + "..." });
    
    const res = await api.post("/auth/google", payload);
    
    // Log the response for debugging
    console.log("Google login API response:", res);
    console.log("Response data:", res.data);
    
    // Return the data, or the full response if data is not available
    return res.data || res;
  } catch (err) {
    console.error("Google login API error:", {
      status: err.response?.status,
      data: err.response?.data,
      message: err.message
    });
    
    // Re-throw with more context
    const errorMessage = err.response?.data?.message || err.message || "Google login failed";
    throw new Error(errorMessage);
  }
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
  // Backend expects AddProductRequest: name, description, price, stock, categoryId
  const requestData = {
    name: productData.name,
    description: productData.description || "",
    price: parseFloat(productData.price) || 0,
    stock: parseInt(productData.stock) || 0,
    categoryId: productData.categoryId ? parseInt(productData.categoryId) : null
  };
  fd.append("data", JSON.stringify(requestData));
  if (imageFile) fd.append("image", imageFile);
  const res = await api.post(`/products/add`, fd, { headers: { "Content-Type": "multipart/form-data" } });
  return res.data;
}

export async function updateProduct(id, productData, imageFile) {
  const fd = new FormData();
  // Backend expects AddProductRequest: name, description, price, stock, categoryId
  const requestData = {
    name: productData.name,
    description: productData.description || "",
    price: parseFloat(productData.price) || 0,
    stock: parseInt(productData.stock) || 0,
    categoryId: productData.categoryId ? parseInt(productData.categoryId) : null
  };
  fd.append("data", JSON.stringify(requestData));
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
    // Backend expects Category with image as base64 string (it will decode it)
    const categoryData = {
      name: category.name,
      description: category.description || ""
    };
    // If image is provided as base64, send it
    if (category.image) {
      categoryData.image = category.image; // Backend expects base64 string in 'image' field
    }
    const res = await api.post(`/categories`, categoryData);
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
    // Backend expects Category with image as base64 string (it will decode it)
    const categoryData = {
      name: category.name,
      description: category.description || ""
    };
    // If image is provided as base64, send it
    if (category.image) {
      categoryData.image = category.image; // Backend expects base64 string in 'image' field
    }
    const res = await api.put(`/categories/${id}`, categoryData);
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
    // Try admin endpoint first, fallback to regular endpoint
    try {
      const res = await api.get(`/user/admin/${id}`);
      return res.data;
    } catch (adminErr) {
      // Fallback to regular endpoint
      const res = await api.get(`/user/${id}`);
      return res.data;
    }
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

export async function updateUserRoles(id, roles) {
  try {
    // Try admin endpoint first
    try {
      const res = await api.put(`/user/admin/${id}/roles`, { roles });
      return res.data;
    } catch (adminErr) {
      // Fallback to regular update endpoint
      const res = await api.put(`/user/${id}`, { roles });
      return res.data;
    }
  } catch (err) {
    console.error("updateUserRoles error:", err.response?.status, err.response?.data);
    throw err;
  }
}

// ORDERS
export async function getOrders() {
  try {
    // Try admin endpoint first, fallback to regular endpoint
    try {
      const res = await api.get(`/orders/admin/all`);
      return res.data;
    } catch (adminErr) {
      // Fallback to regular endpoint (might work if admin has access)
      const res = await api.get(`/orders`);
      return res.data;
    }
  } catch (err) {
    console.error("getOrders error:", err.response?.status, err.response?.data);
    throw err;
  }
}

export async function getOrderById(id) {
  try {
    // Try admin endpoint first, fallback to regular endpoint
    try {
      const res = await api.get(`/orders/admin/${id}`);
      return res.data;
    } catch (adminErr) {
      // Fallback to regular endpoint (might work if admin has access)
      const res = await api.get(`/orders/${id}`);
      return res.data;
    }
  } catch (err) {
    console.error("getOrderById error:", err.response?.status, err.response?.data);
    throw err;
  }
}

export async function updateOrderStatus(id, status) {
  try {
    const res = await api.put(`/orders/admin/${id}/status`, {
      orderStatus: status
    });
    return res.data;
  } catch (err) {
    console.error("updateOrderStatus error:", err.response?.status, err.response?.data);
    throw err;
  }
}

export async function getOrdersByUserId(userId) {
  try {
    // Try to get orders filtered by user ID
    try {
      const res = await api.get(`/orders/admin/user/${userId}`);
      return res.data;
    } catch (userOrdersErr) {
      // Fallback: get all orders and filter by user ID
      const allOrders = await getOrders();
      return allOrders.filter(order => {
        const orderUserId = order.user?.id || order.userId;
        return orderUserId === parseInt(userId) || orderUserId === userId;
      });
    }
  } catch (err) {
    console.error("getOrdersByUserId error:", err.response?.status, err.response?.data);
    throw err;
  }
}


// HOME ADS
export async function getHomeAds() {
  try {
    const res = await api.get(`/home-ads`);
    console.log("getHomeAds response:", res.data); // Debug log
    // Return the data, handling different response structures
    return res.data;
  } catch (err) {
    console.error("getHomeAds error:", err.response?.status, err.response?.data);
    // If it's a 404 or 401, return empty array to prevent UI breaking
    if (err.response?.status === 404 || err.response?.status === 401) {
      console.warn("Home ads endpoint not accessible, returning empty array");
      return [];
    }
    throw err;
  }
}

export async function getHomeAdById(id) {
  try {
    const res = await api.get(`/home-ads/${id}`);
    return res.data;
  } catch (err) {
    console.error("getHomeAdById error:", err.response?.status, err.response?.data);
    throw err;
  }
}

// Helper to convert file to base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]); // Remove data:image/...;base64, prefix
    reader.onerror = error => reject(error);
  });
}

export async function createHomeAd(adData, imageFile) {
  try {
    const payload = {
      title: adData.title,
      type: adData.type || "",
      redirectUrl: adData.redirectUrl || "",
      active: adData.active !== undefined ? adData.active : true
    };
    
    // If image file provided, convert to base64
    if (imageFile) {
      payload.imageBase64 = await fileToBase64(imageFile);
    }
    
    const res = await api.post(`/home-ads`, payload);
    return res.data;
  } catch (err) {
    console.error("createHomeAd error:", err.response?.status, err.response?.data);
    throw err;
  }
}

export async function updateHomeAd(id, adData, imageFile) {
  try {
    const payload = {
      title: adData.title,
      type: adData.type || "",
      redirectUrl: adData.redirectUrl || "",
      active: adData.active !== undefined ? adData.active : true
    };
    
    // If image file provided, convert to base64
    if (imageFile) {
      payload.imageBase64 = await fileToBase64(imageFile);
    }
    
    const res = await api.put(`/home-ads/${id}`, payload);
    return res.data;
  } catch (err) {
    console.error("updateHomeAd error:", err.response?.status, err.response?.data);
    throw err;
  }
}

export async function deleteHomeAd(id) {
  try {
    const res = await api.delete(`/home-ads/${id}`);
    return res.data;
  } catch (err) {
    console.error("deleteHomeAd error:", err.response?.status, err.response?.data);
    throw err;
  }
}

export function getHomeAdImageUrl(id) {
  return `${BASE_URL}/home-ads/image/${id}`;
}
export async function getContacts() {
  try {
    const res = await api.get(`/contacts`);
    return res.data;
  } catch (err) {
    console.error("getContacts error:", err.response?.status, err.response?.data);
    throw err;
  }
}

// QUERIES
export async function getQueries() {
  try {
    // Try /queries endpoint first, fallback to /contacts if needed
    try {
      const res = await api.get(`/contact`);
      return res.data;
    } catch (queriesErr) {
      // Fallback to contacts endpoint if queries doesn't exist
      const res = await api.get(`/contact`);
      return res.data;
    }
  } catch (err) {
    console.error("getQueries error:", err.response?.status, err.response?.data);
    throw err;
  }
}

