import { useState, useEffect, type FormEvent } from "react";
import { api } from "../api";
import { PurchaseOrder, SalesOrder, Invoice, Product, Customer, Supplier } from "../types";
import { 
  FileText, 
  ShoppingBag, 
  Receipt, 
  Plus, 
  Trash2, 
  Check, 
  PackageCheck, 
  User, 
  AlertTriangle, 
  Tag, 
  Lock, 
  DollarSign, 
  Sparkles, 
  X 
} from "lucide-react";

type OrderTabs = "PO" | "SO" | "INVOICES";

export function OrdersPage() {
  const [activeTab, setActiveTab] = useState<OrderTabs>("PO");
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Lists
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Forms states
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // Create PO Form fields
  const [poSupplierId, setPoSupplierId] = useState("");
  const [poLines, setPoLines] = useState<{ productId: string; quantity: number; costPrice: number }[]>([]);

  // Create SO Form fields
  const [soCustomerId, setSoCustomerId] = useState("");
  const [soLines, setSoLines] = useState<{ productId: string; quantity: number; unitPrice: number }[]>([]);
  const [soDiscount, setSoDiscount] = useState("0");

  // Add line fields (local UI helpers)
  const [localProdId, setLocalProdId] = useState("");
  const [localQty, setLocalQty] = useState("10");
  const [localPrice, setLocalPrice] = useState("");

  // Payment popup
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");

  useEffect(() => {
    setCurrentUser(api.auth.getCurrentUser());
    loadAllOrdersData();
  }, [activeTab]);

  async function loadAllOrdersData() {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === "PO") {
        const [poData, sData, pData] = await Promise.all([
          api.purchaseOrders.getAll(),
          api.suppliers.getAll(),
          api.products.getAll()
        ]);
        setPurchaseOrders(poData);
        setSuppliers(sData);
        setProducts(pData);
        if (sData.length > 0) setPoSupplierId(sData[0].id);
        if (pData.length > 0) {
          setLocalProdId(pData[0].id);
          setLocalPrice(String(pData[0].costPrice));
        }
      } else if (activeTab === "SO") {
        const [soData, cData, pData] = await Promise.all([
          api.salesOrders.getAll(),
          api.customers.getAll(),
          api.products.getAll()
        ]);
        setSalesOrders(soData);
        setCustomers(cData);
        setProducts(pData);
        if (cData.length > 0) setSoCustomerId(cData[0].id);
        if (pData.length > 0) {
          setLocalProdId(pData[0].id);
          setLocalPrice(String(pData[0].salePrice));
        }
      } else if (activeTab === "INVOICES") {
        const iData = await api.invoices.getAll();
        setInvoices(iData);
      }
    } catch (err: any) {
      setError(err.message || "Buyurtmalar jurnalini sinxronlab bo'lmadi.");
    } finally {
      setLoading(false);
    }
  }

  // Permission logic based on Roles:
  // - Sales role can edit sales orders / invoices
  // - Warehouse role can edit purchase orders / suppliers
  // - Manager and Admin can edit both!
  const hasSalesWrite = currentUser && ["ADMIN", "MANAGER", "SALES"].includes(currentUser.role);
  const hasWarehouseWrite = currentUser && ["ADMIN", "MANAGER", "WAREHOUSE"].includes(currentUser.role);

  const resetForms = () => {
    setIsFormOpen(false);
    setPoLines([]);
    setSoLines([]);
    setSoDiscount("0");
    setPaymentAmount("");
    setSelectedInvoiceId(null);
  };

  const triggerSuccess = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 4000);
  };

  // Local helper when product selects changes in lines Form
  const handleProductSelectChange = (id: string, isPOType: boolean) => {
    setLocalProdId(id);
    const prod = products.find(p => p.id === id);
    if (prod) {
      setLocalPrice(String(isPOType ? prod.costPrice : prod.salePrice));
    }
  };

  // Add line local item triggers
  const addPoLineLocal = () => {
    if (!localProdId || Number(localQty) <= 0 || Number(localPrice) <= 0) return;
    const exists = poLines.find(l => l.productId === localProdId);
    if (exists) {
      exists.quantity += Number(localQty);
    } else {
      setPoLines([...poLines, {
        productId: localProdId,
        quantity: Number(localQty),
        costPrice: Number(localPrice)
      }]);
    }
  };

  const addSoLineLocal = () => {
    if (!localProdId || Number(localQty) <= 0 || Number(localPrice) <= 0) return;

    // SLA inventory rules logic check
    const prod = products.find(p => p.id === localProdId);
    if (prod && prod.stockMiqdor < Number(localQty)) {
      setError(`SLA ogohlantirishi: ${prod.name} uchun ombor qoldig'i yetarli emas. Mavjud: ${prod.stockMiqdor} dona, so'ralgan: ${localQty} dona.`);
      return;
    }
    setError(null);

    const exists = soLines.find(l => l.productId === localProdId);
    if (exists) {
      exists.quantity += Number(localQty);
    } else {
      setSoLines([...soLines, {
        productId: localProdId,
        quantity: Number(localQty),
        unitPrice: Number(localPrice)
      }]);
    }
  };

  // Remove local helper
  const removePoLine = (index: number) => {
    const list = [...poLines];
    list.splice(index, 1);
    setPoLines(list);
  };

  const removeSoLine = (index: number) => {
    const list = [...soLines];
    list.splice(index, 1);
    setSoLines(list);
  };

  // SUBMITS API
  const handlePoSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!hasWarehouseWrite) return;
    if (poLines.length === 0) {
      setError("Xarid buyurtmasiga kamida bitta mahsulot qo'shing.");
      return;
    }

    try {
      await api.purchaseOrders.create({ supplierId: poSupplierId, items: poLines });
      triggerSuccess("Xarid buyurtmasi qoralama sifatida yaratildi.");
      resetForms();
      loadAllOrdersData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSoSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!hasSalesWrite) return;
    if (soLines.length === 0) {
      setError("Mijoz buyurtmasiga kamida bitta mahsulot qo'shing.");
      return;
    }

    try {
      await api.salesOrders.create({ 
        customerId: soCustomerId, 
        items: soLines,
        discount: Number(soDiscount)
      });
      triggerSuccess("Savdo buyurtmasi yaratildi. Hisob-fakturalarni tekshiring.");
      resetForms();
      loadAllOrdersData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Holat updates
  const handlePOStatusUpdate = async (id: string, nextStatus: string) => {
    if (!hasWarehouseWrite) return;
    try {
      await api.purchaseOrders.updateStatus(id, nextStatus);
      triggerSuccess("Xarid buyurtmasi holati yangilandi. Miqdorlar sinxronlandi.");
      loadAllOrdersData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSOStatusUpdate = async (id: string, nextStatus: string) => {
    if (!hasSalesWrite) return;
    try {
      await api.salesOrders.updateStatus(id, nextStatus);
      triggerSuccess("Savdo buyurtmasi holati yangilandi. Yakunlanganda ombor yangilanadi.");
      loadAllOrdersData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Payments registration
  const handleInvoicePaymentSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!hasSalesWrite || !selectedInvoiceId || !paymentAmount) return;
    try {
      await api.invoices.pay(selectedInvoiceId, Number(paymentAmount));
      triggerSuccess("Mijoz to'lovi qayd etildi.");
      resetForms();
      loadAllOrdersData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // O'chirish orders
  const handleDeletePO = async (id: string) => {
    if (!hasWarehouseWrite) return;
    if (!confirm("Bu xarid buyurtmasi qoralamasini o'chirishni tasdiqlaysizmi?")) return;
    try {
      await api.purchaseOrders.delete(id);
      loadAllOrdersData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteSO = async (id: string) => {
    if (!hasSalesWrite) return;
    if (!confirm("Bu savdo buyurtmasini o'chirishni tasdiqlaysizmi? Bog'langan hisob-faktura ham o'chiriladi.")) return;
    try {
      await api.salesOrders.delete(id);
      loadAllOrdersData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#C5A059]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-semibold tracking-tight text-[#1E1B18]">
            Buyurtmalar va hisob-fakturalar
          </h1>
          <p className="text-sm text-[#7A7570]">
            Xarid buyurtmalari, savdo yetkazmalari va hisob-fakturalarni boshqaring.
          </p>
        </div>

        {/* Action button changes dynamically by active tab */}
        {activeTab === "PO" && hasWarehouseWrite && (
          <button
            onClick={() => { resetForms(); setIsFormOpen(true); }}
            className="flex items-center space-x-2 bg-[#1E1B18] text-white hover:bg-[#2F2925] text-sm font-semibold px-4 py-2 rounded-lg transition-all shadow-sm shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Xarid buyurtmasi yaratish</span>
          </button>
        )}

        {activeTab === "SO" && hasSalesWrite && (
          <button
            onClick={() => { resetForms(); setIsFormOpen(true); }}
            className="flex items-center space-x-2 bg-[#1E1B18] text-white hover:bg-[#2F2925] text-sm font-semibold px-4 py-2 rounded-lg transition-all shadow-sm shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Savdo buyurtmasi yaratish</span>
          </button>
        )}
      </div>

      {/* Tab Selectors */}
      <div className="flex border-b border-[#E6E1DA] space-x-2 bg-white px-4 py-2.5 rounded-xl border">
        <button
          onClick={() => { setError(null); setActiveTab("PO"); }}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "PO" ? "bg-[#1E1B18] text-white" : "text-[#7A7570] hover:bg-[#FAF9F5]"
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Xarid buyurtmalari</span>
        </button>
        <button
          onClick={() => { setError(null); setActiveTab("SO"); }}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "SO" ? "bg-[#1E1B18] text-white" : "text-[#7A7570] hover:bg-[#FAF9F5]"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Savdo buyurtmalari</span>
        </button>
        <button
          onClick={() => { setError(null); setActiveTab("INVOICES"); }}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "INVOICES" ? "bg-[#1E1B18] text-white" : "text-[#7A7570] hover:bg-[#FAF9F5]"
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Hisob-fakturalar</span>
        </button>
      </div>

      {success && (
        <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-md flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <p className="text-xs font-medium text-emerald-800">{success}</p>
        </div>
      )}

      {error && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-md">
          <p className="text-xs text-amber-800 leading-normal font-semibold font-sans">{error}</p>
        </div>
      )}

      {/* Write guards warnings */}
      {activeTab === "PO" && !hasWarehouseWrite && (
        <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg flex items-center gap-2 text-xs text-amber-800">
          <Lock className="w-4 h-4 text-amber-600" />
          <span>Faqat o'qish: joriy rolingiz <strong>({currentUser?.role})</strong> xarid buyurtmasi yaratish yoki qabul qilishga ruxsat bermaydi.</span>
        </div>
      )}

      {activeTab === "SO" && !hasSalesWrite && (
        <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg flex items-center gap-2 text-xs text-amber-800">
          <Lock className="w-4 h-4 text-amber-600" />
          <span>Faqat o'qish: joriy rolingiz <strong>({currentUser?.role})</strong> savdo buyurtmasi yaratishga ruxsat bermaydi.</span>
        </div>
      )}

      {/* ----------------------------------------------------------------------
          A. CREATE FORMS MODAL DRAWER
          ---------------------------------------------------------------------- */}
      {isFormOpen && (
        <div className="bg-white p-6 rounded-xl border border-[#EACCA4] shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-[#FAF9F5]">
            <h3 className="text-md font-bold font-display text-[#1E1B18]">
              {activeTab === "PO" ? "Yangi xarid buyurtmasi" : "Yangi savdo buyurtmasi"}
            </h3>
            <button onClick={resetForms} className="p-1 text-gray-400 hover:text-black">
              <X className="w-4 h-4" />
            </button>
          </div>

          <form className="space-y-4" onSubmit={activeTab === "PO" ? handlePoSubmit : handleSoSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Linked entity dropdown */}
              {activeTab === "PO" ? (
                <div>
                  <label className="block text-xs font-semibold text-[#4A4642] mb-1 uppercase">Yetkazuvchini tanlang</label>
                  <select
                    value={poSupplierId}
                    onChange={(e) => setPoSupplierId(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-xs"
                  >
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.companyName}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-[#4A4642] mb-1 uppercase">Mijozni tanlang</label>
                  <select
                    value={soCustomerId}
                    onChange={(e) => setSoCustomerId(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-xs"
                  >
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {activeTab === "SO" && (
                <div>
                  <label className="block text-xs font-semibold text-[#4A4642] mb-1 uppercase">Chegirma ($)</label>
                  <input
                    type="number"
                    value={soDiscount}
                    onChange={(e) => setSoDiscount(e.target.value)}
                    placeholder="E.g., 100"
                    className="w-full px-3 py-2 border rounded-lg text-xs"
                  />
                </div>
              )}
            </div>

            {/* Line items editor grid */}
            <div className="border border-[#FAF9F5] p-4 rounded-xl bg-[#FCFAF8] space-y-3">
              <h4 className="text-xs font-bold text-[#1E1B18] uppercase tracking-wider">Mahsulot qatorlarini sozlash</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] text-[#7A7570] font-semibold mb-1">Mahsulot SKU</label>
                  <select
                    value={localProdId}
                    onChange={(e) => handleProductSelectChange(e.target.value, activeTab === "PO")}
                    className="w-full px-2 py-1.5 border rounded"
                  >
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.SKU}) [Ombor: {p.stockMiqdor} dona]</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-[#7A7570] font-semibold mb-1">Miqdor</label>
                  <input
                    type="number"
                    min="1"
                    value={localQty}
                    onChange={(e) => setLocalQty(e.target.value)}
                    className="w-full px-2 py-1.5 border rounded"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={activeTab === "PO" ? addPoLineLocal : addSoLineLocal}
                    className="w-full bg-[#1E1B18] text-white hover:bg-[#2F2925] text-xs font-bold py-2 rounded-lg"
                  >
                    + Qator qo'shish
                  </button>
                </div>
              </div>

              {/* Added Lines Listing Table */}
              <div className="bg-white border text-xs rounded-lg overflow-hidden mt-3">
                <table className="w-full">
                  <tr className="bg-[#FAF9F5] text-gray-500 font-semibold border-b">
                    <th className="p-2 text-left">Mahsulot nomi</th>
                    <th className="p-2 text-center">Miqdor</th>
                    <th className="p-2 text-right">Birlik narxi</th>
                    <th className="p-2 text-right">Jami</th>
                    <th className="p-2 text-center w-12">O'chirish</th>
                  </tr>
                  {(activeTab === "PO" ? poLines : soLines).length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-gray-400 italic font-light">Hali mahsulot qatori qo'shilmagan.</td>
                    </tr>
                  ) : (
                    (activeTab === "PO" ? poLines : soLines).map((line, idx) => {
                      const pObj = products.find(p => p.id === line.productId);
                      const rate = activeTab === "PO" ? line.costPrice : (line as any).unitPrice;
                      const lineSum = line.quantity * rate;
                      return (
                        <tr key={idx} className="border-b">
                          <td className="p-2 font-bold">{pObj?.name} <span className="font-mono text-[9px] text-[#7A7570] block">{pObj?.SKU}</span></td>
                          <td className="p-2 text-center font-semibold">{line.quantity} dona</td>
                          <td className="p-2 text-right">${rate.toFixed(2)}</td>
                          <td className="p-2 text-right font-bold">${lineSum.toFixed(2)}</td>
                          <td className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => activeTab === "PO" ? removePoLine(idx) : removeSoLine(idx)}
                              className="text-red-500 hover:text-red-700"
                            >
                              ×
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </table>
              </div>

              {/* Order total estimation summary */}
              {activeTab === "PO" && poLines.length > 0 && (
                <div className="text-right text-xs pt-1.5 font-sans font-semibold text-[#1E1B18]">
                  Jami qiymat: <strong className="text-sm font-bold text-[#C5A059]">${
                    poLines.reduce((acc, curr) => acc + (curr.quantity * curr.costPrice), 0).toFixed(2)
                  }</strong>
                </div>
              )}
              {activeTab === "SO" && soLines.length > 0 && (
                <div className="text-right text-xs pt-1.5 font-sans font-semibold text-[#1E1B18]">
                  Jami qiymat: <strong className="text-sm font-bold text-[#C5A059]">${
                    soLines.reduce((acc, curr) => acc + (curr.quantity * curr.unitPrice), 0).toFixed(2)
                  }</strong>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#FAF9F5]">
              <button
                type="button"
                onClick={resetForms}
                className="px-4 py-2 border rounded-lg text-xs text-[#7A7570] hover:bg-gray-100"
              >
                Qoralamani bekor qilish
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#1E1B18] hover:bg-[#2F2925] text-white text-xs font-semibold rounded-lg"
              >
                Buyurtmani yakunlash
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ----------------------------------------------------------------------
          B. BILLING POPUP PAYMENT REGISTRY FOR INVOICES
          ---------------------------------------------------------------------- */}
      {selectedInvoiceId && (
        <div className="bg-white p-6 rounded-xl border border-[#C5A059] shadow-md max-w-sm mx-auto space-y-3">
          <h3 className="font-display font-bold text-sm text-[#1E1B18] uppercase">Mijoz to'lovini qayd etish</h3>
          <p className="text-[#7A7570] text-xs">Bank kvitansiyasini tekshirib, to'langan summani kiriting.</p>
          <form onSubmit={handleInvoicePaymentSubmit}>
            <input
              type="number"
              step="0.01"
              required
              placeholder="To'langan summa ($)"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-xs"
            />
            <div className="flex justify-end gap-2 mt-3">
              <button type="button" onClick={resetForms} className="px-3 py-1.5 text-xs text-gray-500 hover:underline">Bekor qilish</button>
              <button type="submit" className="px-3 py-1.5 bg-[#C5A059] text-white rounded text-xs">To'lovni tasdiqlash</button>
            </div>
          </form>
        </div>
      )}

      {/* ----------------------------------------------------------------------
          C. MAIN LEDGER DISPLAY TABLES
          ---------------------------------------------------------------------- */}
      <div className="bg-white rounded-xl border border-[#FAF9F5] shadow-sm overflow-hidden">
        
        {/* Active Tab is PO: Purchase Orders Table */}
        {activeTab === "PO" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAF9F5] text-[#7A7570] border-b border-[#E6E1DA]">
                  <th className="p-4 uppercase font-semibold">Shartnoma raqami</th>
                  <th className="p-4 uppercase font-semibold">Yetkazuvchi</th>
                  <th className="p-4 uppercase font-semibold">Sana</th>
                  <th className="p-4 uppercase font-semibold text-center">Mahsulotlar</th>
                  <th className="p-4 uppercase font-semibold text-right">Jami qiymat</th>
                  <th className="p-4 uppercase font-semibold text-center">Jarayon holati</th>
                  <th className="p-4 uppercase font-semibold text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#FAF9F5]">
                {purchaseOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-[#7A7570] font-light">
                      Bazada xarid buyurtmalari yo'q.
                    </td>
                  </tr>
                ) : (
                  purchaseOrders.map(po => (
                    <tr key={po.id} className="hover:bg-[#FCFAFB] transition-colors">
                      <td className="p-4">
                        <span className="font-bold text-[#1E1B18] font-mono block">{po.orderNumber}</span>
                        <span className="text-[10px] text-gray-500">ID: {po.id.slice(-6)}</span>
                      </td>
                      <td className="p-4 font-semibold text-[#C5A059]">{po.supplier?.companyName}</td>
                      <td className="p-4 text-[#7A7570]">{new Date(po.createdAt).toLocaleDateString()}</td>
                      <td className="p-4 text-center">
                        <span className="bg-gray-100 text-gray-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {po.items.length} qator ({po.items.reduce((acc, current) => acc + current.quantity, 0)} dona)
                        </span>
                      </td>
                      <td className="p-4 text-right font-bold text-[#1E1B18]">${po.totalAmount.toFixed(2)}</td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold inline-block ${
                          po.status === "RECEIVED" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" :
                          po.status === "ORDERED" ? "bg-blue-50 text-blue-800" : "bg-gray-100 text-gray-800"
                        }`}>{po.status}</span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          {po.status === "DRAFT" && (
                            <button
                              onClick={() => handlePOStatusUpdate(po.id, "ORDERED")}
                              disabled={!hasWarehouseWrite}
                              className="px-2 py-1 bg-blue-600 text-white rounded text-[10px] font-bold uppercase transition"
                            >
                              Buyurtma
                            </button>
                          )}
                          {po.status === "ORDERED" && (
                            <button
                              onClick={() => handlePOStatusUpdate(po.id, "RECEIVED")}
                              disabled={!hasWarehouseWrite}
                              className="px-2 py-1 bg-emerald-600 text-white rounded text-[10px] font-bold uppercase transition flex items-center space-x-0.5"
                            >
                              <PackageCheck className="w-3.5 h-3.5" />
                              <span>Qabul qilish</span>
                            </button>
                          )}
                          <button
                            onClick={() => handleDeletePO(po.id)}
                            disabled={!hasWarehouseWrite}
                            className="p-1.5 hover:text-red-500 hover:bg-red-50 border rounded text-gray-400 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Active Tab is SO: Savdo buyurtmasis Table */}
        {activeTab === "SO" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAF9F5] text-[#7A7570] border-b border-[#E6E1DA]">
                  <th className="p-4 uppercase font-semibold">Buyurtma raqami</th>
                  <th className="p-4 uppercase font-semibold">Mijoz</th>
                  <th className="p-4 uppercase font-semibold">Sana</th>
                  <th className="p-4 uppercase font-semibold text-center">Mahsulotlar</th>
                  <th className="p-4 uppercase font-semibold text-right">Chegirma</th>
                  <th className="p-4 uppercase font-semibold text-right">Jami hisob</th>
                  <th className="p-4 uppercase font-semibold text-center">Buyurtma holati</th>
                  <th className="p-4 uppercase font-semibold text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#FAF9F5]">
                {salesOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-[#7A7570] font-light">
                      Savdo buyurtmalari hali yo'q.
                    </td>
                  </tr>
                ) : (
                  salesOrders.map(so => (
                    <tr key={so.id} className="hover:bg-[#FCFAFB] transition-colors">
                      <td className="p-4">
                        <span className="font-bold text-[#1E1B18] font-mono block">{so.orderNumber}</span>
                        <span className="text-[10px] text-gray-500">ID: {so.id.slice(-6)}</span>
                      </td>
                      <td className="p-4 font-semibold text-[#1E1B18]">{so.customer?.name}</td>
                      <td className="p-4 text-[#7A7570]">{new Date(so.createdAt).toLocaleDateString()}</td>
                      <td className="p-4 text-center">
                        <span className="bg-gray-100 text-gray-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {so.items.length} qator ({so.items.reduce((acc, curr) => acc + curr.quantity, 0)} dona)
                        </span>
                      </td>
                      <td className="p-4 text-right text-red-600 font-medium">-${so.discount.toFixed(2)}</td>
                      <td className="p-4 text-right font-bold text-[#1E1B18]">${so.total.toFixed(2)}</td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold inline-block ${
                          so.status === "COMPLETED" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" :
                          so.status === "CONFIRMED" ? "bg-blue-50 text-blue-800 border" : "bg-yellow-50 text-yellow-800"
                        }`}>{so.status}</span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          {so.status === "PENDING" && (
                            <button
                              onClick={() => handleSOStatusUpdate(so.id, "CONFIRMED")}
                              disabled={!hasSalesWrite}
                              className="px-2 py-1 bg-blue-500 hover:bg-blue-700 text-white rounded text-[10px] font-bold uppercase transition"
                            >
                              Tasdiqlash
                            </button>
                          )}
                          {so.status === "CONFIRMED" && (
                            <button
                              onClick={() => handleSOStatusUpdate(so.id, "COMPLETED")}
                              disabled={!hasSalesWrite}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold uppercase transition flex items-center space-x-0.5"
                            >
                              <Check className="w-3.5 h-3.5 text-white" />
                              <span>Yakunlash</span>
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteSO(so.id)}
                            disabled={!hasSalesWrite}
                            className="p-1.5 hover:text-red-500 hover:bg-red-50 border rounded text-gray-400 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Active Tab is INVOICES: Invoices Ledger Table */}
        {activeTab === "INVOICES" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAF9F5] text-[#7A7570] border-b border-[#E6E1DA]">
                  <th className="p-4 uppercase font-semibold">Hisob-fakturalar</th>
                  <th className="p-4 uppercase font-semibold">Mijoz</th>
                  <th className="p-4 uppercase font-semibold">Hisob turi</th>
                  <th className="p-4 uppercase font-semibold text-right">Hisob summasi</th>
                  <th className="p-4 uppercase font-semibold text-right text-emerald-600">Jami to'langan</th>
                  <th className="p-4 uppercase font-semibold text-center">To'lov holati</th>
                  <th className="p-4 uppercase font-semibold">To'lov muddati</th>
                  <th className="p-4 uppercase font-semibold text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#FAF9F5]">
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-[#7A7570] font-light">
                      Hisob-faktura yo'q. Savdo buyurtmasi avtomatik hisob yaratadi.
                    </td>
                  </tr>
                ) : (
                  invoices.map(inv => {
                    const isKechikkan = new Date(inv.dueDate) < new Date() && inv.status !== "PAID";
                    return (
                      <tr key={inv.id} className="hover:bg-[#FCFAFB] transition-colors">
                        <td className="p-4">
                          <span className="font-bold text-[#1E1B18] font-mono block">{inv.invoiceNumber}</span>
                          <span className="text-[9px] text-gray-500 block">Buyurtma: {inv.salesOrder?.orderNumber}</span>
                        </td>
                        <td className="p-4 font-semibold text-[#1E1B18]">{inv.customer?.name}</td>
                        <td className="p-4 text-[#7A7570]">Naqd hisob</td>
                        <td className="p-4 text-right font-bold text-[#1E1B18]">${inv.totalAmount.toFixed(2)}</td>
                        <td className="p-4 text-right font-bold text-emerald-600">${inv.paidAmount.toFixed(2)}</td>
                        <td className="p-4 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold inline-block ${
                            inv.status === "PAID" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" :
                            inv.status === "PARTIAL" ? "bg-amber-50 text-amber-800 border border-amber-200" : "bg-red-50 text-red-800 border border-red-200"
                          }`}>{inv.status}</span>
                        </td>
                        <td className="p-4">
                          <span className={`font-mono text-[10px] ${isKechikkan ? "text-red-500 font-bold" : "text-[#7A7570]"}`}>{new Date(inv.dueDate).toLocaleDateString()}</span>
                          {isKechikkan && (
                            <span className="block text-[8px] text-red-500 uppercase font-black">Kechikkan!</span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          {inv.status !== "PAID" ? (
                            <button
                              onClick={() => { setSelectedInvoiceId(inv.id); setPaymentAmount(String(inv.totalAmount - inv.paidAmount)); }}
                              disabled={!hasSalesWrite}
                              className="px-2.5 py-1 bg-[#C5A059] text-white hover:bg-[#A9843F] font-bold text-[10px] rounded uppercase flex items-center justify-center ml-auto"
                            >
                              <DollarSign className="w-3.5 h-3.5 text-white" />
                              <span>To'lov olish</span>
                            </button>
                          ) : (
                            <span className="text-emerald-600 font-bold text-[10px] uppercase">To'langan ✓</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
