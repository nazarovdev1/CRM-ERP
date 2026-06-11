import { useState, useEffect, type FormEvent } from "react";
import { api } from "../api";
import { Product, InventoryMovement } from "../types";
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  RotateCcw, 
  Warehouse, 
  Sliders, 
  ShieldAlert, 
  Clock, 
  Lock 
} from "lucide-react";

export function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [productId, setProductId] = useState("");
  const [qty, setQty] = useState("");
  const [type, setType] = useState<"IN" | "OUT">("IN");
  const [reason, setReason] = useState<"PURCHASE" | "SALE" | "RETURN" | "ADJUSTMENT">("ADJUSTMENT");
  const [notes, setNotes] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    setCurrentUser(api.auth.getCurrentUser());
    loadBarchasiInventory();
  }, []);

  async function loadBarchasiInventory() {
    setLoading(true);
    setError(null);
    try {
      const [pData, mData] = await Promise.all([
        api.products.getAll(),
        api.inventory.getMovements()
      ]);
      setProducts(pData);
      setMovements(mData);
      if (pData.length > 0) {
        setProductId(pData[0].id);
      }
    } catch (err: any) {
      setError(err.message || "Ombor ma'lumotlarini yuklab bo'lmadi.");
    } finally {
      setLoading(false);
    }
  }

  const isEditor = currentUser && ["ADMIN", "MANAGER", "WAREHOUSE"].includes(currentUser.role);

  const handleAdjustmentSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isEditor) return;
    if (!productId || !qty || Number(qty) <= 0) {
      setError("To'g'ri miqdor kiriting.");
      return;
    }

    setSubmitLoading(true);
    setError(null);

    try {
      // Trigger update API. Since product stock update automatically manages movements
      // in our db layer, we can update the product stock directly!
      const product = products.find(p => p.id === productId);
      if (!product) throw new Error("Selected product not found.");

      const oldStock = product.stockQuantity;
      const adjustmentValue = Number(qty);
      const newStock = type === "IN" ? oldStock + adjustmentValue : Math.max(0, oldStock - adjustmentValue);

      await api.products.update(productId, {
        stockQuantity: newStock
      });

      // Clear form
      setQty("");
      setNotes("");
      
      // Reload lists
      await loadBarchasiInventory();
    } catch (err: any) {
      setError(err.message || "Adjustment failed.");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#C5A059]" />
      </div>
    );
  }

  const lowStockAlerts = products.filter(p => p.stockQuantity <= p.reorderLevel);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-semibold tracking-tight text-[#1E1B18]">
            Ombor harakatlari jurnali
          </h1>
          <p className="text-sm text-[#7A7570]">
            luxx.uz uchun kategoriyalar bo'yicha ombor o'zgarishlarini kuzating.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md">
          <p className="text-sm font-semibold text-red-800">ERP sinxronlash xatosi</p>
          <p className="text-xs text-red-700 mt-1">{error}</p>
        </div>
      )}

      {/* Grid Layout splits Adjustment Form and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Adjustment controls panel */}
        <div className="lg:col-span-4 bg-white p-6 rounded-xl border border-[#FAF9F5] shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#1E1B18] flex items-center gap-2 mb-2">
              <Sliders className="w-5 h-5 text-[#C5A059]" />
              Tezkor qoldiq sozlash
            </h2>
            <p className="text-xs text-[#7A7570] mb-4">
              Qoldiqni to'g'ridan-to'g'ri sozlang. Barcha yozuvlar audit jurnaliga tushadi.
            </p>

            {!isEditor ? (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800 leading-normal">
                  Your account role <strong>({currentUser?.role})</strong> does not have WMS write access. Contact the administrator to request inventory adjustment clearance.
                </p>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={handleAdjustmentSubmit}>
                <div>
                  <label className="block text-xs font-semibold text-[#4A4642] uppercase mb-1">Mahsulot SKU</label>
                  <select
                    value={productId}
                    onChange={(e) => setProductId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#E6E1DA] rounded-lg text-xs focus:ring-[#C5A059] focus:outline-none focus:ring-1"
                  >
                    {products.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.SKU}) [Joriy: {p.stockQuantity} pcs]
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-[#4A4642] uppercase mb-1">O'zgarish turi</label>
                    <div className="grid grid-cols-2 border border-[#E6E1DA] rounded-lg overflow-hidden bg-[#FAF9F5]">
                      <button
                        type="button"
                        onClick={() => setType("IN")}
                        className={`py-1.5 text-xs font-semibold transition-all ${
                          type === "IN" ? "bg-emerald-600 text-white" : "text-[#7A7570] hover:bg-white"
                        }`}
                      >
                        Kirim (+)
                      </button>
                      <button
                        type="button"
                        onClick={() => setType("OUT")}
                        className={`py-1.5 text-xs font-semibold transition-all ${
                          type === "OUT" ? "bg-red-600 text-white" : "text-[#7A7570] hover:bg-white"
                        }`}
                      >
                        Chiqim (-)
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#4A4642] uppercase mb-1">Sabab</label>
                    <select
                      value={reason}
                      onChange={(e) => setReason(e.target.value as any)}
                      className="w-full px-3 py-2 bg-white border border-[#E6E1DA] rounded-lg text-xs focus:ring-[#C5A059]"
                    >
                      <option value="ADJUSTMENT">Qo'lda tuzatish</option>
                      <option value="PURCHASE">Yetkazuvchidan xarid</option>
                      <option value="SALE">Savdo buyurtmasi</option>
                      <option value="RETURN">Mijoz qaytargan</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4A4642] uppercase mb-1">Miqdor (dona)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                    placeholder="E.g., 20"
                    className="w-full px-3 py-2 bg-white border border-[#E6E1DA] rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4A4642] uppercase mb-1">Ichki izoh</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Explain the purpose of this manual change..."
                    className="w-full px-3 py-2 bg-white border border-[#E6E1DA] rounded-lg text-xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitLoading}
                  className="w-full bg-[#1E1B18] text-white hover:bg-[#2F2925] text-xs font-semibold py-2 rounded-lg transition-all disabled:opacity-50 mt-2"
                >
                  {submitLoading ? "Yozuv saqlanmoqda..." : "Qoldiq o'zgarishini saqlash"}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Low Stock Alerts and Stats Card */}
        <div className="lg:col-span-8 bg-white p-6 rounded-xl border border-[#FAF9F5] shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#1E1B18] mb-1 flex items-center gap-2">
              <Warehouse className="w-5 h-5 text-[#C5A059]" />
              Minimal qoldiq nazorati
            </h2>
            <p className="text-xs text-[#7A7570] mb-4">
              Real-time alerts tracking clothing SKUs whose current warehousing quantities fall short of reorder limits.
            </p>

            {lowStockAlerts.length === 0 ? (
              <div className="bg-emerald-50 text-emerald-800 p-4 rounded-lg flex items-center gap-2">
                <p className="text-xs font-medium">
                  ✓ Ombor holati yaxshi: barcha mahsulotlarda yetarli qoldiq bor.
                </p>
              </div>
            ) : (
              <div className="max-h-[190px] overflow-y-auto space-y-2.5">
                {lowStockAlerts.map(p => (
                  <div key={p.id} className="flex justify-between items-center bg-[#FCFAF7] border border-[#EACCA4] p-3 rounded-lg text-xs">
                    <div className="flex items-center gap-2.5">
                      <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                      <div>
                        <span className="font-semibold text-[#1E1B18]">{p.name} ({p.SKU})</span>
                        <p className="text-[10px] text-[#7A7570]">{p.category?.name || 'Omborda mavjud'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-red-600 block">{p.stockQuantity} pcs in stock</span>
                      <span className="text-[9px] text-[#7A7570] block">Reorder trigger target: {p.reorderLevel} pcs</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-[#FAF9F5] flex justify-between items-center text-xs text-[#7A7570]">
            <span>Total Categories Tracked: <strong>{products.reduce((acc, current) => {
              if (current.category && !acc.includes(current.category.name)) acc.push(current.category.name);
              return acc;
            }, [] as string[]).length}</strong></span>
            <span>Total Operational SKU Codes: <strong>{products.length}</strong></span>
          </div>
        </div>
      </div>

      {/* Movements Table */}
      <div className="bg-white rounded-xl border border-[#FAF9F5] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#FAF9F5] flex justify-between items-center bg-[#FCFAF8]">
          <h3 className="font-semibold text-sm text-[#1E1B18] flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[#C5A059]" />
            Ombor harakatlari tarixi (WMS)
          </h3>
          <span className="text-[10px] text-[#7A7570] font-mono">Jami harakatlar: {movements.length}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FAF9F5] text-[#7A7570] border-b border-[#E6E1DA]">
                <th className="p-4 uppercase font-semibold">Sana / vaqt</th>
                <th className="p-4 uppercase font-semibold">Mahsulot SKU</th>
                <th className="p-4 uppercase font-semibold">O'zgarish</th>
                <th className="p-4 uppercase font-semibold">Sabab</th>
                <th className="p-4 uppercase font-semibold">Operator izohi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#FAF9F5]">
              {movements.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[#7A7570] font-light">
                    Ombor harakati yozuvlari yo'q.
                  </td>
                </tr>
              ) : (
                movements.map((m) => {
                  const isIn = m.type === "IN";
                  return (
                    <tr key={m.id} className="hover:bg-[#FCFAFB] transition-colors">
                      <td className="p-4 text-[#7A7570] font-mono">
                        {new Date(m.createdAt).toLocaleString()}
                      </td>
                      <td className="p-4 font-semibold text-[#1E1B18]">
                        {m.product?.name || "O'chirilgan SKU"}
                        <span className="block font-mono text-[9px] text-[#7A7570] uppercase">
                          {m.product?.SKU || "N/A"}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full font-bold ${
                          isIn ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                        }`}>
                          {isIn ? <ArrowUpRight className="w-3 h-3 text-emerald-600 shrink-0" /> : <ArrowDownLeft className="w-3 h-3 text-red-600 shrink-0" />}
                          <span>{isIn ? "+" : "-"}{m.quantity} pcs</span>
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="bg-gray-100 text-gray-800 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded">
                          {m.reason}
                        </span>
                      </td>
                      <td className="p-4 text-[#7A7570] font-light italic truncate max-w-[200px]">
                        {m.notes || "— Izoh kiritilmagan —"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
