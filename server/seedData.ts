export interface UserSeed {
  id: string;
  email: string;
  name: string;
  passwordHash: string; // Dynamic or pre-hashed
  role: "ADMIN" | "MANAGER" | "SALES" | "WAREHOUSE" | "VIEWER";
}

export interface CategorySeed {
  id: string;
  name: string;
}

export interface SupplierSeed {
  id: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
}

export interface ProductSeed {
  id: string;
  name: string;
  SKU: string;
  categoryId: string;
  size: string;
  color: string;
  costPrice: number;
  salePrice: number;
  stockQuantity: number;
  reorderLevel: number;
  supplierId: string;
  status: string;
}

export interface InventoryMovementSeed {
  id: string;
  productId: string;
  quantity: number;
  type: "IN" | "OUT";
  reason: "PURCHASE" | "SALE" | "RETURN" | "ADJUSTMENT";
  notes: string;
  createdAt: string;
}

export interface CustomerSeed {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  type: "RETAIL" | "WHOLESALE" | "PARTNER";
  notes: string;
}

export interface LeadSeed {
  id: string;
  name: string;
  phone: string;
  email: string;
  source: string;
  interest: string;
  status: "NEW" | "CONTACTED" | "QUALIFIED" | "LOST" | "CONVERTED";
  assignedToId: string;
  notes: string;
}

export interface DealSeed {
  id: string;
  customerId: string;
  title: string;
  value: number;
  stage: "PROSPECTING" | "NEGOTIATION" | "WON" | "LOST";
  expectedCloseDate: string;
  probability: number;
  assignedToId: string;
}

export interface TaskSeed {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  assignedToId: string;
  leadId?: string;
  dealId?: string;
}

export interface PurchaseOrderSeed {
  id: string;
  orderNumber: string;
  supplierId: string;
  status: "DRAFT" | "ORDERED" | "RECEIVED" | "CANCELLED";
  totalAmount: number;
  createdAt: string;
  items: {
    productId: string;
    quantity: number;
    costPrice: number;
  }[];
}

export interface SalesOrderSeed {
  id: string;
  orderNumber: string;
  customerId: string;
  status: "PENDING" | "CONFIRMED" | "SHIPPED" | "COMPLETED" | "CANCELLED";
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  createdAt: string;
  items: {
    productId: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    total: number;
  }[];
}

export interface InvoiceSeed {
  id: string;
  invoiceNumber: string;
  salesOrderId: string;
  customerId: string;
  totalAmount: number;
  paidAmount: number;
  status: "UNPAID" | "PARTIAL" | "PAID" | "OVERDUE";
  dueDate: string;
  createdAt: string;
}

export interface ActivityLogSeed {
  id: string;
  type: string;
  description: string;
  userId?: string;
  userName?: string;
  createdAt: string;
}

export const defaultUsers: UserSeed[] = [
  {
    id: "user-admin",
    email: "admin@luxx.uz",
    name: "Aleksey Smirnov (Admin)",
    passwordHash: "$2b$10$8RfBfThCEveFup2pXhgrv.52MYZxgtG.gakjE8Neqf1xkRdYKo0Cq", // Admin12345
    role: "ADMIN"
  },
  {
    id: "user-manager",
    email: "manager@luxx.uz",
    name: "Shakhnoza Karimova (Manager)",
    passwordHash: "$2b$10$rp0osGdoR9a.papy7WPBsuHSEPc2yt0btYpt0sMjrVJqNAUBy2BP2", // Manager12345
    role: "MANAGER"
  },
  {
    id: "user-sales",
    email: "sales@luxx.uz",
    name: "Timur Alimov (Sales)",
    passwordHash: "$2b$10$sQnO..xENXueG//Rcyt6WeogS1Yhl0lqJIJXiuTuevO.oGd24jXL6", // Sales12345
    role: "SALES"
  },
  {
    id: "user-warehouse",
    email: "warehouse@luxx.uz",
    name: "Jasur Nematov (Warehouse)",
    passwordHash: "$2b$10$wMzLLOpWX.bSKnWlX88pqeeWjWlpvoDk6yJSK/A0VARKMJkZhU8yq", // Warehouse12345
    role: "WAREHOUSE"
  },
  {
    id: "user-viewer",
    email: "viewer@luxx.uz",
    name: "Dilnoza Rustamova (Viewer)",
    passwordHash: "$2b$10$XALZ2JspzulO1odiTfFUleqR69az3SXRNZ5dwqahmAnAmz53pdkgy", // Viewer12345
    role: "VIEWER"
  }
];

export const defaultCategories: CategorySeed[] = [
  { id: "cat-jkt", name: "Jackets & Coats" },
  { id: "cat-drs", name: "Dresses" },
  { id: "cat-act", name: "Activewear" },
  { id: "cat-knt", name: "Knitwear" },
  { id: "cat-dnm", name: "Denim" }
];

export const defaultSuppliers: SupplierSeed[] = [
  {
    id: "sup-sinotex",
    companyName: "SinoTex Garment Co.",
    contactPerson: "Li Wei",
    phone: "+86 21 5555 1234",
    email: "contact@sinotex.com",
    address: "Block 4, Pudong Apparel Zone, Shanghai, China",
    notes: "Primary supplier for high-end silk dresses and premium activewear."
  },
  {
    id: "sup-bakucotton",
    companyName: "Baku Cotton Mills",
    contactPerson: "Anar Aliyev",
    phone: "+994 12 444 5566",
    email: "info@bakucotton.az",
    address: "88 Neftchiler Ave, Baku, Azerbaijan",
    notes: "High-quality raw cotton inputs and denim manufacturers."
  },
  {
    id: "sup-istanbul",
    companyName: "Istanbul Apparel Wholesale",
    contactPerson: "Mehmet Demir",
    phone: "+90 212 333 4455",
    email: "sales@istanbulapparel.tr",
    address: "Merter Textile District, Istanbul, Turkey",
    notes: "Excellent source for woolen knitwear and winter outerwear."
  }
];

export const defaultProducts: ProductSeed[] = [
  {
    id: "prod-leather-jkt",
    name: "Classic Leather Biker Jacket",
    SKU: "LXX-JKT-01",
    categoryId: "cat-jkt",
    size: "L",
    color: "Black",
    costPrice: 45.0,
    salePrice: 89.99,
    stockQuantity: 50,
    reorderLevel: 10,
    supplierId: "sup-istanbul",
    status: "ACTIVE"
  },
  {
    id: "prod-silk-drs",
    name: "Summer Silk Floral Dress",
    SKU: "LXX-DRS-02",
    categoryId: "cat-drs",
    size: "M",
    color: "Red/Floral",
    costPrice: 25.0,
    salePrice: 49.99,
    stockQuantity: 120,
    reorderLevel: 15,
    supplierId: "sup-sinotex",
    status: "ACTIVE"
  },
  {
    id: "prod- leggings",
    name: "Athletic Seamless Leggings",
    SKU: "LXX-ACT-03",
    categoryId: "cat-act",
    size: "S",
    color: "Navy Blue",
    costPrice: 12.0,
    salePrice: 29.99,
    stockQuantity: 80,
    reorderLevel: 15,
    supplierId: "sup-sinotex",
    status: "ACTIVE"
  },
  {
    id: "prod-cashmere-swtr",
    name: "Cashmere V-Neck Sweater",
    SKU: "LXX-KNT-04",
    categoryId: "cat-knt",
    size: "XL",
    color: "Beige",
    costPrice: 55.0,
    salePrice: 110.00,
    stockQuantity: 8, // Under reorder level!
    reorderLevel: 15,
    supplierId: "sup-istanbul",
    status: "ACTIVE"
  },
  {
    id: "prod-denim-jeans",
    name: "Premium Denim Slim-Fit Jeans",
    SKU: "LXX-DNM-05",
    categoryId: "cat-dnm",
    size: "32/34",
    color: "Indigo Blue",
    costPrice: 20.0,
    salePrice: 45.00,
    stockQuantity: 2, // Low stock badge!
    reorderLevel: 10,
    supplierId: "sup-bakucotton",
    status: "ACTIVE"
  }
];

export const defaultCustomers: CustomerSeed[] = [
  {
    id: "cust-tashkent",
    name: "Tashkent Fashion Retail Ltd",
    phone: "+998 71 234 5678",
    email: "dilshod@tashfashioned.uz",
    address: "45 Navoi Blvd, Chorsu, Tashkent, Uzbekistan",
    type: "WHOLESALE",
    notes: "Major wholesale partner running 5 stores across Uzbekistan."
  },
  {
    id: "cust-samarkand",
    name: "Samarkand Boutique Owner",
    phone: "+998 66 111 2222",
    email: "madina@samarkandboutique.com",
    address: "12 Registon St, Samarkand, Uzbekistan",
    type: "RETAIL",
    notes: "High-end boutique buyer, regularly purchases dresses and sweaters."
  },
  {
    id: "cust-partners",
    name: "Central Asia Apparel Partners",
    phone: "+7 727 333 4455",
    email: "timur@caap.kz",
    address: "50 Abay Ave, Almaty, Kazakhstan",
    type: "PARTNER",
    notes: "Logistics and shipping alliance partner distributing to Central Asian countries."
  }
];

export const defaultLeads: LeadSeed[] = [
  {
    id: "lead-bukhara",
    name: "Kamila Rakhimova (Bukhara Retail)",
    phone: "+998 90 345 6789",
    email: "kamila@bukhara.uz",
    source: "Website",
    interest: "Summer Silk Floral Dress",
    status: "QUALIFIED",
    assignedToId: "user-sales",
    notes: "Requested a quote for 200 items in red/floral sizes S and M."
  },
  {
    id: "lead-urgench",
    name: "Nodir Bekmurodov (Urgench Men's Shop)",
    phone: "+998 93 111 3344",
    email: "nodir@urgench.uz",
    source: "Cold Call",
    interest: "Leather Biker Jackets",
    status: "CONTACTED",
    assignedToId: "user-sales",
    notes: "Intrigued by Turkish leather biker jackets, requested sample sizing."
  },
  {
    id: "lead-almaty",
    name: "Elena Kim (Almaty Fashion Mall)",
    phone: "+7 701 555 6677",
    email: "elena@almatyfashion.kz",
    source: "Referral",
    interest: "Knitwear / Sweaters",
    status: "NEW",
    assignedToId: "user-sales",
    notes: "Inquired through Turkish agents, very high budget client."
  }
];

export const defaultDeals: DealSeed[] = [
  {
    id: "deal-outerwear",
    customerId: "cust-tashkent",
    title: "Autumn Outerwear Contract",
    value: 5000.00,
    stage: "NEGOTIATION",
    expectedCloseDate: "2026-07-15",
    probability: 60,
    assignedToId: "user-sales"
  },
  {
    id: "deal-denim",
    customerId: "cust-partners",
    title: "Denim Bulk Order",
    value: 12500.00,
    stage: "PROSPECTING",
    expectedCloseDate: "2026-08-30",
    probability: 20,
    assignedToId: "user-sales"
  }
];

export const defaultTasks: TaskSeed[] = [
  {
    id: "task-nodir",
    title: "Call Nodir to follow up on winter jacket sizing",
    description: "Urgench buyer was busy last week. Need to confirm sizing measurements from Istanbul suppliers.",
    dueDate: "2026-06-12",
    priority: "HIGH",
    status: "PENDING",
    assignedToId: "user-sales",
    leadId: "lead-urgench"
  },
  {
    id: "task-denim",
    title: "Send denim bulk price catalog",
    description: "Compile and send PDF wholesale catalog to Central Asia Apparel Partners.",
    dueDate: "2026-06-10", // Overdue!
    priority: "MEDIUM",
    status: "PENDING",
    assignedToId: "user-sales",
    dealId: "deal-denim"
  },
  {
    id: "task-sample-completed",
    title: "Confirm SinoTex sample quality",
    description: "Inspected leggings sample received on June 1st. Passed QC standards.",
    dueDate: "2026-06-05",
    priority: "LOW",
    status: "COMPLETED",
    assignedToId: "user-sales"
  }
];

export const defaultInventoryMovements: InventoryMovementSeed[] = [
  {
    id: "mov-001",
    productId: "prod-leather-jkt",
    quantity: 50,
    type: "IN",
    reason: "PURCHASE",
    notes: "Initial inventory setup from Istanbul Apparel.",
    createdAt: "2026-05-10T10:00:00Z"
  },
  {
    id: "mov-002",
    productId: "prod-silk-drs",
    quantity: 120,
    type: "IN",
    reason: "PURCHASE",
    notes: "Initial inventory setup from SinoTex.",
    createdAt: "2026-05-10T10:05:00Z"
  },
  {
    id: "mov-003",
    productId: "prod- leggings",
    quantity: 80,
    type: "IN",
    reason: "PURCHASE",
    notes: "Initial activewear import.",
    createdAt: "2026-05-10T10:10:00Z"
  },
  {
    id: "mov-004",
    productId: "prod-cashmere-swtr",
    quantity: 8,
    type: "IN",
    reason: "PURCHASE",
    notes: "Initial knitwear stock import.",
    createdAt: "2026-05-10T10:15:00Z"
  },
  {
    id: "mov-005",
    productId: "prod-denim-jeans",
    quantity: 2,
    type: "IN",
    reason: "PURCHASE",
    notes: "Low-stock opening inventory.",
    createdAt: "2026-05-10T10:20:00Z"
  }
];

export const defaultPurchaseOrders: PurchaseOrderSeed[] = [
  {
    id: "po-001",
    orderNumber: "PO-2026-001",
    supplierId: "sup-istanbul",
    status: "RECEIVED",
    totalAmount: 4500.00,
    createdAt: "2026-05-08T09:00:00Z",
    items: [
      { productId: "prod-leather-jkt", quantity: 50, costPrice: 45.00 },
      { productId: "prod-cashmere-swtr", quantity: 10, costPrice: 55.00 }
    ]
  },
  {
    id: "po-002",
    orderNumber: "PO-2026-002",
    supplierId: "sup-sinotex",
    status: "ORDERED",
    totalAmount: 2200.00,
    createdAt: "2026-06-01T14:30:00Z",
    items: [
      { productId: "prod- silk-drs", quantity: 50, costPrice: 25.00 },
      { productId: "prod- leggings", quantity: 50, costPrice: 12.00 }
    ]
  }
];

export const defaultSalesOrders: SalesOrderSeed[] = [
  {
    id: "so-001",
    orderNumber: "SO-2026-001",
    customerId: "cust-tashkent",
    status: "COMPLETED",
    subtotal: 3599.60,
    discount: 100.00,
    tax: 0.00,
    total: 3499.60,
    createdAt: "2026-05-20T11:00:00Z",
    items: [
      { productId: "prod-leather-jkt", quantity: 20, unitPrice: 89.99, discount: 0, total: 1799.80 },
      { productId: "prod-silk-drs", quantity: 36, unitPrice: 49.99, discount: 0, total: 1799.80 }
    ]
  },
  {
    id: "so-002",
    orderNumber: "SO-2026-002",
    customerId: "cust-samarkand",
    status: "CONFIRMED",
    subtotal: 1249.75,
    discount: 50.00,
    tax: 0.00,
    total: 1199.75,
    createdAt: "2026-06-05T15:00:00Z",
    items: [
      { productId: "prod-silk-drs", quantity: 25, unitPrice: 49.99, discount: 0, total: 1249.75 }
    ]
  }
];

export const defaultInvoices: InvoiceSeed[] = [
  {
    id: "inv-001",
    invoiceNumber: "INV-2026-001",
    salesOrderId: "so-001",
    customerId: "cust-tashkent",
    totalAmount: 3499.60,
    paidAmount: 3499.60,
    status: "PAID",
    dueDate: "2026-06-20",
    createdAt: "2026-05-20T11:15:00Z"
  },
  {
    id: "inv-002",
    invoiceNumber: "INV-2026-002",
    salesOrderId: "so-002",
    customerId: "cust-samarkand",
    totalAmount: 1199.75,
    paidAmount: 500.00,
    status: "PARTIAL",
    dueDate: "2026-07-05",
    createdAt: "2026-06-05T15:10:00Z"
  }
];

export const defaultActivityLogs: ActivityLogSeed[] = [
  {
    id: "act-1",
    type: "LEAD_CREATED",
    description: "New Lead Elena Kim (Almaty Fashion Mall) was registered in the system.",
    userId: "user-sales",
    userName: "Timur Alimov",
    createdAt: "2026-06-11T09:00:00Z"
  },
  {
    id: "act-2",
    type: "SO_CREATED",
    description: "Sales Order SO-2026-002 confirmed for Samarkand Boutique Owner.",
    userId: "user-sales",
    userName: "Timur Alimov",
    createdAt: "2026-06-05T15:00:00Z"
  },
  {
    id: "act-3",
    type: "INVENTORY_UPDATE",
    description: "Low Stock Alert: Premium Denim Slim-Fit Jeans quantity is now 2 (reorder level is 10).",
    userId: "user-warehouse",
    userName: "Jasur Nematov",
    createdAt: "2026-06-10T12:00:00Z"
  },
  {
    id: "act-4",
    type: "PO_RECEIVED",
    description: "Purchase Order PO-2026-001 marked RECEIVED. Stock quantities updated.",
    userId: "user-warehouse",
    userName: "Jasur Nematov",
    createdAt: "2026-05-15T11:00:00Z"
  }
];
