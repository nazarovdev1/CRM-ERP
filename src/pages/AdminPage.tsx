import { useState, useEffect } from "react";
import { api } from "../api";
import { User, Role } from "../types";
import { Shield, Sparkles, AlertOctagon, Check, UserPlus, Trash, ChevronDown, Lock } from "lucide-react";

export function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setCurrentUser(api.auth.getCurrentUser());
    loadBarchasiUsers();
  }, []);

  async function loadBarchasiUsers() {
    setLoading(true);
    setError(null);
    try {
      const uData = await api.auth.getUsers();
      setUsers(uData);
    } catch (err: any) {
      setError(err.message || "Foydalanuvchilar ro'yxatini yuklab bo'lmadi. Ruxsat rad etildi.");
    } finally {
      setLoading(false);
    }
  }

  // Double security block
  const isAdmin = currentUser && currentUser.role === "ADMIN";

  const triggerNotify = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 4000);
  };

  const handleRoleChange = async (userId: string, newRole: Role) => {
    if (!isAdmin) return;
    setError(null);
    try {
      await api.auth.updateUserRole(userId, newRole);
      triggerNotify("Foydalanuvchi huquqlari yangilandi.");
      loadBarchasiUsers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!isAdmin) return;
    if (userId === currentUser.id) {
      setError("Self-containment rule: cannot terminate your own administrative credential.");
      return;
    }
    if (!confirm("Bu xodim akkauntini o'chirishni tasdiqlaysizmi?")) return;

    setError(null);
    try {
      await api.auth.deleteUser(userId);
      triggerNotify("Akkaunt o'chirildi.");
      loadBarchasiUsers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[400px] bg-white border rounded-xl shadow-sm text-center">
        <div className="w-14 h-14 bg-red-50 border border-red-200 rounded-lg flex items-center justify-center text-red-600 mb-4 animate-bounce">
          <AlertOctagon className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-display font-bold text-[#1E1B18]">Admin huquqi yo'q</h2>
        <p className="text-sm text-[#7A7570] max-w-sm mt-2 leading-relaxed font-sans">
          Bu bo'lim faqat luxx.uz administratorlari uchun. Sizning joriy rolingiz bu sahifani boshqarishga ruxsat bermaydi.
        </p>
      </div>
    );
  }

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
          <Shield className="w-8 h-8 text-[#C5A059]" />
          Foydalanuvchi huquqlarini boshqarish
        </h1>
        <p className="text-sm text-[#7A7570]">
          Xodimlar ro'yxatini ko'ring, rollarni o'zgartiring yoki akkauntlarni o'chiring.
        </p>
      </div>

      {success && (
        <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-md flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <p className="text-xs font-semibold text-emerald-800">{success}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md">
          <p className="text-xs text-red-700 font-semibold">{error}</p>
        </div>
      )}

      {/* Directory Grid Table */}
      <div className="bg-white rounded-xl border border-[#FAF9F5] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#FAF9F5] flex justify-between items-center bg-[#FCFAF8]">
          <h3 className="font-semibold text-sm text-[#1E1B18]">XODIMLAR RO'YXATI</h3>
          <span className="text-[10px] text-gray-500 font-mono">Soni: {users.length} faol ro'yxat</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-xs border-collapse">
            <thead>
              <tr className="bg-[#FAF9F5] text-[#7A7570] border-b border-[#E6E1DA]">
                <th className="p-4 uppercase font-semibold">Foydalanuvchi</th>
                <th className="p-4 uppercase font-semibold text-center">Joriy rol</th>
                <th className="p-4 uppercase font-semibold">Ro'yxatdan o'tgan sana</th>
                <th className="p-4 uppercase font-semibold text-center">Rolni o'zgartirish</th>
                <th className="p-4 uppercase font-semibold text-right">O'chirish</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#FAF9F5]">
              {users.map(u => {
                const isMe = u.id === currentUser.id;
                return (
                  <tr key={u.id} className="hover:bg-[#FCFAFB] transition-colors">
                    <td className="p-4">
                      <div>
                        <span className="font-bold text-[#1E1B18] block">{u.name} {isMe && <span className="text-[10px] bg-[#FAF9F5] text-[#C5A059] border border-[#C5A059] font-bold px-1.5 py-0.5 rounded ml-1 font-mono">SIZ</span>}</span>
                        <span className="font-mono text-[9px] text-[#7A7570]">{u.email}</span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded font-bold uppercase text-[9px] ${
                        u.role === "ADMIN" ? "bg-red-50 text-red-700 border border-red-200" :
                        u.role === "MANAGER" ? "bg-purple-50 text-purple-700" :
                        u.role === "SALES" ? "bg-blue-50 text-blue-700" :
                        u.role === "WAREHOUSE" ? "bg-yellow-50 text-yellow-700" : "bg-gray-100 text-gray-700"
                      }`}>{u.role}</span>
                    </td>
                    <td className="p-4 text-[#7A7570] font-mono">
                      {new Date(u.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4 text-center">
                      {!isMe ? (
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value as Role)}
                          className="px-2.5 py-1 bg-[#FAF9F5] border border-[#E6E1DA] rounded text-xs select-none focus:outline-none"
                        >
                          <option value="VIEWER">VIEWER</option>
                          <option value="SALES">SALES</option>
                          <option value="WAREHOUSE">WAREHOUSE</option>
                          <option value="MANAGER">MANAGER</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      ) : (
                        <span className="text-[10px] text-gray-400 font-bold block text-center">Himoyalangan ✓</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {!isMe ? (
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-1.5 hover:text-red-500 text-gray-400 border rounded hover:border-red-500 transition-all"
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <span className="text-[10px] text-gray-400 font-bold block text-right">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
