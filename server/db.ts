import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { 
  defaultUsers, 
  defaultCategories, 
  defaultSuppliers, 
  defaultProducts, 
  defaultCustomers, 
  defaultLeads, 
  defaultDeals, 
  defaultTasks, 
  defaultInventoryMovements, 
  defaultPurchaseOrders, 
  defaultSalesOrders, 
  defaultInvoices, 
  defaultActivityLogs,
  UserSeed,
  CategorySeed,
  SupplierSeed,
  ProductSeed,
  CustomerSeed,
  LeadSeed,
  DealSeed,
  TaskSeed,
  InventoryMovementSeed,
  PurchaseOrderSeed,
  SalesOrderSeed,
  InvoiceSeed,
  ActivityLogSeed
} from "./seedData";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

// Define full interface for JSON DB
interface JsonDatabase {
  users: UserSeed[];
  categories: CategorySeed[];
  suppliers: SupplierSeed[];
  products: ProductSeed[];
  customers: CustomerSeed[];
  leads: LeadSeed[];
  deals: DealSeed[];
  tasks: TaskSeed[];
  movements: InventoryMovementSeed[];
  purchaseOrders: PurchaseOrderSeed[];
  salesOrders: SalesOrderSeed[];
  invoices: InvoiceSeed[];
  logs: ActivityLogSeed[];
}

let jsonDb: JsonDatabase | null = null;
let prisma: PrismaClient | null = null;
let usePrisma = false;

// Initialize db connection or JSON fallback
function initDb() {
  if (process.env.DATABASE_URL) {
    try {
      prisma = new PrismaClient({
        datasources: {
          db: {
            url: process.env.DATABASE_URL,
          },
        },
      });
      usePrisma = true;
      console.log("Database URL found. Running with Prisma PostgreSQL client in production mode.");
    } catch (e) {
      console.error("Prisma failed to initialize, falling back to JSON DB: ", e);
      usePrisma = false;
    }
  }

  if (!usePrisma) {
    console.log("No PostgreSQL DATABASE_URL detected. Running in Sandbox JSON-file database mode.");
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (!fs.existsSync(DB_FILE)) {
      // Load initial seeds
      jsonDb = {
        users: [...defaultUsers],
        categories: [...defaultCategories],
        suppliers: [...defaultSuppliers],
        products: [...defaultProducts],
        customers: [...defaultCustomers],
        leads: [...defaultLeads],
        deals: [...defaultDeals],
        tasks: [...defaultTasks],
        movements: [...defaultInventoryMovements],
        purchaseOrders: [...defaultPurchaseOrders],
        salesOrders: [...defaultSalesOrders],
        invoices: [...defaultInvoices],
        logs: [...defaultActivityLogs]
      };
      saveJsonDb();
      console.log("JSON Database seeded and created in data/db.json.");
    } else {
      try {
        const raw = fs.readFileSync(DB_FILE, "utf-8");
        jsonDb = JSON.parse(raw);
        console.log("Loaded existing local database from data/db.json.");
      } catch (err) {
        console.error("Error reading db.json, generating a new one", err);
        jsonDb = {
          users: [...defaultUsers],
          categories: [...defaultCategories],
          suppliers: [...defaultSuppliers],
          products: [...defaultProducts],
          customers: [...defaultCustomers],
          leads: [...defaultLeads],
          deals: [...defaultDeals],
          tasks: [...defaultTasks],
          movements: [...defaultInventoryMovements],
          purchaseOrders: [...defaultPurchaseOrders],
          salesOrders: [...defaultSalesOrders],
          invoices: [...defaultInvoices],
          logs: [...defaultActivityLogs]
        };
        saveJsonDb();
      }
    }
  }
}

function saveJsonDb() {
  if (jsonDb) {
    fs.writeFileSync(DB_FILE, JSON.stringify(jsonDb, null, 2), "utf-8");
  }
}

// Ensure database is initialized
initDb();

function logActivity(type: string, description: string, userId?: string, userName?: string) {
  const newLog: ActivityLogSeed = {
    id: `act-${Date.now()}`,
    type,
    description,
    userId: userId || "system",
    userName: userName || "System",
    createdAt: new Date().toISOString()
  };
  if (usePrisma && prisma) {
    prisma.activityLog.create({
      data: {
        type,
        description,
        userId: userId || null,
        userName: userName || null
      }
    }).catch(err => console.error("Prisma logged failed", err));
  } else if (jsonDb) {
    jsonDb.logs.unshift(newLog);
    saveJsonDb();
  }
}

// DATABASE LAYER APIS
export const db = {
  // Activity Logs
  async getLogs() {
    if (usePrisma && prisma) {
      return await prisma.activityLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 100
      });
    }
    return jsonDb?.logs || [];
  },

  async addLog(type: string, description: string, userId?: string, userName?: string) {
    logActivity(type, description, userId, userName);
  },

  // USERS REST API AND AUTH
  async getUserByEmail(email: string) {
    if (usePrisma && prisma) {
      return await prisma.user.findUnique({ where: { email } });
    }
    return jsonDb?.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  async getUserById(id: string) {
    if (usePrisma && prisma) {
      return await prisma.user.findUnique({ where: { id } });
    }
    return jsonDb?.users.find(u => u.id === id) || null;
  },

  async getUsers() {
    if (usePrisma && prisma) {
      return await prisma.user.findMany({ select: { id: true, email: true, name: true, role: true, createdAt: true } });
    }
    return jsonDb?.users.map(({ id, email, name, role }) => ({ id, email, name, role })) || [];
  },

  async createUser(data: { email: string; name: string; passwordHash: string; role: any }) {
    if (usePrisma && prisma) {
      const user = await prisma.user.create({ data });
      logActivity("USER_CREATED", `User ${data.name} (${data.email}) created with role ${data.role}`);
      return user;
    }
    if (jsonDb) {
      const newUser: UserSeed = {
        id: `user-${Date.now()}`,
        email: data.email,
        name: data.name,
        passwordHash: data.passwordHash,
        role: data.role
      };
      jsonDb.users.push(newUser);
      saveJsonDb();
      logActivity("USER_CREATED", `User ${data.name} (${data.email}) registered as ${data.role}`);
      return newUser;
    }
    throw new Error("DB not initialized");
  },

  async updateUserRole(id: string, role: any) {
    if (usePrisma && prisma) {
      const user = await prisma.user.update({ where: { id }, data: { role } });
      logActivity("USER_ROLE_UPDATED", `User ${user.name} role updated to ${role}`);
      return user;
    }
    if (jsonDb) {
      const idx = jsonDb.users.findIndex(u => u.id === id);
      if (idx !== -1) {
        jsonDb.users[idx].role = role;
        saveJsonDb();
        logActivity("USER_ROLE_UPDATED", `User ${jsonDb.users[idx].name} role updated to ${role}`);
        return jsonDb.users[idx];
      }
    }
    return null;
  },

  async deleteUser(id: string) {
    if (usePrisma && prisma) {
      const user = await prisma.user.delete({ where: { id } });
      logActivity("USER_DELETED", `User ${user.name} deleted.`);
      return user;
    }
    if (jsonDb) {
      const idx = jsonDb.users.findIndex(u => u.id === id);
      if (idx !== -1) {
        const deleted = jsonDb.users.splice(idx, 1)[0];
        saveJsonDb();
        logActivity("USER_DELETED", `User ${deleted.name} deleted.`);
        return deleted;
      }
    }
    return null;
  },

  // PRODUCTS
  async getProducts() {
    if (usePrisma && prisma) {
      return await prisma.product.findMany({
        include: { category: true, supplier: true },
        orderBy: { name: "asc" }
      });
    }
    if (jsonDb) {
      return jsonDb.products.map(p => ({
        ...p,
        category: jsonDb!.categories.find(c => c.id === p.categoryId),
        supplier: jsonDb!.suppliers.find(s => s.id === p.supplierId)
      }));
    }
    return [];
  },

  async createProduct(data: any, author?: any) {
    if (usePrisma && prisma) {
      const prod = await prisma.product.create({ data });
      logActivity("PRODUCT_CREATED", `Product ${prod.name} created. Stock: ${prod.stockQuantity}`, author?.id, author?.name);
      return prod;
    }
    if (jsonDb) {
      const id = `prod-${Date.now()}`;
      const newProd: ProductSeed = {
        id,
        name: data.name,
        SKU: data.SKU,
        categoryId: data.categoryId,
        size: data.size || "",
        color: data.color || "",
        costPrice: Number(data.costPrice),
        salePrice: Number(data.salePrice),
        stockQuantity: Number(data.stockQuantity || 0),
        reorderLevel: Number(data.reorderLevel || 5),
        supplierId: data.supplierId || "",
        status: "ACTIVE"
      };
      jsonDb.products.push(newProd);

      // Create initial stock movement if quantity > 0
      if (newProd.stockQuantity > 0) {
        const mvId = `mov-${Date.now()}`;
        jsonDb.movements.push({
          id: mvId,
          productId: id,
          quantity: newProd.stockQuantity,
          type: "IN",
          reason: "ADJUSTMENT",
          notes: "Initial inventory setup.",
          createdAt: new Date().toISOString()
        });
      }

      saveJsonDb();
      logActivity("PRODUCT_CREATED", `Product ${newProd.name} (SKU: ${newProd.SKU}) added manually with ${newProd.stockQuantity} stock.`, author?.id, author?.name);
      return newProd;
    }
    throw new Error("DB not initialized");
  },

  async updateProduct(id: string, data: any, author?: any) {
    if (usePrisma && prisma) {
      const prod = await prisma.product.update({ where: { id }, data });
      logActivity("PRODUCT_UPDATED", `Product ${prod.name} updated.`, author?.id, author?.name);
      return prod;
    }
    if (jsonDb) {
      const idx = jsonDb.products.findIndex(p => p.id === id);
      if (idx !== -1) {
        const oldStock = jsonDb.products[idx].stockQuantity;
        const newStock = data.stockQuantity !== undefined ? Number(data.stockQuantity) : oldStock;

        jsonDb.products[idx] = {
          ...jsonDb.products[idx],
          name: data.name ?? jsonDb.products[idx].name,
          SKU: data.SKU ?? jsonDb.products[idx].SKU,
          categoryId: data.categoryId ?? jsonDb.products[idx].categoryId,
          size: data.size ?? jsonDb.products[idx].size,
          color: data.color ?? jsonDb.products[idx].color,
          costPrice: data.costPrice !== undefined ? Number(data.costPrice) : jsonDb.products[idx].costPrice,
          salePrice: data.salePrice !== undefined ? Number(data.salePrice) : jsonDb.products[idx].salePrice,
          stockQuantity: newStock,
          reorderLevel: data.reorderLevel !== undefined ? Number(data.reorderLevel) : jsonDb.products[idx].reorderLevel,
          supplierId: data.supplierId ?? jsonDb.products[idx].supplierId,
          status: data.status ?? jsonDb.products[idx].status,
        };

        // Create adjustment entry if stock quantity changed directly
        if (newStock !== oldStock) {
          const type = newStock > oldStock ? "IN" : "OUT";
          const diff = Math.abs(newStock - oldStock);
          jsonDb.movements.push({
            id: `mov-${Date.now()}`,
            productId: id,
            quantity: diff,
            type,
            reason: "ADJUSTMENT",
            notes: "Manual inventory stock adjustment.",
            createdAt: new Date().toISOString()
          });
        }

        saveJsonDb();
        logActivity("PRODUCT_UPDATED", `Product ${jsonDb.products[idx].name} updated fields. Stock changed from ${oldStock} to ${newStock}.`, author?.id, author?.name);
        return jsonDb.products[idx];
      }
    }
    return null;
  },

  async deleteProduct(id: string, author?: any) {
    if (usePrisma && prisma) {
      const prod = await prisma.product.delete({ where: { id } });
      logActivity("PRODUCT_DELETED", `Product ${prod.name} deleted.`, author?.id, author?.name);
      return prod;
    }
    if (jsonDb) {
      const idx = jsonDb.products.findIndex(p => p.id === id);
      if (idx !== -1) {
        const deleted = jsonDb.products.splice(idx, 1)[0];
        saveJsonDb();
        logActivity("PRODUCT_DELETED", `Product ${deleted.name} deleted.`, author?.id, author?.name);
        return deleted;
      }
    }
    return null;
  },

  // CATEGORIES
  async getCategories() {
    if (usePrisma && prisma) {
      return await prisma.category.findMany({ orderBy: { name: "asc" } });
    }
    return jsonDb?.categories || [];
  },

  async createCategory(name: string) {
    if (usePrisma && prisma) {
      return await prisma.category.create({ data: { name } });
    }
    if (jsonDb) {
      const exists = jsonDb.categories.find(c => c.name.toLowerCase() === name.toLowerCase());
      if (exists) return exists;

      const newCat = {
        id: `cat-${Date.now()}`,
        name
      };
      jsonDb.categories.push(newCat);
      saveJsonDb();
      return newCat;
    }
    throw new Error("DB not initialized");
  },

  // SUPPLIERS
  async getSuppliers() {
    if (usePrisma && prisma) {
      return await prisma.supplier.findMany({ orderBy: { companyName: "asc" } });
    }
    return jsonDb?.suppliers || [];
  },

  async createSupplier(data: any, author?: any) {
    if (usePrisma && prisma) {
      const sup = await prisma.supplier.create({ data });
      logActivity("SUPPLIER_CREATED", `Supplier ${sup.companyName} created.`, author?.id, author?.name);
      return sup;
    }
    if (jsonDb) {
      const newSup: SupplierSeed = {
        id: `sup-${Date.now()}`,
        companyName: data.companyName,
        contactPerson: data.contactPerson,
        phone: data.phone || "",
        email: data.email || "",
        address: data.address || "",
        notes: data.notes || ""
      };
      jsonDb.suppliers.push(newSup);
      saveJsonDb();
      logActivity("SUPPLIER_CREATED", `Supplier ${newSup.companyName} added to cloud CRM directory.`, author?.id, author?.name);
      return newSup;
    }
    throw new Error("DB not initialized");
  },

  async updateSupplier(id: string, data: any, author?: any) {
    if (usePrisma && prisma) {
      const sup = await prisma.supplier.update({ where: { id }, data });
      logActivity("SUPPLIER_UPDATED", `Supplier ${sup.companyName} updated.`, author?.id, author?.name);
      return sup;
    }
    if (jsonDb) {
      const idx = jsonDb.suppliers.findIndex(s => s.id === id);
      if (idx !== -1) {
        jsonDb.suppliers[idx] = {
          ...jsonDb.suppliers[idx],
          companyName: data.companyName ?? jsonDb.suppliers[idx].companyName,
          contactPerson: data.contactPerson ?? jsonDb.suppliers[idx].contactPerson,
          phone: data.phone ?? jsonDb.suppliers[idx].phone,
          email: data.email ?? jsonDb.suppliers[idx].email,
          address: data.address ?? jsonDb.suppliers[idx].address,
          notes: data.notes ?? jsonDb.suppliers[idx].notes
        };
        saveJsonDb();
        logActivity("SUPPLIER_UPDATED", `Supplier ${jsonDb.suppliers[idx].companyName} details updated.`, author?.id, author?.name);
        return jsonDb.suppliers[idx];
      }
    }
    return null;
  },

  async deleteSupplier(id: string, author?: any) {
    if (usePrisma && prisma) {
      const sup = await prisma.supplier.delete({ where: { id } });
      logActivity("SUPPLIER_DELETED", `Supplier ${sup.companyName} deleted.`, author?.id, author?.name);
      return sup;
    }
    if (jsonDb) {
      const idx = jsonDb.suppliers.findIndex(s => s.id === id);
      if (idx !== -1) {
        const deleted = jsonDb.suppliers.splice(idx, 1)[0];
        saveJsonDb();
        logActivity("SUPPLIER_DELETED", `Supplier ${deleted.companyName} deleted.`, author?.id, author?.name);
        return deleted;
      }
    }
    return null;
  },

  // INVENTORY MOVEMENTS
  async getMovements() {
    if (usePrisma && prisma) {
      return await prisma.inventoryMovement.findMany({
        include: { product: true },
        orderBy: { createdAt: "desc" }
      });
    }
    if (jsonDb) {
      return jsonDb.movements.map(m => ({
        ...m,
        product: jsonDb!.products.find(p => p.id === m.productId)
      })).sort((a,b) => b.createdAt.localeCompare(a.createdAt));
    }
    return [];
  },

  async addStockMovement(productId: string, quantity: number, type: "IN" | "OUT", reason: string, notes?: string) {
    if (jsonDb) {
      const prod = jsonDb.products.find(p => p.id === productId);
      if (prod) {
        if (type === "IN") {
          prod.stockQuantity += quantity;
        } else {
          prod.stockQuantity = Math.max(0, prod.stockQuantity - quantity);
        }
        jsonDb.movements.push({
          id: `mov-${Date.now()}`,
          productId,
          quantity,
          type,
          reason: reason as any,
          notes: notes || "",
          createdAt: new Date().toISOString()
        });
        saveJsonDb();
      }
    }
  },

  // CUSTOMERS
  async getCustomers() {
    if (usePrisma && prisma) {
      return await prisma.customer.findMany({ orderBy: { name: "asc" } });
    }
    return jsonDb?.customers || [];
  },

  async createCustomer(data: any, author?: any) {
    if (usePrisma && prisma) {
      const cust = await prisma.customer.create({ data });
      logActivity("CUSTOMER_CREATED", `Customer ${cust.name} added. Type: ${cust.type}`, author?.id, author?.name);
      return cust;
    }
    if (jsonDb) {
      const newCust: CustomerSeed = {
        id: `cust-${Date.now()}`,
        name: data.name,
        phone: data.phone || "",
        email: data.email || "",
        address: data.address || "",
        type: data.type || "WHOLESALE",
        notes: data.notes || ""
      };
      jsonDb.customers.push(newCust);
      saveJsonDb();
      logActivity("CUSTOMER_CREATED", `Customer ${newCust.name} (${newCust.type}) created.`, author?.id, author?.name);
      return newCust;
    }
    throw new Error("DB not initialized");
  },

  async updateCustomer(id: string, data: any, author?: any) {
    if (usePrisma && prisma) {
      const cust = await prisma.customer.update({ where: { id }, data });
      logActivity("CUSTOMER_UPDATED", `Customer ${cust.name} details updated.`, author?.id, author?.name);
      return cust;
    }
    if (jsonDb) {
      const idx = jsonDb.customers.findIndex(c => c.id === id);
      if (idx !== -1) {
        jsonDb.customers[idx] = {
          ...jsonDb.customers[idx],
          name: data.name ?? jsonDb.customers[idx].name,
          phone: data.phone ?? jsonDb.customers[idx].phone,
          email: data.email ?? jsonDb.customers[idx].email,
          address: data.address ?? jsonDb.customers[idx].address,
          type: data.type ?? jsonDb.customers[idx].type,
          notes: data.notes ?? jsonDb.customers[idx].notes
        };
        saveJsonDb();
        logActivity("CUSTOMER_UPDATED", `Customer ${jsonDb.customers[idx].name} updated.`, author?.id, author?.name);
        return jsonDb.customers[idx];
      }
    }
    return null;
  },

  async deleteCustomer(id: string, author?: any) {
    if (usePrisma && prisma) {
      const cust = await prisma.customer.delete({ where: { id } });
      logActivity("CUSTOMER_DELETED", `Customer ${cust.name} deleted.`, author?.id, author?.name);
      return cust;
    }
    if (jsonDb) {
      const idx = jsonDb.customers.findIndex(c => c.id === id);
      if (idx !== -1) {
        const deleted = jsonDb.customers.splice(idx, 1)[0];
        saveJsonDb();
        logActivity("CUSTOMER_DELETED", `Customer ${deleted.name} deleted.`, author?.id, author?.name);
        return deleted;
      }
    }
    return null;
  },

  // LEADS
  async getLeads() {
    if (usePrisma && prisma) {
      return await prisma.lead.findMany({
        include: { assignedTo: true },
        orderBy: { createdAt: "desc" }
      });
    }
    if (jsonDb) {
      return jsonDb.leads.map(l => ({
        ...l,
        assignedTo: jsonDb!.users.find(u => u.id === l.assignedToId)
      }));
    }
    return [];
  },

  async createLead(data: any, author?: any) {
    if (usePrisma && prisma) {
      const lead = await prisma.lead.create({ data });
      logActivity("LEAD_CREATED", `Lead ${lead.name} registered. Status: ${lead.status}`, author?.id, author?.name);
      return lead;
    }
    if (jsonDb) {
      const newLead: LeadSeed = {
        id: `lead-${Date.now()}`,
        name: data.name,
        phone: data.phone || "",
        email: data.email || "",
        source: data.source || "Website",
        interest: data.interest || "",
        status: data.status || "NEW",
        assignedToId: data.assignedToId || "user-sales",
        notes: data.notes || ""
      };
      jsonDb.leads.push(newLead);
      saveJsonDb();
      logActivity("LEAD_CREATED", `Lead ${newLead.name} added. Interest: ${newLead.interest}.`, author?.id, author?.name);
      return newLead;
    }
    throw new Error("DB not initialized");
  },

  async updateLead(id: string, data: any, author?: any) {
    if (usePrisma && prisma) {
      const lead = await prisma.lead.update({ where: { id }, data });
      logActivity("LEAD_UPDATED", `Lead ${lead.name} updated. Status: ${lead.status}`, author?.id, author?.name);
      return lead;
    }
    if (jsonDb) {
      const idx = jsonDb.leads.findIndex(l => l.id === id);
      if (idx !== -1) {
        const oldStatus = jsonDb.leads[idx].status;
        jsonDb.leads[idx] = {
          ...jsonDb.leads[idx],
          name: data.name ?? jsonDb.leads[idx].name,
          phone: data.phone ?? jsonDb.leads[idx].phone,
          email: data.email ?? jsonDb.leads[idx].email,
          source: data.source ?? jsonDb.leads[idx].source,
          interest: data.interest ?? jsonDb.leads[idx].interest,
          status: data.status ?? jsonDb.leads[idx].status,
          assignedToId: data.assignedToId ?? jsonDb.leads[idx].assignedToId,
          notes: data.notes ?? jsonDb.leads[idx].notes
        };

        const newStatus = jsonDb.leads[idx].status;
        saveJsonDb();
        logActivity("LEAD_UPDATED", `Lead ${jsonDb.leads[idx].name} status changed from ${oldStatus} to ${newStatus}.`, author?.id, author?.name);

        // Convert lead to customer automatically if status becomes CONVERTED
        if (newStatus === "CONVERTED" && oldStatus !== "CONVERTED") {
          const lD = jsonDb.leads[idx];
          const exists = jsonDb.customers.find(c => c.email === lD.email);
          if (!exists) {
            const newCust: CustomerSeed = {
              id: `cust-${Date.now()}`,
              name: lD.name,
              phone: lD.phone,
              email: lD.email,
              address: "",
              type: "WHOLESALE",
              notes: `Converted from Lead. ${lD.notes}`
            };
            jsonDb.customers.push(newCust);
            saveJsonDb();
            logActivity("LEAD_CONVERTED", `Successfully converted Lead ${lD.name} into fully fledged Customer!`, author?.id, author?.name);
          }
        }
        return jsonDb.leads[idx];
      }
    }
    return null;
  },

  async deleteLead(id: string, author?: any) {
    if (usePrisma && prisma) {
      const lead = await prisma.lead.delete({ where: { id } });
      logActivity("LEAD_DELETED", `Lead ${lead.name} deleted.`, author?.id, author?.name);
      return lead;
    }
    if (jsonDb) {
      const idx = jsonDb.leads.findIndex(l => l.id === id);
      if (idx !== -1) {
        const deleted = jsonDb.leads.splice(idx, 1)[0];
        saveJsonDb();
        logActivity("LEAD_DELETED", `Lead ${deleted.name} deleted.`, author?.id, author?.name);
        return deleted;
      }
    }
    return null;
  },

  // DEALS
  async getDeals() {
    if (usePrisma && prisma) {
      return await prisma.deal.findMany({
        include: { customer: true, assignedTo: true },
        orderBy: { createdAt: "desc" }
      });
    }
    if (jsonDb) {
      return jsonDb.deals.map(d => ({
        ...d,
        customer: jsonDb!.customers.find(c => c.id === d.customerId),
        assignedTo: jsonDb!.users.find(u => u.id === d.assignedToId)
      }));
    }
    return [];
  },

  async createDeal(data: any, author?: any) {
    if (usePrisma && prisma) {
      const deal = await prisma.deal.create({ data });
      logActivity("DEAL_CREATED", `Deal ${deal.title} created. Value: $${deal.value}`, author?.id, author?.name);
      return deal;
    }
    if (jsonDb) {
      const customer = jsonDb.customers.find(c => c.id === data.customerId);
      const newDeal: DealSeed = {
        id: `deal-${Date.now()}`,
        customerId: data.customerId,
        title: data.title,
        value: Number(data.value),
        stage: data.stage || "PROSPECTING",
        expectedCloseDate: data.expectedCloseDate || new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split("T")[0],
        probability: Number(data.probability || 20),
        assignedToId: data.assignedToId || "user-sales"
      };
      jsonDb.deals.push(newDeal);
      saveJsonDb();
      logActivity("DEAL_CREATED", `New Deal: "${newDeal.title}" with value $${newDeal.value} launched for ${customer?.name || 'Customer'}.`, author?.id, author?.name);
      return newDeal;
    }
    throw new Error("DB not initialized");
  },

  async updateDeal(id: string, data: any, author?: any) {
    if (usePrisma && prisma) {
      const deal = await prisma.deal.update({ where: { id }, data });
      logActivity("DEAL_UPDATED", `Deal "${deal.title}" stage changed to ${deal.stage}`, author?.id, author?.name);
      return deal;
    }
    if (jsonDb) {
      const idx = jsonDb.deals.findIndex(d => d.id === id);
      if (idx !== -1) {
        const oldStage = jsonDb.deals[idx].stage;
        jsonDb.deals[idx] = {
          ...jsonDb.deals[idx],
          title: data.title ?? jsonDb.deals[idx].title,
          value: data.value !== undefined ? Number(data.value) : jsonDb.deals[idx].value,
          stage: data.stage ?? jsonDb.deals[idx].stage,
          expectedCloseDate: data.expectedCloseDate ?? jsonDb.deals[idx].expectedCloseDate,
          probability: data.probability !== undefined ? Number(data.probability) : jsonDb.deals[idx].probability,
          assignedToId: data.assignedToId ?? jsonDb.deals[idx].assignedToId
        };
        const newStage = jsonDb.deals[idx].stage;
        saveJsonDb();
        logActivity("DEAL_UPDATED", `Deal "${jsonDb.deals[idx].title}" pipeline advanced from ${oldStage} to ${newStage}.`, author?.id, author?.name);
        return jsonDb.deals[idx];
      }
    }
    return null;
  },

  async deleteDeal(id: string, author?: any) {
    if (usePrisma && prisma) {
      const deal = await prisma.deal.delete({ where: { id } });
      logActivity("DEAL_DELETED", `Deal "${deal.title}" deleted.`, author?.id, author?.name);
      return deal;
    }
    if (jsonDb) {
      const idx = jsonDb.deals.findIndex(d => d.id === id);
      if (idx !== -1) {
        const deleted = jsonDb.deals.splice(idx, 1)[0];
        saveJsonDb();
        logActivity("DEAL_DELETED", `Deal "${deleted.title}" deleted.`, author?.id, author?.name);
        return deleted;
      }
    }
    return null;
  },

  // TASKS
  async getTasks() {
    if (usePrisma && prisma) {
      return await prisma.task.findMany({
        include: { assignedTo: true, lead: true, deal: true },
        orderBy: { dueDate: "asc" }
      });
    }
    if (jsonDb) {
      return jsonDb.tasks.map(t => ({
        ...t,
        assignedTo: jsonDb!.users.find(u => u.id === t.assignedToId),
        lead: jsonDb!.leads.find(l => l.id === t.leadId),
        deal: jsonDb!.deals.find(d => d.id === t.dealId)
      }));
    }
    return [];
  },

  async createTask(data: any, author?: any) {
    if (usePrisma && prisma) {
      const task = await prisma.task.create({ data });
      logActivity("TASK_CREATED", `New Task: "${task.title}" created.`, author?.id, author?.name);
      return task;
    }
    if (jsonDb) {
      const newTask: TaskSeed = {
        id: `task-${Date.now()}`,
        title: data.title,
        description: data.description || "",
        dueDate: data.dueDate || new Date().toISOString().split("T")[0],
        priority: data.priority || "MEDIUM",
        status: data.status || "PENDING",
        assignedToId: data.assignedToId || "user-sales",
        leadId: data.leadId || undefined,
        dealId: data.dealId || undefined
      };
      jsonDb.tasks.push(newTask);
      saveJsonDb();
      logActivity("TASK_CREATED", `Task scheduled: "${newTask.title}" (Priority: ${newTask.priority}).`, author?.id, author?.name);
      return newTask;
    }
    throw new Error("DB not initialized");
  },

  async updateTask(id: string, data: any, author?: any) {
    if (usePrisma && prisma) {
      const task = await prisma.task.update({ where: { id }, data });
      logActivity("TASK_UPDATED", `Task "${task.title}" setting changed to status: ${task.status}`, author?.id, author?.name);
      return task;
    }
    if (jsonDb) {
      const idx = jsonDb.tasks.findIndex(t => t.id === id);
      if (idx !== -1) {
        const oldStatus = jsonDb.tasks[idx].status;
        jsonDb.tasks[idx] = {
          ...jsonDb.tasks[idx],
          title: data.title ?? jsonDb.tasks[idx].title,
          description: data.description ?? jsonDb.tasks[idx].description,
          dueDate: data.dueDate ?? jsonDb.tasks[idx].dueDate,
          priority: data.priority ?? jsonDb.tasks[idx].priority,
          status: data.status ?? jsonDb.tasks[idx].status,
          assignedToId: data.assignedToId ?? jsonDb.tasks[idx].assignedToId,
          leadId: data.leadId !== undefined ? (data.leadId || undefined) : jsonDb.tasks[idx].leadId,
          dealId: data.dealId !== undefined ? (data.dealId || undefined) : jsonDb.tasks[idx].dealId
        };
        const newStatus = jsonDb.tasks[idx].status;
        saveJsonDb();
        logActivity("TASK_UPDATED", `Task updated: "${jsonDb.tasks[idx].title}" status swapped from ${oldStatus} to ${newStatus}.`, author?.id, author?.name);
        return jsonDb.tasks[idx];
      }
    }
    return null;
  },

  async deleteTask(id: string, author?: any) {
    if (usePrisma && prisma) {
      const task = await prisma.task.delete({ where: { id } });
      logActivity("TASK_DELETED", `Task "${task.title}" removed.`, author?.id, author?.name);
      return task;
    }
    if (jsonDb) {
      const idx = jsonDb.tasks.findIndex(t => t.id === id);
      if (idx !== -1) {
        const deleted = jsonDb.tasks.splice(idx, 1)[0];
        saveJsonDb();
        logActivity("TASK_DELETED", `Task "${deleted.title}" deleted from cloud calendars.`, author?.id, author?.name);
        return deleted;
      }
    }
    return null;
  },

  // PURCHASE ORDERS
  async getPurchaseOrders() {
    if (usePrisma && prisma) {
      return await prisma.purchaseOrder.findMany({
        include: { supplier: true, items: { include: { product: true } } },
        orderBy: { createdAt: "desc" }
      });
    }
    if (jsonDb) {
      return jsonDb.purchaseOrders.map(po => ({
        ...po,
        supplier: jsonDb!.suppliers.find(s => s.id === po.supplierId),
        items: po.items.map(i => ({
          ...i,
          product: jsonDb!.products.find(p => p.id === i.productId)
        }))
      }));
    }
    return [];
  },

  async createPurchaseOrder(data: any, author?: any) {
    if (jsonDb) {
      const orderNumber = `PO-${Date.now().toString().slice(-6)}`;
      let totalAmount = 0;
      const items = data.items.map((i: any) => {
        const itemTotal = Number(i.quantity) * Number(i.costPrice);
        totalAmount += itemTotal;
        return {
          productId: i.productId,
          quantity: Number(i.quantity),
          costPrice: Number(i.costPrice)
        };
      });

      const newPO: PurchaseOrderSeed = {
        id: `po-${Date.now()}`,
        orderNumber,
        supplierId: data.supplierId,
        status: "DRAFT",
        totalAmount,
        createdAt: new Date().toISOString(),
        items
      };

      jsonDb.purchaseOrders.push(newPO);
      saveJsonDb();
      logActivity("PO_CREATED", `Draft Purchase Order ${orderNumber} created with total contract value $${totalAmount}`, author?.id, author?.name);
      return newPO;
    }
    throw new Error("DB not initialized");
  },

  async updatePurchaseOrderStatus(id: string, status: any, author?: any) {
    if (jsonDb) {
      const idx = jsonDb.purchaseOrders.findIndex(po => po.id === id);
      if (idx !== -1) {
        const po = jsonDb.purchaseOrders[idx];
        const oldStatus = po.status;
        po.status = status;

        // If received, automatically increase product stock and log inventory movements
        if (status === "RECEIVED" && oldStatus !== "RECEIVED") {
          po.items.forEach(item => {
            const prod = jsonDb!.products.find(p => p.id === item.productId);
            if (prod) {
              prod.stockQuantity += item.quantity;
              jsonDb!.movements.push({
                id: `mov-${Date.now()}-${item.productId}`,
                productId: item.productId,
                quantity: item.quantity,
                type: "IN",
                reason: "PURCHASE",
                notes: `Received from Purchase Order ${po.orderNumber}`,
                createdAt: new Date().toISOString()
              });
            }
          });
          logActivity("PO_RECEIVED", `Purchase Order ${po.orderNumber} marked as RECEIVED. WMS inventory levels re-stocked automatically.`, author?.id, author?.name);
        } else {
          logActivity("PO_UPDATED", `Purchase Order ${po.orderNumber} status changed from ${oldStatus} to ${status}.`, author?.id, author?.name);
        }

        saveJsonDb();
        return po;
      }
    }
    return null;
  },

  async deletePurchaseOrder(id: string, author?: any) {
    if (jsonDb) {
      const idx = jsonDb.purchaseOrders.findIndex(p => p.id === id);
      if (idx !== -1) {
        const po = jsonDb.purchaseOrders.splice(idx, 1)[0];
        saveJsonDb();
        logActivity("PO_DELETED", `Purchase Order ${po.orderNumber} deleted.`, author?.id, author?.name);
        return po;
      }
    }
    return null;
  },

  // SALES ORDERS
  async getSalesOrders() {
    if (usePrisma && prisma) {
      return await prisma.salesOrder.findMany({
        include: { customer: true, items: { include: { product: true } } },
        orderBy: { createdAt: "desc" }
      });
    }
    if (jsonDb) {
      return jsonDb.salesOrders.map(so => ({
        ...so,
        customer: jsonDb!.customers.find(c => c.id === so.customerId),
        items: so.items.map(i => ({
          ...i,
          product: jsonDb!.products.find(p => p.id === i.productId)
        }))
      }));
    }
    return [];
  },

  async createSalesOrder(data: any, author?: any) {
    if (jsonDb) {
      // Client-side validations of stock limits should be double-checked here:
      for (const item of data.items) {
        const product = jsonDb.products.find(p => p.id === item.productId);
        if (!product) throw new Error("Product not found");
        if (product.stockQuantity < item.quantity) {
          throw new Error(`Insufficient stock for product ${product.name}. Current stock: ${product.stockQuantity}, Requested: ${item.quantity}`);
        }
      }

      const orderNumber = `SO-${Date.now().toString().slice(-6)}`;
      let subtotal = 0;
      const items = data.items.map((i: any) => {
        const total = Number(i.quantity) * Number(i.unitPrice);
        subtotal += total;
        return {
          productId: i.productId,
          quantity: Number(i.quantity),
          unitPrice: Number(i.unitPrice),
          discount: 0,
          total
        };
      });

      const discount = Number(data.discount || 0);
      const total = Math.max(0, subtotal - discount);

      const newSO: SalesOrderSeed = {
        id: `so-${Date.now()}`,
        orderNumber,
        customerId: data.customerId,
        status: "PENDING",
        subtotal,
        discount,
        tax: 0,
        total,
        createdAt: new Date().toISOString(),
        items
      };

      jsonDb.salesOrders.push(newSO);
      saveJsonDb();
      logActivity("SO_CREATED", `Sales Order ${orderNumber} placed for $${total}. Status is PENDING.`, author?.id, author?.name);

      // Automatically generate a matching UNPAID invoice
      const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
      const newInv: InvoiceSeed = {
        id: `inv-${Date.now()}`,
        invoiceNumber,
        salesOrderId: newSO.id,
        customerId: newSO.customerId,
        totalAmount: total,
        paidAmount: 0,
        status: "UNPAID",
        dueDate: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString().split("T")[0],
        createdAt: new Date().toISOString()
      };
      jsonDb.invoices.push(newInv);
      saveJsonDb();
      logActivity("INVOICE_GENERATED", `Invoice ${invoiceNumber} created automatically from Sales Order ${orderNumber}.`, author?.id, author?.name);

      return newSO;
    }
    throw new Error("DB not initialized");
  },

  async updateSalesOrderStatus(id: string, status: any, author?: any) {
    if (jsonDb) {
      const idx = jsonDb.salesOrders.findIndex(so => so.id === id);
      if (idx !== -1) {
        const so = jsonDb.salesOrders[idx];
        const oldStatus = so.status;
        so.status = status;

        // If status becomes COMPLETED, update/decrease product inventories automatically
        if (status === "COMPLETED" && oldStatus !== "COMPLETED") {
          so.items.forEach(item => {
            const prod = jsonDb!.products.find(p => p.id === item.productId);
            if (prod) {
              const prev = prod.stockQuantity;
              prod.stockQuantity = Math.max(0, prod.stockQuantity - item.quantity);
              jsonDb!.movements.push({
                id: `mov-${Date.now()}-${item.productId}`,
                productId: item.productId,
                quantity: item.quantity,
                type: "OUT",
                reason: "SALE",
                notes: `Deducted from completed Sales Order ${so.orderNumber}`,
                createdAt: new Date().toISOString()
              });
            }
          });
          logActivity("SO_COMPLETED", `Sales Order ${so.orderNumber} completed. Warehouse stock deducted and movements logged.`, author?.id, author?.name);
        } else {
          logActivity("SO_UPDATED", `Sales Order ${so.orderNumber} updated status to ${status}.`, author?.id, author?.name);
        }

        saveJsonDb();
        return so;
      }
    }
    return null;
  },

  async deleteSalesOrder(id: string, author?: any) {
    if (jsonDb) {
      const idx = jsonDb.salesOrders.findIndex(so => so.id === id);
      if (idx !== -1) {
        const deleted = jsonDb.salesOrders.splice(idx, 1)[0];
        
        // Remove linked invoice
        const invIdx = jsonDb.invoices.findIndex(inv => inv.salesOrderId === id);
        if (invIdx !== -1) {
          jsonDb.invoices.splice(invIdx, 1);
        }

        saveJsonDb();
        logActivity("SO_DELETED", `Sales Order ${deleted.orderNumber} deleted.`, author?.id, author?.name);
        return deleted;
      }
    }
    return null;
  },

  // INVOICES
  async getInvoices() {
    if (usePrisma && prisma) {
      return await prisma.invoice.findMany({
        include: { customer: true, salesOrder: true },
        orderBy: { createdAt: "desc" }
      });
    }
    if (jsonDb) {
      return jsonDb.invoices.map(inv => ({
        ...inv,
        customer: jsonDb!.customers.find(c => c.id === inv.customerId),
        salesOrder: jsonDb!.salesOrders.find(so => so.id === inv.salesOrderId)
      }));
    }
    return [];
  },

  async updateInvoicePayment(id: string, paidAmount: number, author?: any) {
    if (jsonDb) {
      const idx = jsonDb.invoices.findIndex(inv => inv.id === id);
      if (idx !== -1) {
        const inv = jsonDb.invoices[idx];
        inv.paidAmount = Math.min(inv.totalAmount, Number(paidAmount));
        
        if (inv.paidAmount >= inv.totalAmount) {
          inv.status = "PAID";
        } else if (inv.paidAmount > 0) {
          inv.status = "PARTIAL";
        } else {
          inv.status = "UNPAID";
        }

        saveJsonDb();
        logActivity("INVOICE_PAID", `Invoice ${inv.invoiceNumber} payment registered ($${inv.paidAmount}/$${inv.totalAmount}). Status: ${inv.status}.`, author?.id, author?.name);
        return inv;
      }
    }
    return null;
  },

  // DASHBOARD SUMMARY INTEGRATION
  async getDashboardSummary() {
    if (usePrisma && prisma) {
      const totalRevenueAggregate = await prisma.invoice.aggregate({ _sum: { paidAmount: true } });
      const totalCustomers = await prisma.customer.count();
      const activeLeadsCount = await prisma.lead.count({ where: { status: { notIn: ["LOST", "CONVERTED"] } } });
      const openDeals = await prisma.deal.findMany({ where: { stage: { notIn: ["WON", "LOST"] } } });
      const wonDealsCount = await prisma.deal.count({ where: { stage: "WON" } });
      const lostDealsCount = await prisma.deal.count({ where: { stage: "LOST" } });
      const lowStockProducts = await prisma.product.findMany({
        select: { stockQuantity: true, reorderLevel: true }
      });
      const pendingPOCount = await prisma.purchaseOrder.count({ where: { status: { in: ["DRAFT", "ORDERED"] } } });
      const recentOrders = await prisma.salesOrder.findMany({
        include: { customer: true, items: { include: { product: true } } },
        orderBy: { createdAt: "desc" },
        take: 5
      });
      const recentLogs = await prisma.activityLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 7
      });
      const categories = await prisma.category.findMany({
        include: { products: { select: { stockQuantity: true } } },
        orderBy: { name: "asc" }
      });

      const totalRevenue = totalRevenueAggregate._sum.paidAmount || 0;
      const openDealsValue = openDeals.reduce((sum, deal) => sum + deal.value, 0);
      const lowStockCount = lowStockProducts.filter(product => product.stockQuantity <= product.reorderLevel).length;

      return {
        totalRevenue,
        monthlySales: totalRevenue,
        totalCustomers,
        activeLeadsCount,
        openDealsCount: openDeals.length,
        openDealsValue,
        lowStockCount,
        pendingPOCount,
        recentOrders,
        recentLogs,
        charts: {
          salesTrend: [
            { month: "Yan", sales: 0, revenue: 0 },
            { month: "Fev", sales: 0, revenue: 0 },
            { month: "Mar", sales: 0, revenue: 0 },
            { month: "Apr", sales: 0, revenue: 0 },
            { month: "May", sales: 0, revenue: 0 },
            { month: "Iyn", sales: totalRevenue, revenue: totalRevenue }
          ],
          categoryBreakdown: categories
            .map(category => ({
              name: category.name,
              value: category.products.reduce((sum, product) => sum + product.stockQuantity, 0)
            }))
            .filter(category => category.value > 0),
          dealFunnel: [
            { name: "Izlanish", count: openDeals.filter(deal => deal.stage === "PROSPECTING").length },
            { name: "Muzokara", count: openDeals.filter(deal => deal.stage === "NEGOTIATION").length },
            { name: "Yutildi", count: wonDealsCount },
            { name: "Yo'qotildi", count: lostDealsCount }
          ]
        }
      };
    }

    if (jsonDb) {
      const activeLeads = jsonDb.leads.filter(l => l.status !== "LOST" && l.status !== "CONVERTED").length;
      const openDeals = jsonDb.deals.filter(d => d.stage !== "WON" && d.stage !== "LOST");
      const openDealsValue = openDeals.reduce((sum, d) => sum + d.value, 0);
      const lowStockProducts = jsonDb.products.filter(p => p.stockQuantity <= p.reorderLevel).length;
      const pendingPOs = jsonDb.purchaseOrders.filter(po => po.status === "DRAFT" || po.status === "ORDERED").length;

      // Rev calculation from PAID or PARTIAL invoices
      const totalRevenue = jsonDb.invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);

      const recentSO = jsonDb.salesOrders.map(so => ({
        ...so,
        customer: jsonDb!.customers.find(c => c.id === so.customerId)
      })).slice(0, 5);

      const recentActivities = jsonDb.logs.slice(0, 7);

      return {
        totalRevenue,
        monthlySales: 16800.00, // Balanced mock metric
        totalCustomers: jsonDb.customers.length,
        activeLeadsCount: activeLeads,
        openDealsCount: openDeals.length,
        openDealsValue,
        lowStockCount: lowStockProducts,
        pendingPOCount: pendingPOs,
        recentOrders: recentSO,
        recentLogs: recentActivities,
        charts: {
          salesTrend: [
            { month: "Jan", sales: 12000, revenue: 9500 },
            { month: "Feb", sales: 14500, revenue: 11000 },
            { month: "Mar", sales: 13200, revenue: 12200 },
            { month: "Apr", sales: 18500, revenue: 15400 },
            { month: "May", sales: 21000, revenue: 17800 },
            { month: "Jun", sales: 24500, revenue: totalRevenue }
          ],
          categoryBreakdown: jsonDb.categories.map(c => {
            const sumQty = jsonDb!.products
              .filter(p => p.categoryId === c.id)
              .reduce((sum, p) => sum + p.stockQuantity, 0);
            return {
              name: c.name,
              value: sumQty
            };
          }).filter(c => c.value > 0),
          dealFunnel: [
            { name: "Prospecting", count: jsonDb.deals.filter(d => d.stage === "PROSPECTING").length },
            { name: "Negotiation", count: jsonDb.deals.filter(d => d.stage === "NEGOTIATION").length },
            { name: "Won", count: jsonDb.deals.filter(d => d.stage === "WON").length },
            { name: "Lost", count: jsonDb.deals.filter(d => d.stage === "LOST").length }
          ]
        }
      };
    }
    return null;
  }
};
