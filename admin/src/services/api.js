const BASE_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : "http://localhost:5000/api";

/** Retrieve stored JWT */
export const getToken = () => localStorage.getItem("token") || localStorage.getItem("adminToken");

/** Persist JWT after login */
export const setToken = (token) => {
  localStorage.setItem("token", token);
  localStorage.setItem("adminToken", token);
  localStorage.removeItem("adminLoggedOut");
};

/** Remove JWT (logout) */
export const clearToken = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("adminToken");
  localStorage.setItem("adminLoggedOut", "true");
};

/** Auto-authenticate admin if no token is found in localStorage */
let authPromise = null;
export const ensureAdminToken = async () => {
  if (localStorage.getItem("adminLoggedOut") === "true") return null;
  const existing = getToken();
  if (existing) return existing;
  if (!authPromise) {
    authPromise = fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@naashyol.com", password: "admin123password" }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data?.token) {
          setToken(data.token);
          return data.token;
        }
        return null;
      })
      .catch(() => null)
      .finally(() => {
        authPromise = null;
      });
  }
  return authPromise;
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
const request = async (method, path, body = undefined, isRetry = false) => {
  if (!getToken() && !path.startsWith("/auth/")) {
    await ensureAdminToken();
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: buildHeaders(),
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  if (res.status === 401 && !isRetry && !path.startsWith("/auth/")) {
    clearToken();
    await ensureAdminToken();
    return request(method, path, body, true);
  }

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
  toggleStatus: (id) => request("PATCH", `/categories/status/${id}`),
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
  create: (data) => request("POST", "/users", data),
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
  getAll: (params) => request("GET", "/coupons", null, { params }),
  create: (data) => request("POST", "/coupons", data),
  delete: (id) => request("DELETE", `/coupons/${id}`),
};

// ─────────────────────────────────────────────
//  Referrals & Affiliates
// ─────────────────────────────────────────────
export const referralsAPI = {
  getStats: () => request("GET", "/referrals/stats"),
  applyCode: (referralCode) => request("POST", "/referrals/apply", { referralCode }),
  getAll: () => request("GET", "/referrals/admin/referrers"),
  getDetail: (id) => request("GET", `/referrals/admin/referrer/${id}`),
  generateCoupon: (data) => request("POST", "/referrals/admin/generate-coupon", data),
};

// ─────────────────────────────────────────────
//  Reviews
// ─────────────────────────────────────────────
export const reviewsAPI = {
  getAll: () => request("GET", "/reviews/admin"),
  getAllToModerate: () => request("GET", "/reviews/admin"),
  getByProduct: (productId) => request("GET", `/reviews/product/${productId}`),
  updateStatus: (id, data) => request("PUT", `/reviews/${id}/status`, data),
  approve: (id, isApproved) => request("PUT", `/reviews/${id}/status`, { isApproved, status: isApproved ? "approved" : "disabled" }),
  delete: (id) => request("DELETE", `/reviews/${id}`),
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
//  Returns & Refunds
// ─────────────────────────────────────────────
export const returnsAPI = {
  getAll: () => request("GET", "/returns/admin"),
  updateStatus: (id, data) => request("PUT", `/returns/${id}/status`, data),
};

// ─────────────────────────────────────────────
//  Settings
// ─────────────────────────────────────────────
export const settingsAPI = {
  get: () => request("GET", "/settings"),
  update: (data) => request("PUT", "/settings", data),
};

// ─────────────────────────────────────────────
//  CMS & Banners
// ─────────────────────────────────────────────
export const cmsAPI = {
  getBanners: () => request("GET", "/banners"),
  createBanner: (data) => request("POST", "/banners", data),
  updateBanner: (id, data) => request("PUT", `/banners/${id}`, data),
  deleteBanner: (id) => request("DELETE", `/banners/${id}`),

  getPages: () => request("GET", "/cms/pages"),
  createPage: (data) => request("POST", "/cms/pages", data),
  updatePage: (id, data) => request("PUT", `/cms/pages/${id}`, data),
  deletePage: (id) => request("DELETE", `/cms/pages/${id}`),

  getFaqs: () => request("GET", "/cms/faqs"),
  createFaq: (data) => request("POST", "/cms/faqs", data),
  updateFaq: (id, data) => request("PUT", `/cms/faqs/${id}`, data),
  deleteFaq: (id) => request("DELETE", `/cms/faqs/${id}`),

  getBlogs: () => request("GET", "/cms/blogs"),
  createBlog: (data) => request("POST", "/cms/blogs", data),
  updateBlog: (id, data) => request("PUT", `/cms/blogs/${id}`, data),
  deleteBlog: (id) => request("DELETE", `/cms/blogs/${id}`),

  // Home Page Sections
  getHomePageSections: () => request("GET", "/cms/home-page/admin/sections"),
  getHomePageSection: (id) => request("GET", `/cms/home-page/sections/${id}`),
  createHomePageSection: (data) => request("POST", "/cms/home-page/sections", data),
  updateHomePageSection: (id, data) => request("PUT", `/cms/home-page/sections/${id}`, data),
  deleteHomePageSection: (id) => request("DELETE", `/cms/home-page/sections/${id}`),
  toggleHomePageSectionStatus: (id, isActive) => request("PATCH", `/cms/home-page/sections/${id}/status`, { isActive }),
  reorderHomePageSections: (orders) => request("PATCH", "/cms/home-page/sections/reorder", { orders }),
  seedHomePageSections: () => request("POST", "/cms/home-page/seed"),
};

// ─────────────────────────────────────────────
//  Dashboard & Analytics
// ─────────────────────────────────────────────
export const dashboardAPI = {
  getAdminStats: () => request("GET", "/dashboard/admin"),
  getVendorStats: () => request("GET", "/dashboard/vendor"),
};

// ─────────────────────────────────────────────
//  Payments & Transactions
// ─────────────────────────────────────────────
export const paymentsAPI = {
  getAll: () => request("GET", "/payments/admin"),
  updateStatus: (id, paymentStatus) => request("PUT", `/payments/admin/${id}/status`, { paymentStatus }),
};

export const transactionsAPI = {
  getAllAdmin: () => request("GET", "/payments/admin"),
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
