import { useState, useEffect } from "react";
import { api } from "../api";
import { DashboardSummary } from "../types";
import { 
  TrendingUp, 
  Users, 
  Layers, 
  Target, 
  DollarSign, 
  ChevronRight, 
  Activity, 
  Clock, 
  AlertTriangle 
} from "lucide-react";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell 
} from "recharts";

const COLORS = ["#1E1B18", "#C5A059", "#7A7570", "#4A4642", "#E6E1DA"];

export function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSummary() {
      try {
        const data = await api.dashboard.getSummary();
        setSummary(data);
      } catch (err: any) {
        setError(err.message || "Dashboard ma'lumotlarini yuklab bo'lmadi.");
      } finally {
        setLoading(false);
      }
    }
    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#C5A059]" />
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md">
        <p className="text-sm font-semibold text-red-800">Ko'rsatkichlarni yuklashda xatolik</p>
        <p className="text-xs text-red-700 mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-semibold tracking-tight text-[#1E1B18]">
            Korporativ boshqaruv paneli
          </h1>
          <p className="text-sm text-[#7A7570]">
            luxx.uz uchun ulgurji savdo ko'rsatkichlari va CRM lidlar nazorati.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs text-[#7A7570] font-mono bg-[#FAF9F5] border border-[#E6E1DA] px-3 py-1.5 rounded-md">
          <Clock className="w-3.5 h-3.5 text-[#C5A059]" />
          <span>Sinxron: PostgreSQL ulanishi faol</span>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {summary.lowStockCount > 0 && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-md flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 md:flex md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-amber-800">Omborda kam qoldiq ogohlantirishi</h3>
              <p className="text-xs text-amber-700 mt-0.5">
                Hozir <strong>{summary.lowStockCount}</strong> ta mahsulot minimal qoldiq darajasidan past. Ombor sahifasida chorani ko'ring.
              </p>
            </div>
            <a href="#/inventory" className="text-xs font-semibold text-[#c5a059] hover:underline whitespace-nowrap mt-2 md:mt-0 block">
              Ombor qoldiqlarini sozlash →
            </a>
          </div>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-[#FAF9F5] shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[#FAF9F5] border border-[#E6E1DA] flex items-center justify-center text-[#C5A059]">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-[#7A7570] uppercase font-semibold tracking-wider">To'langan jami tushum</p>
            <h3 className="text-2xl font-semibold text-[#1E1B18] mt-1">
              ${summary.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#FAF9F5] shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[#FAF9F5] border border-[#E6E1DA] flex items-center justify-center text-[#1E1B18]">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-[#7A7570] uppercase font-semibold tracking-wider">Faol mijozlar</p>
            <h3 className="text-2xl font-semibold text-[#1E1B18] mt-1">{summary.totalCustomers}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#FAF9F5] shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[#FAF9F5] border border-[#E6E1DA] flex items-center justify-center text-[#C5A059]">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-[#7A7570] uppercase font-semibold tracking-wider">Ochiq kelishuvlar qiymati</p>
            <h3 className="text-2xl font-semibold text-[#1E1B18] mt-1">
              ${summary.openDealsValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#FAF9F5] shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-[#7A7570] uppercase font-semibold tracking-wider">Kam qolgan SKUlar</p>
            <h3 className="text-2xl font-semibold text-[#1E1B18] mt-1">{summary.lowStockCount}</h3>
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sales splines map */}
        <div className="lg:col-span-8 bg-white p-6 rounded-xl border border-[#FAF9F5] shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-semibold text-[#1E1B18]">Ulgurji tushum tahlili</h2>
              <p className="text-xs text-[#7A7570]">Oylik tranzaksiyalar va hisob-kitob grafigi.</p>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={summary.charts.salesTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C5A059" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#C5A059" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F1F1" />
                <XAxis dataKey="month" stroke="#A29E99" fontSize={11} tickLine={false} />
                <YAxis stroke="#A29E99" fontSize={11} tickLine={false} />
                <Tooltip />
                <Legend iconType="circle" />
                <Line type="monotone" dataKey="sales" name="Yalpi savdo" stroke="#A29E99" strokeWidth={1.5} dot />
                <Line type="monotone" dataKey="revenue" name="Qabul qilingan tushum" stroke="#C5A059" strokeWidth={2.5} dot />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories breakdown pie donut */}
        <div className="lg:col-span-4 bg-white p-6 rounded-xl border border-[#FAF9F5] shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#1E1B18]">Kategoriya bo'yicha qoldiq</h2>
            <p className="text-xs text-[#7A7570]">Ombordagi miqdorlar taqsimoti.</p>
          </div>
          
          <div className="h-56 relative my-4 flex justify-center items-center">
            {summary.charts.categoryBreakdown.length === 0 ? (
              <p className="text-xs text-[#7A7570]">Omborda mahsulot topilmadi.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={summary.charts.categoryBreakdown}
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {summary.charts.categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-xs text-[#7A7570] font-medium uppercase tracking-wider">WMS</span>
              <span className="text-lg font-bold text-[#1E1B18]">Muvozanatli</span>
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-[#FAF9F5]">
            {summary.charts.categoryBreakdown.map((cat, index) => (
              <div key={cat.name} className="flex justify-between items-center text-xs">
                <span className="flex items-center text-[#4A4642]">
                  <span className="w-2.5 h-2.5 rounded-full mr-1.5 block" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  {cat.name}
                </span>
                <span className="font-semibold text-[#1E1B18]">{cat.value} pcs</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Deal status pipeline bar chart */}
        <div className="lg:col-span-4 bg-white p-6 rounded-xl border border-[#FAF9F5] shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#1E1B18]">CRM voronkasi holati</h2>
            <p className="text-xs text-[#7A7570]">Faol kelishuvlar va shartnomalar statistikasi.</p>
          </div>
          <div className="h-60 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary.charts.dealFunnel} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#FAF9F5" />
                <XAxis dataKey="name" stroke="#A29E99" fontSize={10} tickLine={false} />
                <YAxis stroke="#A29E99" fontSize={10} tickLine={false} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" name="Kelishuvlar soni" fill="#C5A059" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent sales and activities logs */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Sales orders list */}
          <div className="bg-white p-6 rounded-xl border border-[#FAF9F5] shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-[#1E1B18]">So'nggi savdo buyurtmalari</h3>
              <a href="#/orders" className="text-xs font-semibold text-[#C5A059] hover:underline flex items-center">
                Barchasi
                <ChevronRight className="w-3 h-3 ml-0.5" />
              </a>
            </div>
            
            {summary.recentOrders.length === 0 ? (
              <p className="text-xs text-[#7A7570] py-4 text-center">Tranzaksiyalar hali yo'q.</p>
            ) : (
              <div className="space-y-3">
                {summary.recentOrders.map(order => (
                  <div key={order.id} className="flex justify-between items-center border-b border-[#FAF9F5] pb-2 text-xs">
                    <div>
                      <span className="font-bold text-[#1E1B18] font-mono">{order.orderNumber}</span>
                      <p className="text-[10px] text-[#7A7570] truncate max-w-[140px]">{order.customer?.name}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-[#1E1B18]">${order.total}</span>
                      <span className={`block text-[9px] font-bold ${
                        order.status === "COMPLETED" ? "text-emerald-600" : "text-amber-600"
                      }`}>{order.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Activity audit log trail */}
          <div className="bg-white p-6 rounded-xl border border-[#FAF9F5] shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-[#1E1B18] flex items-center gap-1">
                <Activity className="w-4 h-4 text-[#C5A059]" />
                Audit jurnali
              </h3>
              <a href="#/logs" className="text-xs font-semibold text-[#C5A059] hover:underline flex items-center">
                Tarix
                <ChevronRight className="w-3 h-3 ml-0.5" />
              </a>
            </div>

            <div className="space-y-3.5">
              {summary.recentLogs.map(log => (
                <div key={log.id} className="flex items-start gap-2.5 text-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#C5A059] mt-1.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-[#4A4642] font-light leading-snug">{log.description}</p>
                    <span className="text-[9px] text-[#A29E99] font-mono block mt-0.5">
                      {new Date(log.createdAt).toLocaleString()} • {log.userName}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
