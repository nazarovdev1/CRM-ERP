const BASE_URL = ""; // Relative routes handle both dev and prod perfectly

export async function apiRequest(endpoint: string, method: string = "GET", body?: any): Promise<any> {
  const token = localStorage.getItem("luxx_token");
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, config);

  if (response.status === 401) {
    // Session expired or token invalidated
    localStorage.removeItem("luxx_token");
    localStorage.removeItem("luxx_user");
    if (!window.location.hash.includes("/login")) {
      window.location.hash = "#/login";
    }
    throw new Error("Sessiya muddati tugadi. Qayta kiring.");
  }

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || `API Error: ${response.status}`);
  }

  return data;
}

export const api = {
  auth: {
    async login(credentials: any) {
      const data = await apiRequest("/api/auth/login", "POST", credentials);
      localStorage.setItem("luxx_token", data.token);
      localStorage.setItem("luxx_user", JSON.stringify(data.user));
      return data.user;
    },
    async register(details: any) {
      const data = await apiRequest("/api/auth/register", "POST", details);
      localStorage.setItem("luxx_token", data.token);
      localStorage.setItem("luxx_user", JSON.stringify(data.user));
      return data.user;
    },
    logout() {
      localStorage.removeItem("luxx_token");
      localStorage.removeItem("luxx_user");
      window.location.hash = "#/login";
    },
    getCurrentUser() {
      const userStr = localStorage.getItem("luxx_user");
      if (userStr) {
        try {
          return JSON.parse(userStr);
        } catch {
          return null;
        }
      }
      return null;
    },
    async getUsers() {
      return await apiRequest("/api/auth/users");
    },
    async updateUserRole(id: string, role: string) {
      return await apiRequest(`/api/auth/users/${id}/role`, "PUT", { role });
    },
    async deleteUser(id: string) {
      return await apiRequest(`/api/auth/users/${id}`, "DELETE");
    }
  },
  
  dashboard: {
    async getSummary() {
      return await apiRequest("/api/dashboard/summary");
    },
    async getHealth() {
      return await apiRequest("/api/health");
    }
  },

  products: {
    async getAll() {
      return await apiRequest("/api/products");
    },
    async create(data: any) {
      return await apiRequest("/api/products", "POST", data);
    },
    async update(id: string, data: any) {
      return await apiRequest(`/api/products/${id}`, "PUT", data);
    },
    async delete(id: string) {
      return await apiRequest(`/api/products/${id}`, "DELETE");
    }
  },

  categories: {
    async getAll() {
      return await apiRequest("/api/categories");
    },
    async create(name: string) {
      return await apiRequest("/api/categories", "POST", { name });
    }
  },

  suppliers: {
    async getAll() {
      return await apiRequest("/api/suppliers");
    },
    async create(data: any) {
      return await apiRequest("/api/suppliers", "POST", data);
    },
    async update(id: string, data: any) {
      return await apiRequest(`/api/suppliers/${id}`, "PUT", data);
    },
    async delete(id: string) {
      return await apiRequest(`/api/suppliers/${id}`, "DELETE");
    }
  },

  inventory: {
    async getMovements() {
      return await apiRequest("/api/inventory-movements");
    }
  },

  customers: {
    async getAll() {
      return await apiRequest("/api/customers");
    },
    async create(data: any) {
      return await apiRequest("/api/customers", "POST", data);
    },
    async update(id: string, data: any) {
      return await apiRequest(`/api/customers/${id}`, "PUT", data);
    },
    async delete(id: string) {
      return await apiRequest(`/api/customers/${id}`, "DELETE");
    }
  },

  leads: {
    async getAll() {
      return await apiRequest("/api/leads");
    },
    async create(data: any) {
      return await apiRequest("/api/leads", "POST", data);
    },
    async update(id: string, data: any) {
      return await apiRequest(`/api/leads/${id}`, "PUT", data);
    },
    async delete(id: string) {
      return await apiRequest(`/api/leads/${id}`, "DELETE");
    }
  },

  deals: {
    async getAll() {
      return await apiRequest("/api/deals");
    },
    async create(data: any) {
      return await apiRequest("/api/deals", "POST", data);
    },
    async update(id: string, data: any) {
      return await apiRequest(`/api/deals/${id}`, "PUT", data);
    },
    async delete(id: string) {
      return await apiRequest(`/api/deals/${id}`, "DELETE");
    }
  },

  tasks: {
    async getAll() {
      return await apiRequest("/api/tasks");
    },
    async create(data: any) {
      return await apiRequest("/api/tasks", "POST", data);
    },
    async update(id: string, data: any) {
      return await apiRequest(`/api/tasks/${id}`, "PUT", data);
    },
    async delete(id: string) {
      return await apiRequest(`/api/tasks/${id}`, "DELETE");
    }
  },

  purchaseOrders: {
    async getAll() {
      return await apiRequest("/api/purchase-orders");
    },
    async create(data: any) {
      return await apiRequest("/api/purchase-orders", "POST", data);
    },
    async updateStatus(id: string, status: string) {
      return await apiRequest(`/api/purchase-orders/${id}/status`, "PUT", { status });
    },
    async delete(id: string) {
      return await apiRequest(`/api/purchase-orders/${id}`, "DELETE");
    }
  },

  salesOrders: {
    async getAll() {
      return await apiRequest("/api/sales-orders");
    },
    async create(data: any) {
      return await apiRequest("/api/sales-orders", "POST", data);
    },
    async updateStatus(id: string, status: string) {
      return await apiRequest(`/api/sales-orders/${id}/status`, "PUT", { status });
    },
    async delete(id: string) {
      return await apiRequest(`/api/sales-orders/${id}`, "DELETE");
    }
  },

  invoices: {
    async getAll() {
      return await apiRequest("/api/invoices");
    },
    async pay(id: string, paidAmount: number) {
      return await apiRequest(`/api/invoices/${id}/payment`, "PUT", { paidAmount });
    }
  },

  activities: {
    async getAll() {
      return await apiRequest("/api/activity-logs");
    }
  }
};
