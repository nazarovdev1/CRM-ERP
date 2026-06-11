export type Role = "ADMIN" | "MANAGER" | "SALES" | "WAREHOUSE" | "VIEWER";

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Supplier {
  id: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  id: string;
  name: string;
  SKU: string;
  categoryId: string;
  category?: Category;
  size: string;
  color: string;
  costPrice: number;
  salePrice: number;
  stockQuantity: number;
  reorderLevel: number;
  supplierId: string;
  supplier?: Supplier;
  status: "ACTIVE" | "ARCHIVED";
  createdAt?: string;
  updatedAt?: string;
}

export interface InventoryMovement {
  id: string;
  productId: string;
  product?: Product;
  quantity: number;
  type: "IN" | "OUT";
  reason: "PURCHASE" | "SALE" | "RETURN" | "ADJUSTMENT";
  notes?: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  type: "RETAIL" | "WHOLESALE" | "PARTNER";
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  source: string;
  interest: string;
  status: "NEW" | "CONTACTED" | "QUALIFIED" | "LOST" | "CONVERTED";
  assignedToId?: string;
  assignedTo?: User;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Deal {
  id: string;
  customerId: string;
  customer?: Customer;
  title: string;
  value: number;
  stage: "PROSPECTING" | "NEGOTIATION" | "WON" | "LOST";
  expectedCloseDate: string;
  probability: number;
  assignedToId?: string;
  assignedTo?: User;
  createdAt: string;
  updatedAt?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  assignedToId?: string;
  assignedTo?: User;
  leadId?: string;
  lead?: Lead;
  dealId?: string;
  deal?: Deal;
  createdAt?: string;
  updatedAt?: string;
}

export interface PurchaseOrderItem {
  id?: string;
  productId: string;
  product?: Product;
  quantity: number;
  costPrice: number;
}

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplierId: string;
  supplier?: Supplier;
  status: "DRAFT" | "ORDERED" | "RECEIVED" | "CANCELLED";
  totalAmount: number;
  items: PurchaseOrderItem[];
  createdAt: string;
  updatedAt?: string;
}

export interface SalesOrderItem {
  id?: string;
  productId: string;
  product?: Product;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

export interface SalesOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  customer?: Customer;
  status: "PENDING" | "CONFIRMED" | "SHIPPED" | "COMPLETED" | "CANCELLED";
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  items: SalesOrderItem[];
  createdAt: string;
  updatedAt?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  salesOrderId: string;
  salesOrder?: SalesOrder;
  customerId: string;
  customer?: Customer;
  totalAmount: number;
  paidAmount: number;
  status: "UNPAID" | "PARTIAL" | "PAID" | "OVERDUE";
  dueDate: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ActivityLog {
  id: string;
  type: string;
  description: string;
  userId?: string;
  userName?: string;
  createdAt: string;
}

export interface DashboardSummary {
  totalRevenue: number;
  monthlySales: number;
  totalCustomers: number;
  activeLeadsCount: number;
  openDealsCount: number;
  openDealsValue: number;
  lowStockCount: number;
  pendingPOCount: number;
  recentOrders: SalesOrder[];
  recentLogs: ActivityLog[];
  charts: {
    salesTrend: { month: string; sales: number; revenue: number }[];
    categoryBreakdown: { name: string; value: number }[];
    dealFunnel: { name: string; count: number }[];
  };
}
