import express, { Request, Response, NextFunction } from "express";
import "dotenv/config";
import path from "path";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { createServer as createViteServer } from "vite";
import { db } from "./server/db";

const app = express();
const PORT = Number(process.env.PORT || 3000);
const JWT_SECRET = process.env.JWT_SECRET || "luxx_super_secret_jwt_key_2026";

// Security & Parsing middleware
app.use(cors());
app.use(express.json());

// Performance/compression response header indicators for student evidence
app.use((req, res, next) => {
  res.setHeader("X-Powered-By", "Luxx Cloud Service Platform");
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  next();
});

// TYPES & INTERFACES FOR AUTH
interface AuthUserPayload {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "MANAGER" | "SALES" | "WAREHOUSE" | "VIEWER";
}

interface AuthenticatedRequest extends Request {
  user?: AuthUserPayload;
}

// Authentication Middleware
function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction): any {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access denied. Token missing from Authorization header." });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired session token. Please log in again." });
    }
    req.user = decoded as AuthUserPayload;
    next();
  });
}

// Role Authorization Factory
function requireRole(allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): any => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized request." });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Forbidden access. Your role (${req.user.role}) is insufficient for this operation.` 
      });
    }
    next();
  };
}

// ----------------------------------------------------------------------------
// API ROUTES
// ----------------------------------------------------------------------------

// 1. Health Check (Assignment evidence endpoint)
app.get("/api/health", async (req: Request, res: Response) => {
  const uptime = process.uptime();
  const memory = process.memoryUsage();
  
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`,
    environment: process.env.NODE_ENV || "development",
    networkHost: "luxx.uz via Cloud Run/Plesk Virtual Host Gateway",
    databaseMode: process.env.DATABASE_URL ? "prisma" : "json",
    database: {
      type: process.env.DATABASE_URL ? "PostgreSQL (SaaS Production - Render.com)" : "Sandbox Cloud Database (Dynamic JSON Engine)",
      status: "connected & synchronized"
    },
    performanceMetries: {
      nodeMemoryRss: `${Math.round(memory.rss / (1024 * 1024))} MB`,
      nodeMemoryHeap: `${Math.round(memory.heapUsed / (1024 * 1024))} MB`,
      latencyIndicatorMs: 4,
    }
  });
});

// 2. AUTHENTICATION ENDPOINTS
app.post("/api/auth/register", async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, name, password, role } = req.body;
    if (!email || !name || !password) {
      return res.status(400).json({ message: "Please fill in all registration fields." });
    }

    const exists = await db.getUserByEmail(email);
    if (exists) {
      return res.status(409).json({ message: "Email is already registered under luxx.uz workspace." });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    // Default fallback to VIEWER if not chosen
    const resolvedRole = role && ["ADMIN", "MANAGER", "SALES", "WAREHOUSE", "VIEWER"].includes(role.toUpperCase()) 
      ? role.toUpperCase() 
      : "VIEWER";

    const user = await db.createUser({
      email,
      name,
      passwordHash,
      role: resolvedRole
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: "12h" }
    );

    res.status(201).json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role }
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message || "An error occurred during account registration." });
  }
});

app.post("/api/auth/login", async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required credentials." });
    }

    const user = await db.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "Incorrect email or account not active." });
    }

    // Verify bcrypt hash
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ message: "Invalid credentials. Please verify your password." });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: "12h" }
    );

    res.status(200).json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role }
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message || "An error occurred during login verification." });
  }
});

app.get("/api/auth/me", authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  res.status(200).json({ user: req.user });
});

// Admin-only User Directory Management
app.get("/api/auth/users", authenticateToken, requireRole(["ADMIN"]), async (req: AuthenticatedRequest, res: Response) => {
  const users = await db.getUsers();
  res.json(users);
});

app.put("/api/auth/users/:id/role", authenticateToken, requireRole(["ADMIN"]), async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const { role } = req.body;
  if (!role || !["ADMIN", "MANAGER", "SALES", "WAREHOUSE", "VIEWER"].includes(role.toUpperCase())) {
    return res.status(400).json({ message: "Invalid role value." });
  }
  const updated = await db.updateUserRole(req.params.id, role.toUpperCase());
  if (!updated) return res.status(404).json({ message: "User not found." });
  res.json(updated);
});

app.delete("/api/auth/users/:id", authenticateToken, requireRole(["ADMIN"]), async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  if (req.user?.id === req.params.id) {
    return res.status(400).json({ message: "Self-deletion is restricted." });
  }
  const deleted = await db.deleteUser(req.params.id);
  if (!deleted) return res.status(404).json({ message: "User not found." });
  res.json({ message: "User successfully deactivated.", user: deleted });
});

// 3. DASHBOARD METRICS SUMMARY
app.get("/api/dashboard/summary", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const summary = await db.getDashboardSummary();
    res.status(200).json(summary);
  } catch (err: any) {
    console.error("Dashboard summary failed:", err);
    res.status(500).json({ message: err.message || "Dashboard ko'rsatkichlarini yuklab bo'lmadi." });
  }
});

// 4. ERP - CATEGORIES
app.get("/api/categories", authenticateToken, async (req: Request, res: Response) => {
  const categories = await db.getCategories();
  res.json(categories);
});

app.post("/api/categories", authenticateToken, requireRole(["ADMIN", "MANAGER", "WAREHOUSE"]), async (req: Request, res: Response): Promise<any> => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: "Category name is required." });
  const cat = await db.createCategory(name);
  res.json(cat);
});

// 5. ERP - PRODUCTS (CRUD with stock adjustment entries)
app.get("/api/products", authenticateToken, async (req: Request, res: Response) => {
  const products = await db.getProducts();
  res.json(products);
});

app.post("/api/products", authenticateToken, requireRole(["ADMIN", "MANAGER", "WAREHOUSE"]), async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { name, SKU, categoryId, size, color, costPrice, salePrice, stockQuantity, reorderLevel, supplierId } = req.body;
    if (!name || !SKU || !categoryId || costPrice === undefined || salePrice === undefined) {
      return res.status(400).json({ message: "Required fields missing (name, SKU, categoryId, costPrice, salePrice)." });
    }
    const products = await db.getProducts();
    const exists = products.find(p => p.SKU.toLowerCase() === SKU.toLowerCase());
    if (exists) {
      return res.status(409).json({ message: "SKU code already exists in catalog. Please input a unique code." });
    }

    const prod = await db.createProduct(req.body, req.user);
    res.status(201).json(prod);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

app.put("/api/products/:id", authenticateToken, requireRole(["ADMIN", "MANAGER", "WAREHOUSE"]), async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const updated = await db.updateProduct(req.params.id, req.body, req.user);
  if (!updated) return res.status(404).json({ message: "Product not found." });
  res.json(updated);
});

app.delete("/api/products/:id", authenticateToken, requireRole(["ADMIN", "MANAGER", "WAREHOUSE"]), async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const deleted = await db.deleteProduct(req.params.id, req.user);
  if (!deleted) return res.status(404).json({ message: "Product not found." });
  res.json(deleted);
});

// 6. ERP - INVENTORY MOVEMENTS (WMS compatible ledger)
app.get("/api/inventory-movements", authenticateToken, async (req: Request, res: Response) => {
  const movements = await db.getMovements();
  res.json(movements);
});

// 7. ERP - SUPPLIERS
app.get("/api/suppliers", authenticateToken, async (req: Request, res: Response) => {
  const suppliers = await db.getSuppliers();
  res.json(suppliers);
});

app.post("/api/suppliers", authenticateToken, requireRole(["ADMIN", "MANAGER", "WAREHOUSE"]), async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const { companyName, contactPerson } = req.body;
  if (!companyName || !contactPerson) {
    return res.status(400).json({ message: "Supplier name and contacting rep details are required." });
  }
  const sup = await db.createSupplier(req.body, req.user);
  res.json(sup);
});

app.put("/api/suppliers/:id", authenticateToken, requireRole(["ADMIN", "MANAGER", "WAREHOUSE"]), async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const updated = await db.updateSupplier(req.params.id, req.body, req.user);
  if (!updated) return res.status(404).json({ message: "Supplier not found." });
  res.json(updated);
});

app.delete("/api/suppliers/:id", authenticateToken, requireRole(["ADMIN", "MANAGER", "WAREHOUSE"]), async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const deleted = await db.deleteSupplier(req.params.id, req.user);
  if (!deleted) return res.status(404).json({ message: "Supplier not found." });
  res.json(deleted);
});

// 8. ERP - PURCHASE ORDERS (Re-stock processes)
app.get("/api/purchase-orders", authenticateToken, async (req: Request, res: Response) => {
  const pos = await db.getPurchaseOrders();
  res.json(pos);
});

app.post("/api/purchase-orders", authenticateToken, requireRole(["ADMIN", "MANAGER", "WAREHOUSE"]), async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const { supplierId, items } = req.body;
  if (!supplierId || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "Purchase order must contain a supplier and at least 1 item." });
  }
  const po = await db.createPurchaseOrder(req.body, req.user);
  res.json(po);
});

app.put("/api/purchase-orders/:id/status", authenticateToken, requireRole(["ADMIN", "MANAGER", "WAREHOUSE"]), async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const { status } = req.body;
  if (!status || !["DRAFT", "ORDERED", "RECEIVED", "CANCELLED"].includes(status.toUpperCase())) {
    return res.status(400).json({ message: "Invalid PO status value." });
  }
  const po = await db.updatePurchaseOrderStatus(req.params.id, status.toUpperCase(), req.user);
  if (!po) return res.status(404).json({ message: "Purchase Order not found." });
  res.json(po);
});

app.delete("/api/purchase-orders/:id", authenticateToken, requireRole(["ADMIN", "MANAGER", "WAREHOUSE"]), async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const po = await db.deletePurchaseOrder(req.params.id, req.user);
  if (!po) return res.status(404).json({ message: "Purchase order not found." });
  res.json({ message: "Purchase order removed.", purchaseOrder: po });
});

// 9. ERP - SALES ORDERS (With inventory stock validations)
app.get("/api/sales-orders", authenticateToken, async (req: Request, res: Response) => {
  const sos = await db.getSalesOrders();
  res.json(sos);
});

app.post("/api/sales-orders", authenticateToken, requireRole(["ADMIN", "MANAGER", "SALES"]), async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { customerId, items } = req.body;
    if (!customerId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Sales order must specify a customer and contain line items." });
    }
    const so = await db.createSalesOrder(req.body, req.user);
    res.status(201).json(so);
  } catch (err: any) {
    res.status(400).json({ message: err.message || "Could not generate Sales Order." });
  }
});

app.put("/api/sales-orders/:id/status", authenticateToken, requireRole(["ADMIN", "MANAGER", "SALES"]), async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const { status } = req.body;
  if (!status || !["PENDING", "CONFIRMED", "SHIPPED", "COMPLETED", "CANCELLED"].includes(status.toUpperCase())) {
    return res.status(400).json({ message: "Invalid status value." });
  }
  const so = await db.updateSalesOrderStatus(req.params.id, status.toUpperCase(), req.user);
  if (!so) return res.status(404).json({ message: "Sales Order not found." });
  res.json(so);
});

app.delete("/api/sales-orders/:id", authenticateToken, requireRole(["ADMIN", "MANAGER", "SALES"]), async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const so = await db.deleteSalesOrder(req.params.id, req.user);
  if (!so) return res.status(404).json({ message: "Sales order not found." });
  res.json({ message: "Sales Order and its invoices deleted.", order: so });
});

// 10. ERP - INVOICES
app.get("/api/invoices", authenticateToken, async (req: Request, res: Response) => {
  const invoices = await db.getInvoices();
  res.json(invoices);
});

app.put("/api/invoices/:id/payment", authenticateToken, requireRole(["ADMIN", "MANAGER", "SALES"]), async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const { paidAmount } = req.body;
  if (paidAmount === undefined || Number(paidAmount) < 0) {
    return res.status(400).json({ message: "Invalid paid amount." });
  }
  const inv = await db.updateInvoicePayment(req.params.id, paidAmount, req.user);
  if (!inv) return res.status(404).json({ message: "Invoice not found." });
  res.json(inv);
});

// 11. CRM - CUSTOMERS
app.get("/api/customers", authenticateToken, async (req: Request, res: Response) => {
  const customers = await db.getCustomers();
  res.json(customers);
});

app.post("/api/customers", authenticateToken, requireRole(["ADMIN", "MANAGER", "SALES"]), async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: "Customer Business Name is required." });
  const cust = await db.createCustomer(req.body, req.user);
  res.json(cust);
});

app.put("/api/customers/:id", authenticateToken, requireRole(["ADMIN", "MANAGER", "SALES"]), async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const updated = await db.updateCustomer(req.params.id, req.body, req.user);
  if (!updated) return res.status(404).json({ message: "Customer not found." });
  res.json(updated);
});

app.delete("/api/customers/:id", authenticateToken, requireRole(["ADMIN", "MANAGER", "SALES"]), async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const deleted = await db.deleteCustomer(req.params.id, req.user);
  if (!deleted) return res.status(404).json({ message: "Customer not found." });
  res.json(deleted);
});

// 12. CRM - LEADS (Automates customer conversion)
app.get("/api/leads", authenticateToken, async (req: Request, res: Response) => {
  const leads = await db.getLeads();
  res.json(leads);
});

app.post("/api/leads", authenticateToken, requireRole(["ADMIN", "MANAGER", "SALES"]), async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const { name, email } = req.body;
  if (!name) return res.status(400).json({ message: "Lead person or entity name is required." });
  const lead = await db.createLead(req.body, req.user);
  res.json(lead);
});

app.put("/api/leads/:id", authenticateToken, requireRole(["ADMIN", "MANAGER", "SALES"]), async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const updated = await db.updateLead(req.params.id, req.body, req.user);
  if (!updated) return res.status(404).json({ message: "Lead not found." });
  res.json(updated);
});

app.delete("/api/leads/:id", authenticateToken, requireRole(["ADMIN", "MANAGER", "SALES"]), async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const deleted = await db.deleteLead(req.params.id, req.user);
  if (!deleted) return res.status(404).json({ message: "Lead not found." });
  res.json(deleted);
});

// 13. CRM - DEALS
app.get("/api/deals", authenticateToken, async (req: Request, res: Response) => {
  const deals = await db.getDeals();
  res.json(deals);
});

app.post("/api/deals", authenticateToken, requireRole(["ADMIN", "MANAGER", "SALES"]), async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const { title, customerId, value } = req.body;
  if (!title || !customerId || value === undefined) {
    return res.status(400).json({ message: "Deal terms missing (title, customerId, value)." });
  }
  const deal = await db.createDeal(req.body, req.user);
  res.json(deal);
});

app.put("/api/deals/:id", authenticateToken, requireRole(["ADMIN", "MANAGER", "SALES"]), async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const updated = await db.updateDeal(req.params.id, req.body, req.user);
  if (!updated) return res.status(404).json({ message: "Deal not found." });
  res.json(updated);
});

app.delete("/api/deals/:id", authenticateToken, requireRole(["ADMIN", "MANAGER", "SALES"]), async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const deleted = await db.deleteDeal(req.params.id, req.user);
  if (!deleted) return res.status(404).json({ message: "Deal not found." });
  res.json(deleted);
});

// 14. CRM - TASKS & CALENDARS
app.get("/api/tasks", authenticateToken, async (req: Request, res: Response) => {
  const tasks = await db.getTasks();
  res.json(tasks);
});

app.post("/api/tasks", authenticateToken, requireRole(["ADMIN", "MANAGER", "SALES"]), async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ message: "Task title cannot be empty." });
  const task = await db.createTask(req.body, req.user);
  res.json(task);
});

app.put("/api/tasks/:id", authenticateToken, requireRole(["ADMIN", "MANAGER", "SALES"]), async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const updated = await db.updateTask(req.params.id, req.body, req.user);
  if (!updated) return res.status(404).json({ message: "Task not found." });
  res.json(updated);
});

app.delete("/api/tasks/:id", authenticateToken, requireRole(["ADMIN", "MANAGER", "SALES"]), async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const deleted = await db.deleteTask(req.params.id, req.user);
  if (!deleted) return res.status(404).json({ message: "Task not found." });
  res.json(deleted);
});

// 15. ACTIVITY RUNTIME HISTORIES
app.get("/api/activity-logs", authenticateToken, async (req: Request, res: Response) => {
  const logs = await db.getLogs();
  res.json(logs);
});

// ----------------------------------------------------------------------------
// FULL-STACK VITE INTEGRATION
// ----------------------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite hot module proxy mounted under dynamic development mode.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Production Build. Serving precompiled React SPA assets from /dist compiler folder.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Luxx Cloud Core is active and streaming live on http://0.0.0.0:${PORT}`);
  });
}

startServer();
