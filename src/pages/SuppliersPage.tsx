import { useState, useEffect, type FormEvent } from "react";
import { api } from "../api";
import { Supplier } from "../types";
import { Plus, Search, Edit2, Trash2, Mail, Phone, MapPin, Notebook, Lock } from "lucide-react";

export function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Search
  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [isEditing, setIsEditing] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    setCurrentUser(api.auth.getCurrentUser());
    loadSuppliers();
  }, []);

  async function loadSuppliers() {
    setLoading(true);
    setError(null);
    try {
      const data = await api.suppliers.getAll();
      setSuppliers(data);
    } catch (err: any) {
      setError(err.message || "Yetkazuvchilar bazasini yuklab bo'lmadi.");
    } finally {
      setLoading(false);
    }
  }

  const isEditor = currentUser && ["ADMIN", "MANAGER", "WAREHOUSE"].includes(currentUser.role);

  const resetForm = () => {
    setSelectedSupplierId(null);
    setCompanyName("");
    setContactPerson("");
    setPhone("");
    setEmail("");
    setAddress("");
    setNotes("");
    setIsEditing(false);
  };

  const handleEditClick = (s: Supplier) => {
    setSelectedSupplierId(s.id);
    setCompanyName(s.companyName);
    setContactPerson(s.contactPerson);
    setPhone(s.phone);
    setEmail(s.email);
    setAddress(s.address);
    setNotes(s.notes);
    setIsEditing(true);
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!isEditor) return;

    setError(null);
    const payload = {
      companyName,
      contactPerson,
      phone,
      email,
      address,
      notes
    };

    try {
      if (selectedSupplierId) {
        await api.suppliers.update(selectedSupplierId, payload);
      } else {
        await api.suppliers.create(payload);
      }
      resetForm();
      loadSuppliers();
    } catch (err: any) {
      setError(err.message || "Yetkazuvchi ma'lumotlarini saqlab bo'lmadi.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!isEditor) return;
    if (!confirm("Bu yetkazuvchini tizimdan o'chirishni tasdiqlaysizmi?")) return;

    setError(null);
    try {
      await api.suppliers.delete(id);
      loadSuppliers();
    } catch (err: any) {
      setError(err.message || "Yetkazuvchini o'chirib bo'lmadi.");
    }
  };

  const filteredSuppliers = suppliers.filter(s => 
    s.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            Yetkazuvchilar va ishlab chiqaruvchilar CRM
          </h1>
          <p className="text-sm text-[#7A7570]">
            Luxx uchun to'qimachilik yetkazuvchilari va import kelishuvlarini boshqaring.
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
            <span>Yetkazuvchi shartnomasini qo'shish</span>
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md">
          <p className="text-sm font-semibold text-red-800">Yetkazuvchi sinxronlash xatosi</p>
          <p className="text-xs text-red-700 mt-1">{error}</p>
        </div>
      )}

      {!isEditor && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-3.5 rounded-r-lg flex items-center gap-2">
          <Lock className="w-4 h-4 text-amber-600" />
          <p className="text-xs text-amber-800 font-medium">
            Faqat o'qish: joriy huquqingiz ishlab chiqaruvchi profilini qo'shish yoki tahrirlashni cheklaydi.
          </p>
        </div>
      )}

      {/* Slide down register/edit form */}
      {isEditing && (
        <div className="bg-white p-6 rounded-xl border border-[#E6E1DA] shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-[#FAF9F5]">
            <h3 className="text-lg font-bold font-display text-[#1E1B18]">
              {selectedSupplierId ? "Ishlab chiqaruvchi ma'lumotini yangilash" : "Xomashyo yetkazuvchisini ro'yxatga olish"}
            </h3>
            <button onClick={resetForm} className="text-xs text-[#7A7570] hover:text-[#1E1B18]">
              Bekor qilish ×
            </button>
          </div>

          <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" onSubmit={handleSave}>
            <div>
              <label className="block text-xs font-semibold text-[#4A4642] uppercase mb-1">Kompaniya / fabrika nomi</label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Istanbul Textile Corp"
                className="w-full px-3 py-2 bg-white border border-[#E6E1DA] rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4A4642] uppercase mb-1">Mas'ul vakil</label>
              <input
                type="text"
                required
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="Mehmed Demir"
                className="w-full px-3 py-2 bg-white border border-[#E6E1DA] rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4A4642] uppercase mb-1">Telefon raqami</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+90 212 555 1234"
                className="w-full px-3 py-2 bg-white border border-[#E6E1DA] rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4A4642] uppercase mb-1">Rasmiy email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sales@istanbultextile.com"
                className="w-full px-3 py-2 bg-white border border-[#E6E1DA] rounded-lg text-sm"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-[#4A4642] uppercase mb-1">Fabrika manzili</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="88 Merter Textile Zone, Istanbul, Turkey"
                className="w-full px-3 py-2 bg-white border border-[#E6E1DA] rounded-lg text-sm"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-[#4A4642] uppercase mb-1">SLA izohlari va quvvat ma'lumotlari</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add details regarding logistics, turnaround periods, cotton metrics..."
                className="w-full px-3 py-2 bg-white border border-[#E6E1DA] rounded-lg text-sm"
              />
            </div>

            <div className="md:col-span-3 pt-3 flex justify-end gap-2 border-t border-[#FAF9F5]">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-[#E6E1DA] hover:bg-[#FAF9F5] text-xs font-semibold rounded-lg text-[#7A7570]"
              >
                Yopish Drawer
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#1E1B18] hover:bg-[#2D2A26] text-white text-xs font-semibold rounded-lg"
              >
                Yetkazuvchini saqlash
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search Input */}
      <div className="bg-white p-4 rounded-xl border border-[#FAF9F5] shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#A29E99]">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Kompaniya yoki vakil bo'yicha qidirish..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#FAF9F5] border border-[#E6E1DA] rounded-lg text-xs"
          />
        </div>
      </div>

      {/* Grid displays */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredSuppliers.length === 0 ? (
          <div className="md:col-span-3 bg-white p-12 rounded-xl text-center border text-[#7A7570] font-light text-sm">
            Qidiruvga mos yetkazuvchi topilmadi.
          </div>
        ) : (
          filteredSuppliers.map(s => (
            <div key={s.id} className="bg-white rounded-xl border border-[#E6E1DA] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.01)] flex flex-col justify-between hover:border-[#C5A059] transition-all">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-display font-semibold text-lg text-[#1E1B18]">{s.companyName}</h3>
                    <p className="text-xs text-[#C5A059] font-medium mt-0.5">Vakil: {s.contactPerson}</p>
                  </div>
                  
                  {isEditor && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleEditClick(s)}
                        className="p-1.5 text-[#7A7570] hover:text-[#C5A059] hover:bg-[#FAF9F5] rounded transition-all"
                        title="Tahrirlash"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="p-1.5 text-[#7A7570] hover:text-red-500 hover:bg-red-50 rounded transition-all"
                        title="Deregister contract"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-2 border-t border-[#FAF9F5] pt-3 text-xs text-[#4A4642] font-light">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-[#C5A059] shrink-0" />
                    <span>{s.phone || "Telefon kiritilmagan"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-[#C5A059] shrink-0" />
                    <span className="truncate">{s.email || "Email kiritilmagan"}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#C5A059] shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{s.address || "Manzil kiritilmagan"}</span>
                  </div>
                </div>
              </div>

              {s.notes && (
                <div className="mt-4 pt-3 border-t border-[#FCFAF7] bg-[#FCFAF7] p-2.5 rounded-lg text-[11px] text-[#7A7570] flex items-start gap-1.5">
                  <Notebook className="w-3.5 h-3.5 text-[#C5A059] shrink-0 mt-0.5" />
                  <p className="leading-normal">{s.notes}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
