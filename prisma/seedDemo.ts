import {
  CustomerType,
  DealStage,
  InvoiceStatus,
  LeadStatus,
  POStatus,
  PrismaClient,
  Role,
  SOStatus,
  TaskPriority,
  TaskStatus,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seedUsers() {
  const users = [
    ["user-admin", "admin@luxx.uz", "Akbar Nazarov", "Admin12345", Role.ADMIN],
    ["user-manager", "manager@luxx.uz", "Shakhnoza Karimova", "Manager12345", Role.MANAGER],
    ["user-sales", "sales@luxx.uz", "Timur Alimov", "Sales12345", Role.SALES],
    ["user-warehouse", "warehouse@luxx.uz", "Jasur Nematov", "Warehouse12345", Role.WAREHOUSE],
    ["user-viewer", "viewer@luxx.uz", "Dilnoza Rustamova", "Viewer12345", Role.VIEWER],
  ] as const;

  for (const [id, email, name, password, role] of users) {
    await prisma.user.upsert({
      where: { email },
      update: { name, role, passwordHash: await bcrypt.hash(password, 10) },
      create: { id, email, name, role, passwordHash: await bcrypt.hash(password, 10) },
    });
  }
}

async function main() {
  await seedUsers();

  const outerwear = await prisma.category.upsert({
    where: { name: "Ustki kiyimlar" },
    update: {},
    create: { id: "cat-outerwear", name: "Ustki kiyimlar" },
  });
  const dresses = await prisma.category.upsert({
    where: { name: "Ko'ylaklar" },
    update: {},
    create: { id: "cat-dresses", name: "Ko'ylaklar" },
  });
  const accessories = await prisma.category.upsert({
    where: { name: "Aksessuarlar" },
    update: {},
    create: { id: "cat-accessories", name: "Aksessuarlar" },
  });

  const supplierA = await prisma.supplier.upsert({
    where: { id: "sup-silk-road" },
    update: {
      companyName: "Silk Road Textile",
      contactPerson: "Madina Ergasheva",
      phone: "+998 90 123 45 67",
      email: "sales@silkroad.uz",
      address: "Toshkent, Yakkasaroy tumani",
      notes: "Premium matolar va mavsumiy kolleksiyalar yetkazib beradi.",
    },
    create: {
      id: "sup-silk-road",
      companyName: "Silk Road Textile",
      contactPerson: "Madina Ergasheva",
      phone: "+998 90 123 45 67",
      email: "sales@silkroad.uz",
      address: "Toshkent, Yakkasaroy tumani",
      notes: "Premium matolar va mavsumiy kolleksiyalar yetkazib beradi.",
    },
  });

  const supplierB = await prisma.supplier.upsert({
    where: { id: "sup-bukhara" },
    update: {
      companyName: "Bukhara Fashion Group",
      contactPerson: "Aziz Rahmonov",
      phone: "+998 91 777 22 11",
      email: "info@bfg.uz",
      address: "Buxoro, G'ijduvon yo'li",
      notes: "Aksessuar va klassik liboslar bo'yicha hamkor.",
    },
    create: {
      id: "sup-bukhara",
      companyName: "Bukhara Fashion Group",
      contactPerson: "Aziz Rahmonov",
      phone: "+998 91 777 22 11",
      email: "info@bfg.uz",
      address: "Buxoro, G'ijduvon yo'li",
      notes: "Aksessuar va klassik liboslar bo'yicha hamkor.",
    },
  });

  const products = [
    {
      id: "prod-coat-black",
      name: "Qora kashmir palto",
      SKU: "LUX-COAT-001",
      categoryId: outerwear.id,
      supplierId: supplierA.id,
      size: "M/L",
      color: "Qora",
      costPrice: 85,
      salePrice: 145,
      stockQuantity: 18,
      reorderLevel: 6,
    },
    {
      id: "prod-dress-gold",
      name: "Zarli kechki ko'ylak",
      SKU: "LUX-DRS-014",
      categoryId: dresses.id,
      supplierId: supplierA.id,
      size: "S/M/L",
      color: "Oltin",
      costPrice: 62,
      salePrice: 118,
      stockQuantity: 9,
      reorderLevel: 4,
    },
    {
      id: "prod-scarf-silk",
      name: "Ipak sharf",
      SKU: "LUX-ACC-022",
      categoryId: accessories.id,
      supplierId: supplierB.id,
      size: "Universal",
      color: "Zumrad",
      costPrice: 14,
      salePrice: 29,
      stockQuantity: 42,
      reorderLevel: 12,
    },
    {
      id: "prod-jacket-cream",
      name: "Krem rang jaket",
      SKU: "LUX-JKT-008",
      categoryId: outerwear.id,
      supplierId: supplierB.id,
      size: "M",
      color: "Krem",
      costPrice: 48,
      salePrice: 92,
      stockQuantity: 3,
      reorderLevel: 5,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { SKU: product.SKU },
      update: product,
      create: product,
    });
  }

  const customers = [
    {
      id: "cust-samarqand",
      name: "Samarqand Boutique",
      phone: "+998 93 410 20 20",
      email: "buy@samarqandboutique.uz",
      address: "Samarqand, Registon ko'chasi",
      type: CustomerType.WHOLESALE,
      notes: "Oyiga ikki marta ulgurji xarid qiladi.",
    },
    {
      id: "cust-fergana",
      name: "Fergana Style Market",
      phone: "+998 94 555 18 18",
      email: "orders@ferganastyle.uz",
      address: "Farg'ona, Markaziy bozor",
      type: CustomerType.PARTNER,
      notes: "Hududiy hamkor, tez yetkazib berish so'raydi.",
    },
  ];

  for (const customer of customers) {
    await prisma.customer.upsert({
      where: { id: customer.id },
      update: customer,
      create: customer,
    });
  }

  await prisma.lead.upsert({
    where: { id: "lead-namangan" },
    update: {
      name: "Namangan Premium Shop",
      phone: "+998 95 001 11 22",
      email: "hello@namanganpremium.uz",
      source: "Instagram",
      interest: "Ulgurji palto va jaketlar",
      status: LeadStatus.QUALIFIED,
      assignedToId: "user-sales",
      notes: "Narxlar ro'yxati yuborilgan, kelasi hafta qo'ng'iroq kerak.",
    },
    create: {
      id: "lead-namangan",
      name: "Namangan Premium Shop",
      phone: "+998 95 001 11 22",
      email: "hello@namanganpremium.uz",
      source: "Instagram",
      interest: "Ulgurji palto va jaketlar",
      status: LeadStatus.QUALIFIED,
      assignedToId: "user-sales",
      notes: "Narxlar ro'yxati yuborilgan, kelasi hafta qo'ng'iroq kerak.",
    },
  });

  await prisma.deal.upsert({
    where: { id: "deal-samarqand-q1" },
    update: {
      customerId: "cust-samarqand",
      title: "Bahorgi kolleksiya ulgurji shartnomasi",
      value: 4850,
      stage: DealStage.NEGOTIATION,
      probability: 70,
      assignedToId: "user-manager",
      expectedCloseDate: new Date("2026-07-15"),
    },
    create: {
      id: "deal-samarqand-q1",
      customerId: "cust-samarqand",
      title: "Bahorgi kolleksiya ulgurji shartnomasi",
      value: 4850,
      stage: DealStage.NEGOTIATION,
      probability: 70,
      assignedToId: "user-manager",
      expectedCloseDate: new Date("2026-07-15"),
    },
  });

  await prisma.task.upsert({
    where: { id: "task-followup" },
    update: {
      title: "Samarqand Boutique bilan narxni kelishish",
      description: "Chegirma va yetkazib berish muddatini tasdiqlash.",
      dueDate: new Date("2026-06-18"),
      priority: TaskPriority.HIGH,
      status: TaskStatus.IN_PROGRESS,
      assignedToId: "user-manager",
      dealId: "deal-samarqand-q1",
    },
    create: {
      id: "task-followup",
      title: "Samarqand Boutique bilan narxni kelishish",
      description: "Chegirma va yetkazib berish muddatini tasdiqlash.",
      dueDate: new Date("2026-06-18"),
      priority: TaskPriority.HIGH,
      status: TaskStatus.IN_PROGRESS,
      assignedToId: "user-manager",
      dealId: "deal-samarqand-q1",
    },
  });

  await prisma.purchaseOrder.upsert({
    where: { orderNumber: "PO-2026-001" },
    update: {
      supplierId: supplierA.id,
      status: POStatus.RECEIVED,
      totalAmount: 1860,
      items: {
        deleteMany: {},
        create: [
          { productId: "prod-coat-black", quantity: 12, costPrice: 85 },
          { productId: "prod-dress-gold", quantity: 10, costPrice: 62 },
        ],
      },
    },
    create: {
      id: "po-demo-001",
      orderNumber: "PO-2026-001",
      supplierId: supplierA.id,
      status: POStatus.RECEIVED,
      totalAmount: 1860,
      items: {
        create: [
          { productId: "prod-coat-black", quantity: 12, costPrice: 85 },
          { productId: "prod-dress-gold", quantity: 10, costPrice: 62 },
        ],
      },
    },
  });

  await prisma.purchaseOrder.upsert({
    where: { orderNumber: "PO-2026-002" },
    update: {
      supplierId: supplierB.id,
      status: POStatus.ORDERED,
      totalAmount: 980,
      items: {
        deleteMany: {},
        create: [
          { productId: "prod-scarf-silk", quantity: 40, costPrice: 14 },
          { productId: "prod-jacket-cream", quantity: 8, costPrice: 48 },
        ],
      },
    },
    create: {
      id: "po-demo-002",
      orderNumber: "PO-2026-002",
      supplierId: supplierB.id,
      status: POStatus.ORDERED,
      totalAmount: 980,
      items: {
        create: [
          { productId: "prod-scarf-silk", quantity: 40, costPrice: 14 },
          { productId: "prod-jacket-cream", quantity: 8, costPrice: 48 },
        ],
      },
    },
  });

  await prisma.salesOrder.upsert({
    where: { orderNumber: "SO-2026-001" },
    update: {
      customerId: "cust-samarqand",
      status: SOStatus.COMPLETED,
      subtotal: 2146,
      discount: 120,
      tax: 0,
      total: 2026,
      items: {
        deleteMany: {},
        create: [
          { productId: "prod-coat-black", quantity: 8, unitPrice: 145, total: 1160 },
          { productId: "prod-dress-gold", quantity: 6, unitPrice: 118, total: 708 },
          { productId: "prod-scarf-silk", quantity: 12, unitPrice: 23.17, total: 278 },
        ],
      },
    },
    create: {
      id: "so-demo-001",
      orderNumber: "SO-2026-001",
      customerId: "cust-samarqand",
      status: SOStatus.COMPLETED,
      subtotal: 2146,
      discount: 120,
      tax: 0,
      total: 2026,
      items: {
        create: [
          { productId: "prod-coat-black", quantity: 8, unitPrice: 145, total: 1160 },
          { productId: "prod-dress-gold", quantity: 6, unitPrice: 118, total: 708 },
          { productId: "prod-scarf-silk", quantity: 12, unitPrice: 23.17, total: 278 },
        ],
      },
    },
  });

  await prisma.salesOrder.upsert({
    where: { orderNumber: "SO-2026-002" },
    update: {
      customerId: "cust-fergana",
      status: SOStatus.CONFIRMED,
      subtotal: 736,
      discount: 36,
      tax: 0,
      total: 700,
      items: {
        deleteMany: {},
        create: [
          { productId: "prod-jacket-cream", quantity: 4, unitPrice: 92, total: 368 },
          { productId: "prod-scarf-silk", quantity: 16, unitPrice: 23, total: 368 },
        ],
      },
    },
    create: {
      id: "so-demo-002",
      orderNumber: "SO-2026-002",
      customerId: "cust-fergana",
      status: SOStatus.CONFIRMED,
      subtotal: 736,
      discount: 36,
      tax: 0,
      total: 700,
      items: {
        create: [
          { productId: "prod-jacket-cream", quantity: 4, unitPrice: 92, total: 368 },
          { productId: "prod-scarf-silk", quantity: 16, unitPrice: 23, total: 368 },
        ],
      },
    },
  });

  await prisma.invoice.upsert({
    where: { invoiceNumber: "INV-2026-001" },
    update: {
      salesOrderId: "so-demo-001",
      customerId: "cust-samarqand",
      totalAmount: 2026,
      paidAmount: 2026,
      status: InvoiceStatus.PAID,
      dueDate: new Date("2026-06-20"),
    },
    create: {
      id: "inv-demo-001",
      invoiceNumber: "INV-2026-001",
      salesOrderId: "so-demo-001",
      customerId: "cust-samarqand",
      totalAmount: 2026,
      paidAmount: 2026,
      status: InvoiceStatus.PAID,
      dueDate: new Date("2026-06-20"),
    },
  });

  await prisma.invoice.upsert({
    where: { invoiceNumber: "INV-2026-002" },
    update: {
      salesOrderId: "so-demo-002",
      customerId: "cust-fergana",
      totalAmount: 700,
      paidAmount: 250,
      status: InvoiceStatus.PARTIAL,
      dueDate: new Date("2026-06-28"),
    },
    create: {
      id: "inv-demo-002",
      invoiceNumber: "INV-2026-002",
      salesOrderId: "so-demo-002",
      customerId: "cust-fergana",
      totalAmount: 700,
      paidAmount: 250,
      status: InvoiceStatus.PARTIAL,
      dueDate: new Date("2026-06-28"),
    },
  });

  const movements = [
    ["mov-demo-001", "prod-coat-black", 12, "IN", "PURCHASE", "PO-2026-001 qabul qilindi"],
    ["mov-demo-002", "prod-dress-gold", 10, "IN", "PURCHASE", "PO-2026-001 qabul qilindi"],
    ["mov-demo-003", "prod-coat-black", 8, "OUT", "SALE", "SO-2026-001 jo'natildi"],
    ["mov-demo-004", "prod-scarf-silk", 12, "OUT", "SALE", "SO-2026-001 jo'natildi"],
  ] as const;

  for (const [id, productId, quantity, type, reason, notes] of movements) {
    await prisma.inventoryMovement.upsert({
      where: { id },
      update: { productId, quantity, type, reason, notes },
      create: { id, productId, quantity, type, reason, notes },
    });
  }

  const logs = [
    ["log-demo-001", "SO_CREATED", "SO-2026-001 savdo buyurtmasi yaratildi.", "Akbar Nazarov"],
    ["log-demo-002", "PO_RECEIVED", "PO-2026-001 omborga qabul qilindi.", "Jasur Nematov"],
    ["log-demo-003", "INVOICE_PAID", "INV-2026-001 to'liq to'landi.", "Timur Alimov"],
    ["log-demo-004", "LEAD_CREATED", "Namangan Premium Shop yangi lead sifatida qo'shildi.", "Shakhnoza Karimova"],
  ] as const;

  for (const [id, type, description, userName] of logs) {
    await prisma.activityLog.upsert({
      where: { id },
      update: { type, description, userId: "user-admin", userName },
      create: { id, type, description, userId: "user-admin", userName },
    });
  }

  console.log("Demo data seeded successfully.");
}

main()
  .catch((error) => {
    console.error("Failed to seed demo data:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
