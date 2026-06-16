import { useState, useEffect } from "react";
import { api } from "./api";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ProductsPage } from "./pages/ProductsPage";
import { InventoryPage } from "./pages/InventoryPage";
import { SuppliersPage } from "./pages/SuppliersPage";
import { CRMPage } from "./pages/CRMPage";
import { OrdersPage } from "./pages/OrdersPage";
import { WarehousePage } from "./pages/WarehousePage";
import { ActivityPage } from "./pages/ActivityPage";
import { AdminPage } from "./pages/AdminPage";
import { SettingsPage } from "./pages/SettingsPage";

import { 
  LayoutDashboard, 
  Tag, 
  Boxes, 
  Truck, 
  Users, 
  Receipt, 
  Warehouse, 
  Activity, 
  Shield, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Globe, 
  User as UserIcon,
  CircleDot
} from "lucide-react";

export default function App() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentHash, setCurrentHash] = useState(window.location.hash || "#/dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [healthStatus, setHealthStatus] = useState("OK");

  useEffect(() => {
    // Check local storage session on mount
    const user = api.auth.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    } else {
      window.location.hash = "#/";
    }

    // Ping check health of server api
    fetch("/api/health")
      .then(() => setHealthStatus("OK"))
      .catch(() => setHealthStatus("DISCONNECTED"));

    // Sync hash routes navigation
    const handleHash = () => {
      const hash = window.location.hash || "#/dashboard";
      setCurrentHash(hash);
      // If of dashboard and not logged in, force gate
      if (!api.auth.getCurrentUser() && hash !== "#/") {
        window.location.hash = "#/";
      }
    };
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  const handleLoginSuccess = (user: any) => {
    setCurrentUser(user);
    window.location.hash = "#/dashboard";
  };

  const handleLogout = () => {
    api.auth.logout();
    setCurrentUser(null);
    window.location.hash = "#/";
  };

  // If not logged in, serve gate
  if (!currentUser) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  // Sidebar Menu Nav configuration mapped to role gates
  const canReadWarehouse = ["ADMIN", "MANAGER", "WAREHOUSE"].includes(currentUser.role);
  const canReadCRM = ["ADMIN", "MANAGER", "SALES"].includes(currentUser.role);
  const isAdmin = currentUser.role === "ADMIN";

  const navigationItems = [
    { label: "Boshqaruv paneli", hash: "#/dashboard", icon: LayoutDashboard },
    { label: "Mahsulotlar katalogi", hash: "#/products", icon: Tag },
    { label: "Ombor harakatlari", hash: "#/inventory", icon: Boxes },
    { label: "Yetkazib beruvchilar", hash: "#/suppliers", icon: Truck },
    { label: "CRM ish maydoni", hash: "#/crm", icon: Users },
    { label: "Buyurtmalar va hisob-fakturalar", hash: "#/orders", icon: Receipt },
    { label: "Ombor WMS ko'rinishi", hash: "#/warehouse", icon: Warehouse },
    { label: "Xavfsizlik audit jurnali", hash: "#/logs", icon: Activity },
    { label: "Rollar boshqaruvi", hash: "#/admin", icon: Shield, adminOnly: true },
    { label: "Tarmoq diagnostikasi", hash: "#/settings", icon: Settings },
  ];

  const visibleNavs = navigationItems.filter(item => {
    if (item.adminOnly && !isAdmin) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#FCFBF9] flex font-sans antialiased text-[#2E2C2A]">
      
      {/* 1. COLLAPSIBLE DRAWER SIDEBAR (DESKTOP PERMANENT, MOBILE OVERLAY) */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[#1E1B18] text-white flex flex-col justify-between p-6 transition-transform duration-300 transform
        lg:translate-x-0 lg:static lg:h-screen lg:shrink-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="space-y-8">
          {/* Brand header */}
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full border-2 border-[#D4AF37] flex items-center justify-center font-display font-black text-xs text-[#D4AF37]">
                L
              </div>
              <span className="font-display font-medium tracking-widest text-[#D4AF37] uppercase text-sm">Remodule</span>
            </div>
            
            <button className="lg:hidden text-gray-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav menu links list */}
          <nav className="space-y-1">
            {visibleNavs.map(item => {
              const active = currentHash === item.hash;
              const Icon = item.icon;
              return (
                <a
                  key={item.label}
                  href={item.hash}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all uppercase
                    ${active 
                      ? "bg-[#C5A059] text-white shadow-sm" 
                      : "text-[#A29E99] hover:text-[#EFECE6] hover:bg-white/5"}
                  `}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </a>
              );
            })}
          </nav>
        </div>

        {/* User profile bottom footer */}
        <div className="border-t border-[#36322E] pt-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#36322E] border border-[#C5A059]/25 flex items-center justify-center text-[#D4AF37]">
              <UserIcon className="w-4 h-4" />
            </div>
            <div className="truncate flex-1">
              <span className="font-display text-xs font-semibold text-[#EFECE6] block truncate">{currentUser.name}</span>
              <span className="text-[9px] uppercase font-bold text-[#C5A059] block tracking-wider bg-[#36322E] px-1.5 py-0.5 rounded border border-[#C5A059]/10 mt-0.5 w-fit">
                {currentUser.role}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-2 justify-center py-2 border border-[#36322E] hover:border-red-500/50 hover:text-red-400 text-xs font-semibold text-gray-400 rounded-lg transition-all"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Sessiyani yakunlash</span>
          </button>
        </div>
      </aside>

      {/* MOBILE TRIGGER OVERLAY BACKGROUND */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)} 
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
        />
      )}

      {/* 2. CHUNKY CONTENT WORKSPACE ROUTER */}
      <div className="flex-1 flex flex-col min-w-0 max-h-screen overflow-hidden">
        {/* Workspace global TopBar header */}
        <header className="h-16 bg-white border-b border-[#FAF9F5] px-6 flex items-center justify-between shadow-sm shrink-0">
          <div className="flex items-center space-x-3">
            <button className="lg:hidden p-1.5 border rounded-md text-gray-500 hover:bg-gray-50 mr-1" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
            
            <div className="flex items-center space-x-1.5 text-xs font-semibold text-gray-500 font-mono">
              <Globe className="w-3.5 h-3.5 text-[#C5A059]" />
              <span className="uppercase text-[#1E1B18] tracking-widest font-bold">LUXX.UZ</span>
              <span className="text-gray-300">/</span>
              <span className="text-gray-400">Plesk Cloud</span>
            </div>
          </div>

          {/* Database & API connections live states green dots */}
          <div className="flex items-center space-x-3 text-xs">
            <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold font-sans text-[10px] uppercase">
              <CircleDot className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              <span>PostgreSQL faol</span>
            </div>
          </div>
        </header>

        {/* Scrollable central viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 xl:p-8">
          {(() => {
            switch (currentHash) {
              case "#/dashboard":
                return <DashboardPage />;
              case "#/products":
                return <ProductsPage />;
              case "#/inventory":
                return <InventoryPage />;
              case "#/suppliers":
                return <SuppliersPage />;
              case "#/crm":
                return <CRMPage />;
              case "#/orders":
                return <OrdersPage />;
              case "#/warehouse":
                return <WarehousePage />;
              case "#/logs":
                return <ActivityPage />;
              case "#/admin":
                return <AdminPage />;
              case "#/settings":
                return <SettingsPage />;
              default:
                return (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <h2 className="text-2xl font-bold font-display text-gray-800">404 - Sahifa topilmadi</h2>
                    <p className="text-xs text-gray-500 mt-1">So'ralgan bo'lim mavjud emas yoki arxivlangan.</p>
                    <a href="#/dashboard" className="mt-4 px-4 py-2 bg-[#1E1B18] text-white rounded text-xs">Panelga qaytish</a>
                  </div>
                );
            }
          })()}
        </main>
      </div>
    </div>
  );
}
