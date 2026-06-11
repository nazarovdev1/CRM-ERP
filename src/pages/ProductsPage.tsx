import { useState, useEffect, type FormEvent } from "react";
import { api } from "../api";
import { Product, Category, Supplier } from "../types";
import { 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  AlertTriangle, 
  Tag, 
  Boxes, 
  DollarSign, 
  Lock 
} from "lucide-react";

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Search & Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [stockStatus, setStockStatus] = useState("ALL"); // ALL, LOW, OK

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [isEditing, setIsEditing] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [SKU, setSKU] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [stockQuantity, setStockQuantity] = useState("0");
  const [reorderLevel, setReorderLevel] = useState("10");
  const [supplierId, setSupplierId] = useState("");
  const [status, setStatus] = useState("ACTIVE");

  // New category creation helper
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  useEffect(() => {
    setCurrentUser(api.auth.getCurrentUser());
    loadAllData();
  }, []);

  async function loadAllData() {
    setLoading(true);
    setError(null);
    try {
      const [pData, cData, sData] = await Promise.all([
        api.products.getAll(),
        api.categories.getAll(),
        api.suppliers.getAll()
      ]);
      setProducts(pData);
      setCategories(cData);
      setSuppliers(sData);
    } catch (err: any) {
      setError(err.message || "ERP mahsulotlarini yuklab bo'lmadi.");
    } finally {
      setLoading(false);
    }
  }

  const isEditor = currentUser && ["ADMIN", "MANAGER", "WAREHOUSE"].includes(currentUser.role);

  const resetForm = () => {
    setSelectedProductId(null);
    setName("");
    setSKU("");
    setCategoryId(categories[0]?.id || "");
    setSize("");
    setColor("");
    setCostPrice("");
    setSalePrice("");
    setStockQuantity("0");
    setReorderLevel("10");
    setSupplierId(suppliers[0]?.id || "");
    setStatus("ACTIVE");
    setIsEditing(false);
  };

  const handleEditClick = (p: Product) => {
    setSelectedProductId(p.id);
    setName(p.name);
    setSKU(p.SKU);
    setCategoryId(p.categoryId);
    setSize(p.size);
    setColor(p.color);
    setCostPrice(String(p.costPrice));
    setSalePrice(String(p.salePrice));
    setStockQuantity(String(p.stockQuantity));
    setReorderLevel(String(p.reorderLevel));
    setSupplierId(p.supplierId || "");
    setStatus(p.status);
    setIsEditing(true);
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!isEditor) return;

    setError(null);
    const payload = {
      name,
      SKU,
      categoryId,
      size,
      color,
      costPrice: Number(costPrice),
      salePrice: Number(salePrice),
      stockQuantity: Number(stockQuantity),
      reorderLevel: Number(reorderLevel),
      supplierId: supplierId || null,
      status
    };

    try {
      if (selectedProductId) {
        await api.products.update(selectedProductId, payload);
      } else {
        await api.products.create(payload);
      }
      resetForm();
      loadAllData();
    } catch (err: any) {
      setError(err.message || "Could not save catalog changes.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!isEditor) return;
    if (!confirm("Bu mahsulotni katalogdan o'chirishni tasdiqlaysizmi? Ombor yozuvlari saqlanadi.")) return;

    setError(null);
    try {
      await api.products.delete(id);
      loadAllData();
    } catch (err: any) {
      setError(err.message || "Mahsulotni o'chirib bo'lmadi.");
    }
  };

  // Add new product category dynamically
  const handleAddCategory = async (e: FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      const added = await api.categories.create(newCategoryName.trim());
      setCategories([...categories, added]);
      setCategoryId(added.id);
      setIsAddingCategory(false);
      setNewCategoryName("");
    } catch (err: any) {
      setError(err.message || "Kategoriya qo'shib bo'lmadi.");
    }
  };

  // Search filter matching
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.SKU.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory ? p.categoryId === selectedCategory : true;
    
    let matchesStock = true;
    if (stockStatus === "LOW") {
      matchesStock = p.stockQuantity <= p.reorderLevel;
    } else if (stockStatus === "OK") {
      matchesStock = p.stockQuantity > p.reorderLevel;
    }

    return matchesSearch && matchesCat && matchesStock;
  });

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
            Kiyim-kechak mahsulotlari katalogi
          </h1>
          <p className="text-sm text-[#7A7570]">
            Ulgurji savdoga tayyor kiyim-kechak mahsulotlari katalogi.
          </p>
        </div>

        {isEditor && (
          <button
            onClick={() => {
              resetForm();
              setIsEditing(true);
            }}
            className="flex items-center space-x-2 bg-[#1E1B18] text-white hover:bg-[#2F2925] text-sm font-semibold px-4 py-2 rounded-lg transition-all shadow-sm shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Yangi kiyim SKU qo'shish</span>
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md">
          <p className="text-sm font-semibold text-red-800">ERP sinxronlash xatosi</p>
          <p className="text-xs text-red-700 mt-1">{error}</p>
        </div>
      )}

      {!isEditor && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-3.5 rounded-r-lg flex items-center gap-2">
          <Lock className="w-4 h-4 text-amber-600" />
          <p className="text-xs text-amber-800 font-medium">
            Faqat o'qish: joriy rolingiz <strong>{currentUser?.role}</strong> mahsulot qo'shish yoki tahrirlashga ruxsat bermaydi.
          </p>
        </div>
      )}

      {/* Sliding editor panel modal */}
      {isEditing && (
        <div className="bg-white p-6 rounded-xl border border-[#E6E1DA] shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-[#FAF9F5]">
            <h3 className="text-lg font-bold font-display text-[#1E1B18]">
              {selectedProductId ? "Mahsulot ma'lumotlarini yangilash" : "Yangi SKU mahsulot yaratish"}
            </h3>
            <button onClick={resetForm} className="text-xs text-[#7A7570] hover:text-[#1E1B18]">
              Bekor qilish ×
            </button>
          </div>

          <form className="grid grid-cols-1 md:grid-cols-3 gap-4" onSubmit={handleSave}>
            <div>
              <label className="block text-xs font-semibold text-[#4A4642] uppercase mb-1">SKU / mahsulot nomi</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Classic Silk Blouse"
                className="w-full px-3 py-2 bg-white border border-[#E6E1DA] rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4A4642] uppercase mb-1">SKU kodi</label>
              <input
                type="text"
                required
                value={SKU}
                onChange={(e) => setSKU(e.target.value)}
                placeholder="LXX-BLS-09"
                className="w-full px-3 py-2 bg-white border border-[#E6E1DA] rounded-lg text-sm font-mono uppercase"
              />
            </div>

            <div>
              <div className="flex justify-between">
                <label className="block text-xs font-semibold text-[#4A4642] uppercase mb-1">Mahsulot kategoriyasi</label>
                <button
                  type="button"
                  onClick={() => setIsAddingCategory(!isAddingCategory)}
                  className="text-[10px] text-[#C5A059] font-semibold hover:underline"
                >
                  {isAddingCategory ? "Yopish" : "Yangi yaratish"}
                </button>
              </div>

              {isAddingCategory ? (
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    required
                    placeholder="Masalan, poyabzal"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="flex-1 px-3 py-1 bg-white border border-[#E6E1DA] rounded-lg text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    className="bg-[#C5A059] text-white text-[10px] uppercase font-semibold px-2 rounded-lg"
                  >
                    Qo'shish
                  </button>
                </div>
              ) : (
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E6E1DA] rounded-lg text-sm"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4A4642] uppercase mb-1">O'lcham</label>
              <input
                type="text"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                placeholder="E.g., M, XL, 32/34"
                className="w-full px-3 py-2 bg-white border border-[#E6E1DA] rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4A4642] uppercase mb-1">Rang</label>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="Beige, Black"
                className="w-full px-3 py-2 bg-white border border-[#E6E1DA] rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4A4642] uppercase mb-1">Tannarx ($)</label>
              <input
                type="number"
                step="0.01"
                required
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                placeholder="15.00"
                className="w-full px-3 py-2 bg-white border border-[#E6E1DA] rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4A4642] uppercase mb-1">Sotuv narxi ($)</label>
              <input
                type="number"
                step="0.01"
                required
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                placeholder="35.00"
                className="w-full px-3 py-2 bg-white border border-[#E6E1DA] rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4A4642] uppercase mb-1">Boshlang'ich qoldiq (WMS)</label>
              <input
                type="number"
                disabled={!!selectedProductId} /* Stock is controlled via PO / adjustment ledger once created */
                required
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                placeholder="100"
                className="w-full px-3 py-2 bg-white border border-[#E6E1DA] rounded-lg text-sm disabled:bg-gray-50 disabled:text-gray-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4A4642] uppercase mb-1">Minimal qoldiq darajasi</label>
              <input
                type="number"
                required
                value={reorderLevel}
                onChange={(e) => setReorderLevel(e.target.value)}
                placeholder="15"
                className="w-full px-3 py-2 bg-white border border-[#E6E1DA] rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4A4642] uppercase mb-1">Yetkazuvchi bog'lanishi</label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#E6E1DA] rounded-lg text-sm"
              >
                <option value="">-- Yetkazuvchi biriktirilmagan --</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.companyName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4A4642] uppercase mb-1">Katalog holati</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-white border border-[#E6E1DA] rounded-lg text-sm"
              >
                <option value="ACTIVE">Faol</option>
                <option value="ARCHIVED">Arxivlangan / yashirilgan</option>
              </select>
            </div>

            <div className="md:col-span-3 pt-3 flex justify-end gap-2 border-t border-[#FAF9F5]">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-[#E6E1DA] hover:bg-[#FAF9F5] text-xs font-semibold rounded-lg text-[#7A7570]"
              >
                Tahrirlashni yopish
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#1E1B18] hover:bg-[#2D2A26] text-white text-xs font-semibold rounded-lg"
              >
                O'zgarishlarni saqlash
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#FAF9F5] shadow-[0_1px_3px_rgba(0,0,0,0.01)] flex flex-col md:flex-row md:items-center gap-3">
        <div className="flex-1 relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#A29E99]">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="SKU yoki mahsulot nomi bo'yicha qidirish..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#FAF9F5] border border-[#E6E1DA] rounded-lg text-xs"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Categories select */}
          <div className="flex items-center space-x-2">
            <Filter className="w-3.5 h-3.5 text-[#C5A059]" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 bg-[#FAF9F5] border border-[#E6E1DA] rounded-lg text-xs"
            >
              <option value="">Barcha kategoriyalar</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <select
            value={stockStatus}
            onChange={(e) => setStockStatus(e.target.value)}
            className="px-3 py-1.5 bg-[#FAF9F5] border border-[#E6E1DA] rounded-lg text-xs"
          >
            <option value="ALL">Barcha qoldiqlar</option>
            <option value="LOW">Faqat kam qoldiq</option>
            <option value="OK">Yetarli qoldiq</option>
          </select>
        </div>
      </div>

      {/* Grid listing */}
      <div className="bg-white rounded-xl border border-[#FAF9F5] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FAF9F5] text-[#7A7570] border-b border-[#E6E1DA]">
                <th className="p-4 uppercase font-semibold">SKU / mahsulot nomi</th>
                <th className="p-4 uppercase font-semibold">Kategoriya</th>
                <th className="p-4 uppercase font-semibold">O'lcham / rang</th>
                <th className="p-4 uppercase font-semibold text-right">Tannarx</th>
                <th className="p-4 uppercase font-semibold text-right">Ulgurji narx</th>
                <th className="p-4 uppercase font-semibold text-center">Ombor qoldig'i</th>
                <th className="p-4 uppercase font-semibold">Yetkazuvchi</th>
                <th className="p-4 uppercase font-semibold text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#FAF9F5]">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-[#7A7570] font-light">
                    Bazada mos mahsulot topilmadi.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isLowStock = p.stockQuantity <= p.reorderLevel;
                  return (
                    <tr key={p.id} className="hover:bg-[#FCFAFB] transition-colors">
                      <td className="p-4">
                        <div className="flex items-start gap-2.5">
                          <Tag className="w-4 h-4 text-[#C5A059] shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-[#1E1B18] block">{p.name}</span>
                            <span className="font-mono text-[10px] text-[#7A7570] uppercase shrink-0 bg-[#FAF9F5] px-1.5 py-0.5 border border-[#E6E1DA] rounded">
                              {p.SKU}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="bg-gray-100 text-gray-800 text-[10px] px-2 py-0.5 rounded-full uppercase font-medium">
                          {p.category?.name || "Kategoriyasiz"}
                        </span>
                      </td>
                      <td className="p-4 text-[#4A4642] font-light">
                        {p.size || "Erkin"} / {p.color || "Turli"}
                      </td>
                      <td className="p-4 text-right font-medium text-[#7A7570]">
                        ${p.costPrice.toFixed(2)}
                      </td>
                      <td className="p-4 text-right font-semibold text-[#1E1B18]">
                        ${p.salePrice.toFixed(2)}
                      </td>
                      <td className="p-4 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className={`font-bold ${isLowStock ? "text-amber-600" : "text-[#1E1B18]"}`}>
                            {p.stockQuantity} pcs
                          </span>
                          {isLowStock ? (
                            <span className="flex items-center text-[9px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 mt-0.5">
                              <AlertTriangle className="w-2.5 h-2.5 mr-0.5" />
                              Minimal {p.reorderLevel}
                            </span>
                          ) : (
                            <span className="text-[9px] text-emerald-600 font-medium">Yetarli</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-[#7A7570]">
                        {p.supplier?.companyName || "Yetkazuvchi biriktirilmagan"}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => handleEditClick(p)}
                            className="p-1.5 border border-[#E6E1DA] hover:border-[#C5A059] hover:text-[#C5A059] text-[#7A7570] rounded-md transition-all"
                            title="Tahrirlash"
                            disabled={!isEditor}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="p-1.5 border border-[#E6E1DA] hover:border-red-500 hover:text-red-500 text-[#7A7570] rounded-md transition-all"
                            title="SKUni arxivlash"
                            disabled={!isEditor}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
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
