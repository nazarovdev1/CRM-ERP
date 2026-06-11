import { useState, useEffect } from "react";
import { api } from "../api";
import { ActivityLog } from "../types";
import { Clock, Search, ShieldCheck, User } from "lucide-react";

export function ActivityPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadLogs() {
      try {
        const responseData = await api.dashboard.getSummary(); // Contains all logs
        setLogs(responseData.recentLogs || []);
      } catch (err: any) {
        setError(err.message || "Audit tarixini yuklab bo'lmadi.");
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, []);

  const filteredLogs = logs.filter(l => 
    l.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.userName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#C5A059]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="text-3xl font-display font-semibold tracking-tight text-[#1E1B18] flex items-center gap-2">
          Korporativ xavfsizlik audit jurnali
        </h1>
        <p className="text-sm text-[#7A7570]">
          luxx.uz ish maydonidagi ERP va CRM amallari bo'yicha to'liq audit tarixi.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md">
          <p className="text-xs text-red-700">{error}</p>
        </div>
      )}

      {/* Search Console */}
      <div className="bg-white p-4 rounded-xl border border-[#FAF9F5] shadow-sm flex items-center gap-3">
        <div className="flex-1 relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#A29E99]">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Amal, tavsif yoki foydalanuvchi bo'yicha qidirish..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#FAF9F5] border border-[#E6E1DA] rounded-lg text-xs"
          />
        </div>
      </div>

      {/* Audit Log Timeline UI */}
      <div className="bg-white rounded-xl border border-[#FAF9F5] shadow-sm p-6">
        <div className="relative border-l border-[#E6E1DA] ml-4 pl-6 space-y-8">
          {filteredLogs.length === 0 ? (
            <p className="text-center text-gray-500 text-xs py-8">Audit yozuvlari topilmadi.</p>
          ) : (
            filteredLogs.map(l => (
              <div key={l.id} className="relative">
                {/* Visual marker */}
                <span className="absolute -left-[31px] top-1.5 w-4.5 h-4.5 rounded-full bg-white border-2 border-[#C5A059] flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
                </span>

                <div className="bg-[#FCFAF7] border border-[#FAF9F5] hover:border-[#C5A059] p-4 rounded-lg shadow-[0_1px_2px_rgba(0,0,0,0.01)] transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <p className="text-[#1E1B18] font-medium text-sm leading-relaxed">{l.description}</p>
                    <span className="text-[10px] text-gray-400 font-mono whitespace-nowrap flex items-center gap-1 bg-white px-2 py-0.5 border border-[#E6E1DA] rounded">
                      <Clock className="w-3 h-3 text-[#C5A059]" />
                      {new Date(l.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-[#FAF9F5] flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#C5A059]" />
                      Operator: <strong className="text-gray-700 font-medium">{l.userName}</strong>
                    </span>

                    <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      PostgreSQL audit yozuvi
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
