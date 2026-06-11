import { useState, useEffect } from "react";
import { api } from "../api";
import { Server, Activity, ShieldAlert, Wifi, Database, RefreshCw, Send } from "lucide-react";

export function SettingsPage() {
  const [latency, setLatency] = useState<number | null>(null);
  const [pinState, setPinState] = useState("STANDBY"); // STANDBY, TESTING, OK, ERROR
  const [dbType, setDbType] = useState("DETECTION");

  const [jwtSecretInfo, setJwtSecretInfo] = useState("HS256 Standard Enforced Token Header");

  // Load backend variables information on load
  useEffect(() => {
    async function testDBMode() {
      try {
        // Query health API
        const start = performance.now();
        const res = await fetch("/api/health");
        const duration = Math.round(performance.now() - start);
        const data = await res.json();
        
        setLatency(duration);
        setDbType(data.databaseMode === "prisma" ? "RENDER.COM CLOUD POSTGRESQL (Prisma ORM)" : "LOCAL EMULATED SANDBOX ENGINE (JSON Fallback)");
        setPinState("OK");
      } catch {
        setPinState("ERROR");
        setDbType("DISCONNECTED");
      }
    }
    testDBMode();
  }, []);

  const triggerPing = async () => {
    setPinState("TESTING");
    try {
      const start = performance.now();
      const res = await fetch("/api/health");
      const duration = Math.round(performance.now() - start);
      await res.json();
      setLatency(duration);
      setPinState("OK");
    } catch {
      setPinState("ERROR");
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="text-3xl font-display font-semibold tracking-tight text-[#1E1B18] flex items-center gap-2">
          <Server className="w-8 h-8 text-[#C5A059]" />
          Diagnostika va infratuzilma sozlamalari
        </h1>
        <p className="text-sm text-[#7A7570]">
          Bulut tarmog'i, kechikish va Render.com database klasterlarini tekshiring.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Latency checker widget */}
        <div className="lg:col-span-4 bg-white p-6 rounded-xl border border-[#FAF9F5] shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-semibold text-[#1E1B18] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Wifi className="w-4 h-4 text-[#C5A059]" />
              Ping kechikishini tekshirish
            </h2>
            <p className="text-xs text-gray-500 mb-6 leading-relaxed">
              Server javob vaqtini o'lchash uchun API chaqiruvini yuboradi.
            </p>

            {/* Visual speedmeter */}
            <div className="flex flex-col items-center justify-center p-6 border rounded-xl bg-[#FCFAF8] mb-4">
              {pinState === "TESTING" ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C5A059]" />
              ) : pinState === "OK" ? (
                <>
                  <span className="text-4xl font-bold font-mono text-[#1E1B18]">{latency} ms</span>
                  <span className="text-xs font-bold font-mono text-emerald-600 block mt-2 uppercase">✓ A'lo ishlash</span>
                </>
              ) : (
                <span className="text-sm font-semibold text-red-600 block">Server javob bermadi</span>
              )}
            </div>
          </div>

          <button
            onClick={triggerPing}
            disabled={pinState === "TESTING"}
            className="w-full bg-[#1E1B18] text-white hover:bg-[#2F2925] text-xs font-bold py-2.5 rounded-lg transition"
          >
            API kechikishini tekshirish →
          </button>
        </div>

        {/* Database mode detection */}
        <div className="lg:col-span-8 bg-white p-6 rounded-xl border border-[#FAF9F5] shadow-sm space-y-4">
          <h2 className="text-sm font-semibold text-[#1E1B18] uppercase tracking-wider flex items-center gap-1.5">
            <Database className="w-4 h-4 text-[#C5A059]" />
            Faol infratuzilma
          </h2>

          <div className="space-y-3.5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 border-b border-[#FAF9F5] pb-3 text-xs">
              <span className="text-[#7A7570] font-semibold">Faol database muhiti</span>
              <span className="md:col-span-2 text-[#1E1B18] font-bold uppercase">{dbType}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 border-b border-[#FAF9F5] pb-3 text-xs">
              <span className="text-[#7A7570] font-semibold">Domen</span>
              <span className="md:col-span-2 text-[#1E1B18] font-mono">https://luxx.uz (Ulgurji kiyim-kechak portal)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 border-b border-[#FAF9F5] pb-3 text-xs">
              <span className="text-[#7A7570] font-semibold">Render provayderi</span>
              <span className="md:col-span-2 text-gray-600 font-mono">Render.com Cloud PostgreSQL (Region: Frankfurt, AWS eu-central-1)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 border-b border-[#FAF9F5] pb-3 text-xs">
              <span className="text-[#7A7570] font-semibold">Hosting muhiti</span>
              <span className="md:col-span-2 text-gray-600">Plesk Linux Onyx Panel Managed Hosting environment</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 border-b border-[#FAF9F5] pb-3 text-xs">
              <span className="text-[#7A7570] font-semibold">CI/CD integratsiyasi</span>
              <span className="md:col-span-2 text-gray-600">GitHub Amallar automatically triggering `npm run build` on push of master branch files</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
              <span className="text-[#7A7570] font-semibold">JWT imzolash protokoli</span>
              <span className="md:col-span-2 text-gray-600 font-mono">{jwtSecretInfo}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
