const BASE_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : "http://localhost:5000/api";

/** Retrieve stored JWT */
export const getToken = () => localStorage.getItem("token") || localStorage.getItem("adminToken");

/** Persist JWT after login */
export const setToken = (token) => {
  localStorage.setItem("token", token);
  localStorage.setItem("adminToken", token);
};

/** Remove JWT (logout) */
export const clearToken = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("adminToken");
};

/** Build headers, injecting Authorization when a token exists */
const buildHeaders = (extra = {}) => {
  const headers = { "Content-Type": "application/json", ...extra };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
};

/**
 * Core fetch wrapper.
 * Throws a normalised Error with a `.status` property on non-2xx responses.
 */
const request = async (method, path, body = undefined) => {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: buildHeaders(),
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  if (!res.ok) {
    let message = `Request failed: ${res.status}`;
    try {
      const err = await res.json();
      message = err.message || message;
    } catch (_) {}
    const error = new Error(message);
    error.status = res.status;
    throw error;
  }

  // 204 No Content
  if (res.status === 204) return null;
  return res.json();
};

// ─────────────────────────────────────────────
//  Auth
// ─────────────────────────────────────────────
export const authAPI = {
  login: (email, password) => request("POST", "/auth/login", { email, password }),
  register: (data) => request("POST", "/auth/register", data),
  getMe: () => request("GET", "/auth/me"),
};

// ─────────────────────────────────────────────
//  Products
// ─────────────────────────────────────────────
export const productsAPI = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== "" && v !== undefined && v !== null)
      )
    ).toString();
    return request("GET", `/products${qs ? `?${qs}` : ""}`);
  },
  getById: (id) => request("GET", `/products/${id}`),
  getFeatured: () => request("GET", "/products/featured"),
  getOffers: () => request("GET", "/products/offers"),
  create: (data) => request("POST", "/products", data),
  update: (id, data) => request("PUT", `/products/${id}`, data),
  delete: (id) => request("DELETE", `/products/${id}`),
};

// ─────────────────────────────────────────────
//  Categories
// ─────────────────────────────────────────────
export const categoriesAPI = {
  getAll: () => request("GET", "/categories"),
  create: (data) => request("POST", "/categories", data),
  update: (id, data) => request("PUT", `/categories/${id}`, data),
  delete: (id) => request("DELETE", `/categories/${id}`),
};

// ─────────────────────────────────────────────
//  Attributes
// ─────────────────────────────────────────────
export const attributesAPI = {
  getAll: () => request("GET", "/attributes"),
  create: (data) => request("POST", "/attributes", data),
  delete: (id) => request("DELETE", `/attributes/${id}`),
};

// ─────────────────────────────────────────────
//  Orders
// ─────────────────────────────────────────────
export const ordersAPI = {
  getAll: () => request("GET", "/orders/admin"),
  getById: (id) => request("GET", `/orders/${id}`),
  updateStatus: (id, orderStatus) => request("PUT", `/orders/${id}/status`, { orderStatus }),
  cancel: (id) => request("PATCH", `/orders/${id}/cancel`),
};

// ─────────────────────────────────────────────
//  Customers / Users
// ─────────────────────────────────────────────
export const customersAPI = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== "" && v !== undefined && v !== null)
      )
    ).toString();
    return request("GET", `/users${qs ? `?${qs}` : ""}`);
  },
  getById: (id) => request("GET", `/users/${id}`),
  toggleBlock: (id) => request("PUT", `/users/${id}/block`),
  updateRole: (id, role) => request("PUT", `/users/${id}/role`, { role }),
  delete: (id) => request("DELETE", `/users/${id}`),
};

// ─────────────────────────────────────────────
//  Vendors
// ─────────────────────────────────────────────
export const vendorsAPI = {
  getAll: () => request("GET", "/vendor"),
  getById: (id) => request("GET", `/vendor/${id}`),
  create: (data) => request("POST", "/vendor", data),
  updateStatus: (id, approvalStatus) => request("PUT", `/vendor/${id}/status`, { approvalStatus }),
  delete: (id) => request("DELETE", `/vendor/${id}`),
};

// ─────────────────────────────────────────────
//  Inventory / Vendor Stock
// ─────────────────────────────────────────────
export const inventoryAPI = {
  submitStock: (data) => request("POST", "/vendor-stock", data),
  selectVendor: (data) => request("PUT", "/vendor-stock/select", data),
  getVariantStock: (productId, sku) => request("GET", `/vendor-stock/${productId}/${sku}`),
};

// ─────────────────────────────────────────────
//  Coupons
// ─────────────────────────────────────────────
export const couponsAPI = {
  getAll: () => request("GET", "/coupons"),
  create: (data) => request("POST", "/coupons", data),
  delete: (id) => request("DELETE", `/coupons/${id}`),
};

// ─────────────────────────────────────────────
//  Referrals & Affiliates
// ─────────────────────────────────────────────
export const referralsAPI = {
  getStats: () => request("GET", "/referrals/stats"),
  applyCode: (referralCode) => request("POST", "/referrals/apply", { referralCode }),
};

// ─────────────────────────────────────────────
//  Reviews
// ─────────────────────────────────────────────
export const reviewsAPI = {
  getAllToModerate: () => request("GET", "/reviews/moderate"),
  getByProduct: (productId) => request("GET", `/reviews/product/${productId}`),
  approve: (id, isApproved) => request("PUT", `/reviews/${id}/approve`, { isApproved }),
  create: (data) => request("POST", "/reviews", data),
};

// ─────────────────────────────────────────────
//  Support Tickets
// ─────────────────────────────────────────────
export const supportAPI = {
  getAll: () => request("GET", "/support-tickets"),
  getMyTickets: () => request("GET", "/support-tickets/my-tickets"),
  create: (data) => request("POST", "/support-tickets", data),
  reply: (id, message, status) => request("PUT", `/support-tickets/${id}/reply`, { message, status }),
};

// ─────────────────────────────────────────────
//  CMS & Banners
// ─────────────────────────────────────────────
export const cmsAPI = {
  getBanners: () => request("GET", "/banners"),
  createBanner: (data) => request("POST", "/banners", data),
  updateBanner: (id, data) => request("PUT", `/banners/${id}`, data),
  deleteBanner: (id) => request("DELETE", `/banners/${id}`),
};

// ─────────────────────────────────────────────
//  Dashboard & Analytics
// ─────────────────────────────────────────────
export const dashboardAPI = {
  getAdminStats: () => request("GET", "/dashboard/admin"),
  getVendorStats: () => request("GET", "/dashboard/vendor"),
};

// ─────────────────────────────────────────────
//  Transactions
// ─────────────────────────────────────────────
export const transactionsAPI = {
  getAllAdmin: () => request("GET", "/transactions/admin"),
  getMyTransactions: () => request("GET", "/transactions/my"),
};

// ─────────────────────────────────────────────
//  Upload
// ─────────────────────────────────────────────
export const uploadAPI = {
  uploadImage: async (fileOrBase64) => {
    let base64 = fileOrBase64;
    if (fileOrBase64 instanceof File) {
      base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(fileOrBase64);
      });
    }
    return request("POST", "/upload", { image: base64 });
  },
};