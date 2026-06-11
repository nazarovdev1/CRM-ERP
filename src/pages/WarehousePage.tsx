import { useState, useEffect } from "react";
import { api } from "../api";
import { Product } from "../types";
import { Warehouse, Thermometer, Droplets, MapPin, Truck, HelpCircle, Activity, Sparkles } from "lucide-react";

export function WarehousePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWMS() {
      try {
        const data = await api.products.getAll();
        setProducts(data);
      } catch {
        // Fallback
      } finally {
        setLoading(false);
      }
    }
    loadWMS();
  }, []);

  // Compute stats
  const totalStock = products.reduce((acc, current) => acc + current.stockQuantity, 0);
  const lowStockCount = products.filter(p => p.stockQuantity <= p.reorderLevel).length;

  const aisles = [
    { code: "AISLE-A", category: "Outerwear & Coats", capacity: "82%", status: "OPTIMAL", color: "bg-amber-500" },
    { code: "AISLE-B", category: "Knitwear & Sweaters", capacity: "45%", status: "IDEAL", color: "bg-emerald-500" },
    { code: "AISLE-C", category: "Silk Dresses & Blouses", capacity: "91%", status: "NEAR-LIMIT", color: "bg-red-500" },
    { code: "AISLE-D", category: "Cotton Pants & Denim", capacity: "65%", status: "IDEAL", color: "bg-emerald-500" },
    { code: "AISLE-E", category: "Accessories & Belts", capacity: "20%", status: "SPARSE", color: "bg-blue-500" },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#C5A059]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-semibold tracking-tight text-[#1E1B18] flex items-center gap-2">
            <Warehouse className="w-8 h-8 text-[#C5A059]" />
            Ombor WMS ko'rinishi
          </h1>
          <p className="text-sm text-[#7A7570]">
            luxx.uz ombori uchun jonli ko'rsatkichlar va joylashuv nazorati.
          </p>
        </div>
      </div>

      {/* Telemetry row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-[#FAF9F5] shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600">
            <Thermometer className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <p className="text-xs text-[#7A7570] uppercase font-semibold tracking-wider">Yo'lak harorat sensori</p>
            <h3 className="text-2xl font-bold text-[#1E1B18] mt-1">21.4°C</h3>
            <span className="text-[10px] text-emerald-600 font-bold uppercase">Mato uchun xavfsiz</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#FAF9F5] shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            <Droplets className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-[#7A7570] uppercase font-semibold tracking-wider">Nisbiy namlik</p>
            <h3 className="text-2xl font-bold text-[#1E1B18] mt-1">45.2% RH</h3>
            <span className="text-[10px] text-emerald-600 font-bold uppercase">Mog'orga qarshi barqaror</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#FAF9F5] shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-[#7A7570] uppercase font-semibold tracking-wider">Faol yuklash doklari</p>
            <h3 className="text-2xl font-bold text-[#1E1B18] mt-1">Dock 2 & 4</h3>
            <span className="text-[10px] text-gray-500 font-mono">Zaxira: Dock 1, 3</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#FAF9F5] shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-600">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-[#7A7570] uppercase font-semibold tracking-wider">Ombor yuklamasi</p>
            <h3 className="text-2xl font-bold text-[#1E1B18] mt-1">{totalStock} pcs</h3>
            <span className="text-[10px] text-red-500 font-bold uppercase">{lowStockCount} ogohlantirish</span>
          </div>
        </div>
      </div>

      {/* Aisle floor layout bento box */}
      <h2 className="text-xl font-display font-semibold tracking-tight text-[#1E1B18] mt-8 mb-2">Virtual ombor yo'laklari xaritasi</h2>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Floor lists */}
        <div className="lg:col-span-8 bg-white p-6 rounded-xl border border-[#FAF9F5] shadow-sm space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-[#1E1B18]">Ombor joylashuvi</h3>
            <span className="text-xs text-emerald-600 font-bold flex items-center">
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              SLA standart joylashuvi
            </span>
          </div>

          <div className="space-y-4">
            {aisles.map(a => (
              <div key={a.code} className="border border-[#E6E1DA] rounded-lg p-4 bg-[#FCFAF8] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-[#1E1B18] text-[#C5A059] flex items-center justify-center font-mono font-bold text-xs">
                    {a.code.slice(-1)}
                  </div>
                  <div>
                    <span className="font-bold text-[#1E1B18] block">{a.code}</span>
                    <span className="text-xs text-gray-500 font-mono">Biriktirilgan kategoriya: <strong>{a.category}</strong></span>
                  </div>
                </div>

                <div className="flex-1 max-w-xs">
                  <div className="flex justify-between text-[11px] text-gray-600 mb-1">
                    <span>Sig'im</span>
                    <span>{a.capacity}</span>
                  </div>
                  <div className="w-full bg-[#E6E1DA] h-2 rounded-full overflow-hidden">
                    <div className={`h-2 ${a.color}`} style={{ width: a.capacity }} />
                  </div>
                </div>

                <span className="bg-white border rounded px-3 py-1 font-mono text-xs font-bold text-[#1E1B18]">
                  {a.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Packing advice card */}
        <div className="lg:col-span-4 bg-[#1E1B18] text-white p-6 rounded-xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(197,160,89,0.18),transparent_70%)] pointer-events-none" />
          <div className="space-y-4 relative z-10">
            <span className="text-[#C5A059] font-mono text-xs font-semibold uppercase tracking-wider">— WMS Safety Operations</span>
            <h3 className="text-2xl font-light font-display text-white">Optimal saqlash <br />Namlik bo'yicha ko'rsatma</h3>
            <p className="text-gray-400 text-xs leading-relaxed font-light font-sans">
              Mato sifati buzilmasligi uchun ipak mahsulotlarni 24°C dan yuqori haroratda saqlamang. Faol doklarni har kuni tekshiring va qutilar shikastlansa ombor jurnalini yangilang.
            </p>
          </div>

          <div className="border-t border-gray-800 pt-4 mt-6 text-xs text-[#C5A059] font-mono flex items-center gap-1.5 relative z-10">
            <HelpCircle className="w-4 h-4 shrink-0" />
            <span>Favqulodda holat: dokni bloklash</span>
          </div>
        </div>
      </div>
    </div>
  );
}
