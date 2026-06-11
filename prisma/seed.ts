import { PrismaClient, Role, POStatus, SOStatus, InvoiceStatus, CustomerType, LeadStatus, DealStage, TaskPriority, TaskStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seeding process...");

  // 1. Clean existing records (optional, but good for idempotent seeding)
  await prisma.activityLog.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.salesOrderItem.deleteMany({});
  await prisma.salesOrder.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.deal.deleteMany({});
  await prisma.lead.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.inventoryMovement.deleteMany({});
  await prisma.purchaseOrderItem.deleteMany({});
  await prisma.purchaseOrder.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.supplier.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("Database cleaned.");

  // 2. Hash passwords
  const adminHash = await bcrypt.hash("Admin12345", 10);
  const managerHash = await bcrypt.hash("Manager12345", 10);
  const salesHash = await bcrypt.hash("Sales12345", 10);
  const warehouseHash = await bcrypt.hash("Warehouse12345", 10);
  const viewerHash = await bcrypt.hash("Viewer12345", 10);

  // 3. Create Users
  const admin = await prisma.user.create({
    data: {
      id: "user-admin",
      email: "admin@luxx.uz",
      name: "Aleksey Smirnov (Admin)",
      passwordHash: adminHash,
      role: Role.ADMIN,
    },
  });

  const manager = await prisma.user.create({
    data: {
      id: "user-manager",
      email: "manager@luxx.uz",
      name: "Shakhnoza Karimova (Manager)",
      passwordHash: managerHash,
      role: Role.MANAGER,
    },
  });

  const sales = await prisma.user.create({
    data: {
      id: "user-sales",
      email: "sales@luxx.uz",
      name: "Timur Alimov (Sales)",
      passwordHash: salesHash,
      role: Role.SALES,
    },
  });

  const warehouse = await prisma.user.create({
    data: {
      id: "user-warehouse",
      email: "warehouse@luxx.uz",
      name: "Jasur Nematov (Warehouse)",
      passwordHash: warehouseHash,
      role: Role.WAREHOUSE,
    },
  });

  const viewer = await prisma.user.create({
    data: {
      id: "user-viewer",
      email: "viewer@luxx.uz",
      name: "Dilnoza Rustamova (Viewer)",
      passwordHash: viewerHash,
      role: Role.VIEWER,
    },
  });

  console.log("Users created.");

  // 4. Create Categories
  const catJkt = await prisma.category.create({ data: { id: "cat-jkt", name: "Jackets & Coats" } });
  const catDrs = await prisma.category.create({ data: { id: "cat-drs", name: "Dresses" } });
  const catAct = await prisma.category.create({ data: { id: "cat-act", name: "Activewear" } });
  const catKnt = await prisma.category.create({ data: { id: "cat-knt", name: "Knitwear" } });
  const catDnm = await prisma.category.create({ data: { id: "cat-dnm", name: "Denim" } });

  console.log("Categories created.");

  // 5. Create Suppliers
  const supSinotex = await prisma.supplier.create({
    data: {
      id: "sup-sinotex",
      companyName: "SinoTex Garment Co.",
      contactPerson: "Li Wei",
      phone: "+86 21 5555 1234",
      email: "contact@sinotex.com",
      address: "Block 4, Pudong Apparel Zone, Shanghai, China",
      notes: "Primary supplier for high-end silk dresses and premium activewear.",
    },
  });

  const supBaku = await prisma.supplier.create({
    data: {
      id: "sup-bakucotton",
      companyName: "Baku Cotton Mills",
      contactPerson: "Anar Aliyev",
      phone: "+994 12 444 5566",
      email: "info@bakucotton.az",
      address: "88 Neftchiler Ave, Baku, Azerbaijan",
      notes: "High-quality raw cotton inputs and denim manufacturers.",
    },
  });

  const supIstanbul = await prisma.supplier.create({
    data: {
      id: "sup-istanbul",
      companyName: "Istanbul Apparel Wholesale",
      contactPerson: "Mehmet Demir",
      phone: "+90 212 333 4455",
      email: "sales@istanbulapparel.tr",
      address: "Merter Textile District, Istanbul, Turkey",
      notes: "Excellent source for woolen knitwear and winter outerwear.",
    },
  });

  console.log("Suppliers created.");

  // 6. Create Products
  const prodLeather = await prisma.product.create({
    data: {
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
      status: "ACTIVE",
    },
  });

  const prodSilk = await prisma.product.create({
    data: {
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
      status: "ACTIVE",
    },
  });

  const prodLeggings = await prisma.product.create({
    data: {
      id: "prod-leggings",
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
      status: "ACTIVE",
    },
  });

  const prodCashmere = await prisma.product.create({
    data: {
      id: "prod-cashmere-swtr",
      name: "Cashmere V-Neck Sweater",
      SKU: "LXX-KNT-04",
      categoryId: "cat-knt",
      size: "XL",
      color: "Beige",
      costPrice: 55.0,
      salePrice: 110.0,
      stockQuantity: 8,
      reorderLevel: 15,
      supplierId: "sup-istanbul",
      status: "ACTIVE",
    },
  });

  const prodDenim = await prisma.product.create({
    data: {
      id: "prod-denim-jeans",
      name: "Premium Denim Slim-Fit Jeans",
      SKU: "LXX-DNM-05",
      categoryId: "cat-dnm",
      size: "32/34",
      color: "Indigo Blue",
      costPrice: 20.0,
      salePrice: 45.0,
      stockQuantity: 2,
      reorderLevel: 10,
      supplierId: "sup-bakucotton",
      status: "ACTIVE",
    },
  });

  console.log("Products created.");

  // 7. Inventory Movements
  await prisma.inventoryMovement.create({
    data: {
      id: "mov-001",
      productId: "prod-leather-jkt",
      quantity: 50,
      type: "IN",
      reason: "PURCHASE",
      notes: "Initial inventory setup from Istanbul Apparel.",
      createdAt: new Date("2026-05-10T10:00:00Z"),
    },
  });
  await prisma.inventoryMovement.create({
    data: {
      id: "mov-002",
      productId: "prod-silk-drs",
      quantity: 120,
      type: "IN",
      reason: "PURCHASE",
      notes: "Initial inventory setup from SinoTex.",
      createdAt: new Date("2026-05-10T10:05:00Z"),
    },
  });

  console.log("Inventory movements created.");

  // 8. Create Customers
  const custTashkent = await prisma.customer.create({
    data: {
      id: "cust-tashkent",
      name: "Tashkent Fashion Retail Ltd",
      phone: "+998 71 234 5678",
      email: "dilshod@tashfashioned.uz",
      address: "45 Navoi Blvd, Chorsu, Tashkent, Uzbekistan",
      type: CustomerType.WHOLESALE,
      notes: "Major wholesale partner running 5 stores across Uzbekistan.",
    },
  });

  const custSamarkand = await prisma.customer.create({
    data: {
      id: "cust-samarkand",
      name: "Samarkand Boutique Owner",
      phone: "+998 66 111 2222",
      email: "madina@samarkandboutique.com",
      address: "12 Registon St, Samarkand, Uzbekistan",
      type: CustomerType.RETAIL,
      notes: "High-end boutique buyer, regularly purchases dresses and sweaters.",
    },
  });

  const custPartners = await prisma.customer.create({
    data: {
      id: "cust-partners",
      name: "Central Asia Apparel Partners",
      phone: "+7 727 333 4455",
      email: "timur@caap.kz",
      address: "50 Abay Ave, Almaty, Kazakhstan",
      type: CustomerType.PARTNER,
      notes: "Logistics and shipping alliance partner distributing to Central Asian countries.",
    },
  });

  console.log("Customers created.");

  // 9. Create Leads
  const leadBukhara = await prisma.lead.create({
    data: {
      id: "lead-bukhara",
      name: "Kamila Rakhimova (Bukhara Retail)",
      phone: "+998 90 345 6789",
      email: "kamila@bukhara.uz",
      source: "Website",
      interest: "Summer Silk Floral Dress",
      status: LeadStatus.QUALIFIED,
      assignedToId: "user-sales",
      notes: "Requested a quote for 200 items in red/floral sizes S and M.",
    },
  });

  const leadUrgench = await prisma.lead.create({
    data: {
      id: "lead-urgench",
      name: "Nodir Bekmurodov (Urgench Men's Shop)",
      phone: "+998 93 111 3344",
      email: "nodir@urgench.uz",
      source: "Cold Call",
      interest: "Leather Biker Jackets",
      status: LeadStatus.CONTACTED,
      assignedToId: "user-sales",
      notes: "Intrigued by Turkish leather biker jackets, requested sample sizing.",
    },
  });

  console.log("Leads created.");

  // 10. Create Deals
  const dealOuterwear = await prisma.deal.create({
    data: {
      id: "deal-outerwear",
      customerId: "cust-tashkent",
      title: "Autumn Outerwear Contract",
      value: 5000.0,
      stage: DealStage.NEGOTIATION,
      expectedCloseDate: new Date("2026-07-15"),
      probability: 60,
      assignedToId: "user-sales",
    },
  });

  console.log("Deals created.");

  // 11. Create Tasks
  await prisma.task.create({
    data: {
      id: "task-nodir",
      title: "Call Nodir to follow up on winter jacket sizing",
      description: "Urgench buyer was busy last week. Need to confirm sizing measurements from Istanbul suppliers.",
      dueDate: new Date("2026-06-12"),
      priority: TaskPriority.HIGH,
      status: TaskStatus.PENDING,
      assignedToId: "user-sales",
      leadId: "lead-urgench",
    },
  });

  console.log("Tasks created.");

  // 12. Create Purchase Orders
  const po1 = await prisma.purchaseOrder.create({
    data: {
      id: "po-001",
      orderNumber: "PO-2026-001",
      supplierId: "sup-istanbul",
      status: POStatus.RECEIVED,
      totalAmount: 4500.0,
      createdAt: new Date("2026-05-08T09:00:00Z"),
    },
  });

  await prisma.purchaseOrderItem.create({
    data: {
      id: "po-item-1",
      purchaseOrderId: "po-001",
      productId: "prod-leather-jkt",
      quantity: 50,
      costPrice: 45.0,
    },
  });

  console.log("Purchase orders created.");

  // 13. Create Sales Orders
  const so1 = await prisma.salesOrder.create({
    data: {
      id: "so-001",
      orderNumber: "SO-2026-001",
      customerId: "cust-tashkent",
      status: SOStatus.COMPLETED,
      subtotal: 3599.6,
      discount: 100.0,
      tax: 0.0,
      total: 3499.6,
      createdAt: new Date("2026-05-20T11:00:00Z"),
    },
  });

  await prisma.salesOrderItem.create({
    data: {
      id: "so-item-1",
      salesOrderId: "so-001",
      productId: "prod-leather-jkt",
      quantity: 20,
      unitPrice: 89.99,
      total: 1799.8,
    },
  });

  console.log("Sales orders created.");

  // 14. Create Invoices
  await prisma.invoice.create({
    data: {
      id: "inv-001",
      invoiceNumber: "INV-2026-001",
      salesOrderId: "so-001",
      customerId: "cust-tashkent",
      totalAmount: 3499.6,
      paidAmount: 3499.6,
      status: InvoiceStatus.PAID,
      dueDate: new Date("2026-06-20"),
      createdAt: new Date("2026-05-20T11:15:00Z"),
    },
  });

  console.log("Invoices created.");

  // 15. Create Activity Logs
  await prisma.activityLog.create({
    data: {
      id: "act-1",
      type: "LEAD_CREATED",
      description: "New Lead Elena Kim (Almaty Fashion Mall) was registered in the system.",
      userId: "user-sales",
      userName: "Timur Alimov",
      createdAt: new Date("2026-06-11T09:00:00Z"),
    },
  });

  console.log("Activity logs created.");
  console.log("Seeding process completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error in seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
