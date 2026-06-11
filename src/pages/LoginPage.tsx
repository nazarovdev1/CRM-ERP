import { useState, type FormEvent } from "react";
import { api } from "../api";
import { Lock, Mail, User, ShieldAlert, Sparkles } from "lucide-react";

interface LoginPageProps {
  onLoginSuccess: (user: any) => void;
}

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("VIEWER");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegistering) {
        const user = await api.auth.register({ email, name, password, role });
        onLoginSuccess(user);
        window.location.hash = "#/dashboard";
      } else {
        const user = await api.auth.login({ email, password });
        onLoginSuccess(user);
        window.location.hash = "#/dashboard";
      }
    } catch (err: any) {
      setError(err.message || "Kirish jarayonida xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (quickEmail: string, quickPass: string) => {
    setError(null);
    setLoading(true);
    try {
      const user = await api.auth.login({ email: quickEmail, password: quickPass });
      onLoginSuccess(user);
      window.location.hash = "#/dashboard";
    } catch (err: any) {
      setError(err.message || "Tezkor kirish amalga oshmadi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-[#FAF9F5] font-sans antialiased text-[#2E2C2A]">
      {/* Visual luxury showcase sidebar */}
      <div className="hidden lg:flex lg:col-span-5 relative bg-[#1E1B18] text-white p-12 flex-col justify-between overflow-hidden">
        {/* Background gradient overlays */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(197,160,89,0.15),transparent_60%)] pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-t from-[#12100E] to-transparent opacity-80 pointer-events-none" />

        <div className="relative z-10 flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full border-2 border-[#D4AF37] flex items-center justify-center font-display font-bold text-xs text-[#D4AF37]">
            L
          </div>
          <span className="font-display font-semibold tracking-widest text-[#D4AF37] text-lg uppercase">LUXX.UZ</span>
        </div>

        <div className="relative z-10 space-y-6">
          <span className="text-[#D4AF37] font-display uppercase tracking-widest text-xs font-semibold block">
            — BTEC Unit 6: Client Server Cloud Migration
          </span>
          <h1 className="text-4xl xl:text-5xl font-display font-light text-[#EFECE6] leading-snug">
            Ulgurji kiyim-kechak <br />
            <strong className="font-semibold text-[#D4AF37]">ERP & CRM</strong> Platformasi.
          </h1>
          <p className="text-[#A29E99] leading-relaxed text-sm xl:text-base font-light font-sans">
            Demonstrating high-availability networking, robust PostgreSQL databases, secure role guarding, and fully managed logistics for clothing apparel warehousing in a production cloud environment.
          </p>
        </div>

        <div className="relative z-10 border-t border-[#36322E] pt-6 flex justify-between items-center">
          <p className="text-xs text-[#7A7570] font-mono">ILOVA PORTI: 3000</p>
          <span className="flex items-center text-xs text-[#D4AF37] font-mono">
            <Sparkles className="w-3 h-3 mr-1 text-[#D4AF37]" />
            Render PostgreSQL jonli tarmog'i
          </span>
        </div>
      </div>

      {/* Form content */}
      <div className="lg:col-span-7 flex flex-col justify-center p-8 sm:p-12 xl:p-16">
        <div className="max-w-md w-full mx-auto space-y-8">
          <div>
            <h2 className="text-3xl font-display font-semibold tracking-tight text-[#1E1B18]">
              {isRegistering ? "Ish maydoni akkauntini yaratish" : "Korporativ tizimga kirish"}
            </h2>
            <p className="mt-2 text-sm text-[#7A7570]">
              {isRegistering 
                ? "luxx.uz tizimida ro'yxatdan o'tish uchun bo'lim huquqlarini tanlang." 
                : "ERP buyurtmalar va CRM jarayonlarini boshqarish uchun login-parolingizni kiriting."}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-bold text-red-800">Autentifikatsiya ogohlantirishi</h3>
                <p className="text-xs text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {isRegistering && (
              <div>
                <label className="block text-xs font-semibold tracking-wider text-[#4A4642] uppercase mb-1">
                  To'liq ism
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#A29E99]">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="E.g., Shakhnoza Karimova"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E6E1DA] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold tracking-wider text-[#4A4642] uppercase mb-1">
                Korporativ email manzili
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#A29E99]">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@luxx.uz"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E6E1DA] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold tracking-wider text-[#4A4642] uppercase mb-1">
                Parol
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#A29E99]">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E6E1DA] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-all"
                />
              </div>
            </div>

            {isRegistering && (
              <div>
                <label className="block text-xs font-semibold tracking-wider text-[#4A4642] uppercase mb-1">
                  Bo'limdagi rol
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E6E1DA] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-all"
                >
                  <option value="VIEWER">Kuzatuvchi (faqat ko'rish)</option>
                  <option value="SALES">Savdo xodimi (CRM, lidlar, mijozlar, buyurtmalar)</option>
                  <option value="WAREHOUSE">Ombor logistika (mahsulot, yetkazuvchi, xarid buyurtmalari)</option>
                  <option value="MANAGER">Menejer (ERP va CRM)</option>
                  <option value="ADMIN">Administrator (sozlamalar va rollar)</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#1E1B18] text-white hover:bg-[#2D2A26] rounded-lg text-sm font-semibold tracking-wider transition-all disabled:opacity-50 mt-6"
            >
              {loading ? "Ma'lumotlar tekshirilmoqda..." : isRegistering ? "Ro'yxatdan o'tishni yakunlash" : "Tizimga kirish"}
            </button>
          </form>

          <div className="text-center pt-2">
            <button
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-xs font-medium text-[#c5a059] hover:underline"
            >
              {isRegistering 
                ? "Akkauntingiz bormi? Shu yerdan kiring" 
                : "Kirish kerakmi? Bo'lim akkauntini yarating"}
            </button>
          </div>

          {/* Quick Evaluate Seeding helper */}
          <div className="border-t border-[#E6E1DA] pt-6 mt-8 space-y-4">
            <p className="text-xs font-semibold tracking-wider text-[#7A7570] uppercase">
              Tezkor kirish akkauntlari:
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin("admin@luxx.uz", "Admin12345")}
                className="p-2 border border-[#E6E1DA] hover:border-[#D4AF37] rounded-md text-left transition-all hover:bg-white"
              >
                <span className="font-bold text-[#1E1B18] block">Admin akkaunti</span>
                <span className="text-[#7A7570] block">admin@luxx.uz</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin("manager@luxx.uz", "Manager12345")}
                className="p-2 border border-[#E6E1DA] hover:border-[#D4AF37] rounded-md text-left transition-all hover:bg-white"
              >
                <span className="font-bold text-[#1E1B18] block">Menejer ko'rinishi</span>
                <span className="text-[#7A7570] block">manager@luxx.uz</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin("sales@luxx.uz", "Sales12345")}
                className="p-2 border border-[#E6E1DA] hover:border-[#D4AF37] rounded-md text-left transition-all hover:bg-white"
              >
                <span className="font-bold text-[#1E1B18] block">Savdo CRM xodimi</span>
                <span className="text-[#7A7570] block">sales@luxx.uz</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin("warehouse@luxx.uz", "Warehouse12345")}
                className="p-2 border border-[#E6E1DA] hover:border-[#D4AF37] rounded-md text-left transition-all hover:bg-white"
              >
                <span className="font-bold text-[#1E1B18] block">Ombor WMS</span>
                <span className="text-[#7A7570] block">warehouse@luxx.uz</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
