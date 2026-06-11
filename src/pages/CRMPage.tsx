import { useState, useEffect, type FormEvent } from "react";
import { api } from "../api";
import { Customer, Lead, Deal, Task, User } from "../types";
import { 
  Users, 
  Target, 
  Briefcase, 
  CheckSquare, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  UserMinus, 
  Sparkles, 
  Calendar, 
  Lock, 
  AlertCircle, 
  Check 
} from "lucide-react";

type CRMTabs = "CUSTOMERS" | "LEADS" | "DEALS" | "TASKS";

export function CRMPage() {
  const [activeTab, setActiveTab] = useState<CRMTabs>("CUSTOMERS");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);

  // DB States
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  // Search filter
  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Forms Visibility & data
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Unified Form Field values
  const [custName, setCustName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [custType, setCustType] = useState<"RETAIL" | "WHOLESALE" | "PARTNER">("WHOLESALE");
  const [notes, setNotes] = useState("");

  // Lead fields
  const [leadSource, setLeadSource] = useState("");
  const [leadInterest, setLeadInterest] = useState("");
  const [leadStatus, setLeadStatus] = useState<any>("NEW");

  // Deal fields
  const [dealTitle, setDealTitle] = useState("");
  const [dealCustomerId, setDealCustomerId] = useState("");
  const [dealValue, setDealValue] = useState("");
  const [dealStage, setDealStage] = useState<any>("PROSPECTING");
  const [dealCloseDate, setDealCloseDate] = useState("");
  const [dealProb, setDealProb] = useState("20");

  // Task fields
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [taskPriority, setTaskPriority] = useState<any>("MEDIUM");
  const [taskStatus, setTaskStatus] = useState<any>("PENDING");
  const [taskLeadId, setTaskLeadId] = useState("");
  const [taskDealId, setTaskDealId] = useState("");

  useEffect(() => {
    setCurrentUser(api.auth.getCurrentUser());
    loadBarchasiCRM();
  }, [activeTab]);

  async function loadBarchasiCRM() {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === "CUSTOMERS") {
        const data = await api.customers.getAll();
        setCustomers(data);
      } else if (activeTab === "LEADS") {
        const data = await api.leads.getAll();
        setLeads(data);
      } else if (activeTab === "DEALS") {
        const [dData, cData] = await Promise.all([api.deals.getAll(), api.customers.getAll()]);
        setDeals(dData);
        setCustomers(cData);
        if (cData.length > 0) setDealCustomerId(cData[0].id);
      } else if (activeTab === "TASKS") {
        const [tData, lData, dData] = await Promise.all([
          api.tasks.getAll(),
          api.leads.getAll(),
          api.deals.getAll()
        ]);
        setTasks(tData);
        setLeads(lData);
        setDeals(dData);
      }

      // Load users list for assigned dropdowns if user is admin/manager
      const myUser = api.auth.getCurrentUser();
      if (myUser && (myUser.role === "ADMIN" || myUser.role === "MANAGER")) {
        try {
          const ulist = await api.auth.getUsers();
          setUsers(ulist);
        } catch {
          // Fallback if not admin role
        }
      }
    } catch (err: any) {
      setError(err.message || "CRM ma'lumotlarini yuklab bo'lmadi.");
    } finally {
      setLoading(false);
    }
  }

  // Permission logic: Admin, Manager, and SALES roles possess CRM modify privileges
  const isEditor = currentUser && ["ADMIN", "MANAGER", "SALES"].includes(currentUser.role);

  const triggerSuccessMsg = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => {
      setSuccess(null);
    }, 4500);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditId(null);
    setCustName("");
    setPhone("");
    setEmail("");
    setAddress("");
    setCustType("WHOLESALE");
    setNotes("");

    setLeadSource("");
    setLeadInterest("");
    setLeadStatus("NEW");

    setDealTitle("");
    setDealCustomerId("");
    setDealValue("");
    setDealStage("PROSPECTING");
    setDealCloseDate("");
    setDealProb("20");

    setTaskTitle("");
    setTaskDesc("");
    setTaskDueDate("");
    setTaskPriority("MEDIUM");
    setTaskStatus("PENDING");
    setTaskLeadId("");
    setTaskDealId("");
  };

  const handleEditInit = (item: any) => {
    setEditId(item.id);
    setIsFormOpen(true);
    if (activeTab === "CUSTOMERS") {
      setCustName(item.name);
      setPhone(item.phone || "");
      setEmail(item.email || "");
      setAddress(item.address || "");
      setCustType(item.type);
      setNotes(item.notes || "");
    } else if (activeTab === "LEADS") {
      setCustName(item.name);
      setPhone(item.phone || "");
      setEmail(item.email || "");
      setLeadSource(item.source || "");
      setLeadInterest(item.interest || "");
      setLeadStatus(item.status);
      setNotes(item.notes || "");
    } else if (activeTab === "DEALS") {
      setDealTitle(item.title);
      setDealCustomerId(item.customerId);
      setDealValue(String(item.value));
      setDealStage(item.stage);
      setDealCloseDate(item.expectedCloseDate ? item.expectedCloseDate.split("T")[0] : "");
      setDealProb(String(item.probability));
    } else if (activeTab === "TASKS") {
      setTaskTitle(item.title);
      setTaskDesc(item.description || "");
      setTaskDueDate(item.dueDate ? item.dueDate.split("T")[0] : "");
      setTaskPriority(item.priority);
      setTaskStatus(item.status);
      setTaskLeadId(item.leadId || "");
      setTaskDealId(item.dealId || "");
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isEditor) return;
    setError(null);

    try {
      if (activeTab === "CUSTOMERS") {
        const payload = { name: custName, phone, email, address, type: custType, notes };
        if (editId) {
          await api.customers.update(editId, payload);
          triggerSuccessMsg("Mijoz ma'lumotlari muvaffaqiyatli yangilandi.");
        } else {
          await api.customers.create(payload);
          triggerSuccessMsg("Yangi ulgurji mijoz ro'yxatga olindi.");
        }
      } else if (activeTab === "LEADS") {
        const payload = { name: custName, phone, email, source: leadSource, interest: leadInterest, status: leadStatus, notes };
        if (editId) {
          await api.leads.update(editId, payload);
          triggerSuccessMsg("Lid ma'lumotlari yangilandi.");
        } else {
          await api.leads.create(payload);
          triggerSuccessMsg("Yangi CRM lidi qo'shildi.");
        }
      } else if (activeTab === "DEALS") {
        const payload = { title: dealTitle, customerId: dealCustomerId, value: Number(dealValue), stage: dealStage, expectedCloseDate: dealCloseDate, probability: Number(dealProb) };
        if (editId) {
          await api.deals.update(editId, payload);
          triggerSuccessMsg("Kelishuv holati yangilandi.");
        } else {
          await api.deals.create(payload);
          triggerSuccessMsg("Yangi kelishuv yaratildi.");
        }
      } else if (activeTab === "TASKS") {
        const payload = { 
          title: taskTitle, 
          description: taskDesc, 
          dueDate: taskDueDate || null, 
          priority: taskPriority, 
          status: taskStatus, 
          leadId: taskLeadId || null, 
          dealId: taskDealId || null 
        };
        if (editId) {
          await api.tasks.update(editId, payload);
          triggerSuccessMsg("Kuzatuv vazifasi yangilandi.");
        } else {
          await api.tasks.create(payload);
          triggerSuccessMsg("Vazifa muvaffaqiyatli biriktirildi.");
        }
      }
      closeForm();
      loadBarchasiCRM();
    } catch (err: any) {
      setError(err.message || "CRM o'zgarishini saqlab bo'lmadi.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!isEditor) return;
    if (!confirm("Bu CRM yozuvini o'chirishni tasdiqlaysizmi? Bu amalni qaytarib bo'lmaydi.")) return;

    setError(null);
    try {
      if (activeTab === "CUSTOMERS") await api.customers.delete(id);
      else if (activeTab === "LEADS") await api.leads.delete(id);
      else if (activeTab === "DEALS") await api.deals.delete(id);
      else if (activeTab === "TASKS") await api.tasks.delete(id);

      triggerSuccessMsg("CRM yozuvi o'chirildi.");
      loadBarchasiCRM();
    } catch (err: any) {
      setError(err.message || "O'chirish amalga oshmadi.");
    }
  };

  // Automated Conversion Trigger
  const handleLeadConversion = async (lead: Lead) => {
    if (!isEditor) return;
    if (!confirm(`${lead.name} lidini rasmiy ulgurji mijozga aylantirishni tasdiqlaysizmi?`)) return;

    setError(null);
    try {
      await api.leads.update(lead.id, {
        status: "CONVERTED"
      });
      triggerSuccessMsg("Lid mijozga aylantirildi.");
      loadBarchasiCRM();
    } catch (err: any) {
      setError(err.message || "Konvertatsiya amalga oshmadi.");
    }
  };

  // Toggle state helper
  const handleTaskCheck = async (task: Task) => {
    if (!isEditor) return;
    const newHolat = task.status === "COMPLETED" ? "PENDING" : "COMPLETED";
    try {
      await api.tasks.update(task.id, { status: newHolat });
      loadBarchasiCRM();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Grid filter strings
  const searchMatch = (val: string) => val.toLowerCase().includes(searchTerm.toLowerCase());

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-semibold tracking-tight text-[#1E1B18]">
            Korporativ CRM markazi
          </h1>
          <p className="text-sm text-[#7A7570]">
            Lidlar, mijozlar, kelishuvlar va vazifalarni boshqaring.
          </p>
        </div>

        {isEditor && (
          <button
            onClick={() => {
              closeForm();
              setIsFormOpen(true);
            }}
            className="flex items-center space-x-2 bg-[#1E1B18] text-white hover:bg-[#2F2925] text-sm font-semibold px-4 py-2 rounded-lg transition-all shadow-sm shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>
              {activeTab === "CUSTOMERS" && "Mijoz qo'shish"}
              {activeTab === "LEADS" && "Lid qo'shish"}
              {activeTab === "DEALS" && "Kelishuv ochish"}
              {activeTab === "TASKS" && "Vazifa rejalash"}
            </span>
          </button>
        )}
      </div>

      {/* Tab navigation headers */}
      <div className="flex border-b border-[#E6E1DA] space-x-2 bg-white px-4 py-2.5 rounded-xl border">
        <button
          onClick={() => { setSearchTerm(""); setActiveTab("CUSTOMERS"); }}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "CUSTOMERS" ? "bg-[#1E1B18] text-white" : "text-[#7A7570] hover:bg-[#FAF9F5]"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Faol mijozlar</span>
        </button>
        <button
          onClick={() => { setSearchTerm(""); setActiveTab("LEADS"); }}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "LEADS" ? "bg-[#1E1B18] text-white" : "text-[#7A7570] hover:bg-[#FAF9F5]"
          }`}
        >
          <Target className="w-4 h-4" />
          <span>Lidlar voronkasi</span>
        </button>
        <button
          onClick={() => { setSearchTerm(""); setActiveTab("DEALS"); }}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "DEALS" ? "bg-[#1E1B18] text-white" : "text-[#7A7570] hover:bg-[#FAF9F5]"
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Kelishuvlar</span>
        </button>
        <button
          onClick={() => { setSearchTerm(""); setActiveTab("TASKS"); }}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "TASKS" ? "bg-[#1E1B18] text-white" : "text-[#7A7570] hover:bg-[#FAF9F5]"
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>Kuzatuv vazifalari</span>
        </button>
      </div>

      {success && (
        <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-md flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <p className="text-xs font-medium text-emerald-800">{success}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md">
          <p className="text-xs text-red-700 font-semibold">{error}</p>
        </div>
      )}

      {!isEditor && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-3.5 rounded-r-lg flex items-center gap-2">
          <Lock className="w-4 h-4 text-amber-600" />
          <p className="text-xs text-amber-800 font-medium">
            Read-Only Clearance: Role <strong>{currentUser?.role}</strong> cannot update lead metrics or register followups.
          </p>
        </div>
      )}

      {/* Slider form layout */}
      {isFormOpen && (
        <div className="bg-white p-6 rounded-xl border border-[#E6E1DA] shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-[#FAF9F5]">
            <h3 className="text-md font-bold font-display text-[#1E1B18]">
              {editId ? "Mavjud ma'lumotni tahrirlash" : "CRM ma'lumotini yaratish"}
            </h3>
            <button onClick={closeForm} className="text-xs text-[#7A7570] hover:text-[#1E1B18]">
              Bekor qilish ×
            </button>
          </div>

          <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs" onSubmit={handleSubmit}>
            {/* 1. CUSTOMERS / LEADS CORE SHARED FORM */}
            {(activeTab === "CUSTOMERS" || activeTab === "LEADS") && (
              <>
                <div>
                  <label className="block text-[11px] font-semibold text-[#4A4642] uppercase mb-1">Kompaniya / shaxs nomi</label>
                  <input
                    type="text"
                    required
                    value={custName}
                    onChange={(e) => setCustName(e.target.value)}
                    placeholder="Tashkent Denim Center"
                    className="w-full px-3 py-2 bg-white border border-[#E6E1DA] rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#4A4642] uppercase mb-1">Telefon</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+998 90 123 4567"
                    className="w-full px-3 py-2 bg-white border border-[#E6E1DA] rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#4A4642] uppercase mb-1">Korporativ email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="client@mail.com"
                    className="w-full px-3 py-2 bg-white border border-[#E6E1DA] rounded-lg text-xs"
                  />
                </div>
              </>
            )}

            {activeTab === "CUSTOMERS" && (
              <>
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-semibold text-[#4A4642] uppercase mb-1">Hisob-kitob manzili</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Chorsu Market, Tashkent"
                    className="w-full px-3 py-2 bg-white border border-[#E6E1DA] rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#4A4642] uppercase mb-1">Mijoz turi</label>
                  <select
                    value={custType}
                    onChange={(e: any) => setCustType(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#E6E1DA] rounded-lg text-xs"
                  >
                    <option value="RETAIL">Chakana xaridor</option>
                    <option value="WHOLESALE">Ulgurji distributer</option>
                    <option value="PARTNER">Hududiy hamkor</option>
                  </select>
                </div>
              </>
            )}

            {/* 2. LEADS TABS EXCLUSIVE DETAILS */}
            {activeTab === "LEADS" && (
              <>
                <div>
                  <label className="block text-[11px] font-semibold text-[#4A4642] uppercase mb-1">Lid manbasi</label>
                  <input
                    type="text"
                    value={leadSource}
                    onChange={(e) => setLeadSource(e.target.value)}
                    placeholder="Website, referral, marketing ads..."
                    className="w-full px-3 py-1.5 bg-white border border-[#E6E1DA] rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#4A4642] uppercase mb-1">Qiziqish yo'nalishi</label>
                  <input
                    type="text"
                    value={leadInterest}
                    onChange={(e) => setLeadInterest(e.target.value)}
                    placeholder="Silk dresses, leather coats sizing..."
                    className="w-full px-3 py-1.5 bg-white border border-[#E6E1DA] rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#4A4642] uppercase mb-1">Lid holati</label>
                  <select
                    value={leadStatus}
                    onChange={(e) => setLeadStatus(e.target.value as any)}
                    className="w-full px-3 py-1.5 bg-white border border-[#E6E1DA] rounded-lg text-xs"
                  >
                    <option value="NEW">New Capture</option>
                    <option value="CONTACTED">SLA Contacted</option>
                    <option value="QUALIFIED">Qualified lead</option>
                    <option value="CONVERTED">Mijozga aylantirilgan</option>
                    <option value="LOST">Lost thread</option>
                  </select>
                </div>
              </>
            )}

            {/* 3. DEALS TAB EXCLUSIVE ENTITIES */}
            {activeTab === "DEALS" && (
              <>
                <div>
                  <label className="block text-[11px] font-semibold text-[#4A4642] uppercase mb-1">Kelishuv nomi</label>
                  <input
                    type="text"
                    required
                    value={dealTitle}
                    onChange={(e) => setDealTitle(e.target.value)}
                    placeholder="Autumn outerwear bulk agreement..."
                    className="w-full px-3 py-2 bg-white border border-[#E6E1DA] rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#4A4642] uppercase mb-1">Mijoz profilini tanlang</label>
                  <select
                    value={dealCustomerId}
                    onChange={(e) => setDealCustomerId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#E6E1DA] rounded-lg text-xs"
                  >
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#4A4642] uppercase mb-1">Estimated Contract Value ($)</label>
                  <input
                    type="number"
                    required
                    value={dealValue}
                    onChange={(e) => setDealValue(e.target.value)}
                    placeholder="15000"
                    className="w-full px-3 py-2 bg-white border border-[#E6E1DA] rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#4A4642] uppercase mb-1">Kelishuv bosqichi</label>
                  <select
                    value={dealStage}
                    onChange={(e) => setDealStage(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-[#E6E1DA] rounded-lg text-xs"
                  >
                    <option value="PROSPECTING">Prospecting (20%)</option>
                    <option value="NEGOTIATION">Active Negotiation (60%)</option>
                    <option value="WON">Contract WON (100%)</option>
                    <option value="LOST">Pipeline LOST (0%)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#4A4642] uppercase mb-1">Anticipated Closing Date</label>
                  <input
                    type="date"
                    value={dealCloseDate}
                    onChange={(e) => setDealCloseDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#E6E1DA] rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#4A4642] uppercase mb-1">Success Ehtimollik (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={dealProb}
                    onChange={(e) => setDealProb(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#E6E1DA] rounded-lg text-xs"
                  />
                </div>
              </>
            )}

            {/* 4. TASKS & CALENDAR EVENTS */}
            {activeTab === "TASKS" && (
              <>
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-semibold text-[#4A4642] uppercase mb-1">Vazifa nomi</label>
                  <input
                    type="text"
                    required
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder="E.g., Call Samarkand boutique buyer regarding silk clothing"
                    className="w-full px-3 py-2 bg-white border border-[#E6E1DA] rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#4A4642] uppercase mb-1">Calendar Deadline Duel</label>
                  <input
                    type="date"
                    required
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#E6E1DA] rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#4A4642] uppercase mb-1">Vazifa muhimligi</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-[#E6E1DA] rounded-lg text-xs"
                  >
                    <option value="LOW">Low priority</option>
                    <option value="MEDIUM">Medium backup</option>
                    <option value="HIGH">High Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#4A4642] uppercase mb-1">Jarayon holati</label>
                  <select
                    value={taskStatus}
                    onChange={(e) => setTaskStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-[#E6E1DA] rounded-lg text-xs"
                  >
                    <option value="PENDING">Pending Action</option>
                    <option value="IN_PROGRESS">Active Work</option>
                    <option value="COMPLETED">Passed Quality Confirm</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#4A4642] uppercase mb-1">Bog'langan lid (ixtiyoriy)</label>
                  <select
                    value={taskLeadId}
                    onChange={(e) => setTaskLeadId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#E6E1DA] rounded-lg text-xs"
                  >
                    <option value="">-- Lid biriktirilmagan --</option>
                    {leads.map(l => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-3">
                  <label className="block text-[11px] font-semibold text-[#4A4642] uppercase mb-1">Vazifa tavsifi</label>
                  <textarea
                    rows={2}
                    value={taskDesc}
                    onChange={(e) => setTaskDesc(e.target.value)}
                    placeholder="Draft steps to complete this follow-up..."
                    className="w-full px-3 py-2 bg-white border border-[#E6E1DA] rounded-lg text-xs"
                  />
                </div>
              </>
            )}

            {/* SHARED DESCRIPTION NOTES FOR CUSTOMER/LEADS */}
            {(activeTab === "CUSTOMERS" || activeTab === "LEADS") && (
              <div className="md:col-span-3">
                <label className="block text-[11px] font-semibold text-[#4A4642] uppercase mb-1">SLA Contract / Account Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Insert notes regarding budget constraints or specific requirements..."
                  className="w-full px-3 py-2 bg-white border border-[#E6E1DA] rounded-lg text-xs"
                />
              </div>
            )}

            <div className="md:col-span-3 pt-3 flex justify-end gap-2 border-t border-[#FAF9F5]">
              <button
                type="button"
                onClick={closeForm}
                className="px-4 py-2 border border-[#E6E1DA] hover:bg-[#FAF9F5] font-semibold rounded-lg text-[#7A7570]"
              >
                Yopish Drawer
              </button>
              <button
                type="submit"
                disabled={!isEditor}
                className="px-4 py-2 bg-[#1E1B18] hover:bg-[#2F2925] text-white font-semibold rounded-lg"
              >
                Saqlash
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SEARCH CONSOLE */}
      <div className="bg-white p-4 rounded-xl border border-[#FAF9F5] shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#A29E99]">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder={
              activeTab === "CUSTOMERS" ? "Mijoz nomi yoki email bo'yicha qidirish..." :
              activeTab === "LEADS" ? "Lid nomi yoki mahsulot bo'yicha qidirish..." :
              activeTab === "DEALS" ? "Kelishuv nomi bo'yicha qidirish..." : "Vazifalar bo'yicha qidirish..."
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#FAF9F5] border border-[#E6E1DA] rounded-lg text-xs"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C5A059]" />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#FAF9F5] shadow-sm overflow-hidden">
          {/* 1. CUSTOMERS SUB-TAB TABLE */}
          {activeTab === "CUSTOMERS" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#FAF9F5] text-[#7A7570] border-b border-[#E6E1DA]">
                    <th className="p-4 uppercase font-semibold">Mijoz nomi</th>
                    <th className="p-4 uppercase font-semibold">Turi</th>
                    <th className="p-4 uppercase font-semibold">Korporativ email / Direct Mobile Number</th>
                    <th className="p-4 uppercase font-semibold">Manzil</th>
                    <th className="p-4 uppercase font-semibold">Izohlar</th>
                    <th className="p-4 uppercase font-semibold text-right">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#FAF9F5]">
                  {customers.filter(c => searchMatch(c.name) || searchMatch(c.email || "")).length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-[#7A7570] font-light">
                        Qidiruvga mos mijoz topilmadi.
                      </td>
                    </tr>
                  ) : (
                    customers.filter(c => searchMatch(c.name) || searchMatch(c.email || "")).map(c => (
                      <tr key={c.id} className="hover:bg-[#FCFAFB] transition-colors">
                        <td className="p-4 font-bold text-[#1E1B18]">{c.name}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            c.type === "PARTNER" ? "bg-purple-50 text-purple-700" :
                            c.type === "WHOLESALE" ? "bg-blue-50 text-blue-700" : "bg-emerald-50 text-emerald-700"
                          }`}>{c.type}</span>
                        </td>
                        <td className="p-4">
                          <span className="block text-[#1E1B18]">{c.email || "—"}</span>
                          <span className="block text-[#7A7570] text-[10px] font-mono">{c.phone || "—"}</span>
                        </td>
                        <td className="p-4 text-[#7A7570] font-light">{c.address || "—"}</td>
                        <td className="p-4 text-[#7A7570] italic font-light truncate max-w-[150px]">{c.notes || "—"}</td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-1.5">
                            <button onClick={() => handleEditInit(c)} disabled={!isEditor} className="p-1.5 text-[#7A7570] hover:text-[#C5A059] border border-[#E6E1DA] rounded hover:border-[#C5A059] transition-all"><Edit2 className="w-3.5 h-3.5" /></button>
                            <button onClick={() => handleDelete(c.id)} disabled={!isEditor} className="p-1.5 text-[#7A7570] hover:text-red-500 border border-[#E6E1DA] rounded hover:border-red-500 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* 2. LEADS PIPELINE SUB-TAB TABLE */}
          {activeTab === "LEADS" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#FAF9F5] text-[#7A7570] border-b border-[#E6E1DA]">
                    <th className="p-4 uppercase font-semibold">Lid nomi</th>
                    <th className="p-4 uppercase font-semibold">Holat</th>
                    <th className="p-4 uppercase font-semibold">Manba</th>
                    <th className="p-4 uppercase font-semibold">Qiziqish</th>
                    <th className="p-4 uppercase font-semibold">Email / telefon</th>
                    <th className="p-4 uppercase font-semibold text-center">Mijozga aylantirish</th>
                    <th className="p-4 uppercase font-semibold text-right">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#FAF9F5]">
                  {leads.filter(l => searchMatch(l.name) || searchMatch(l.interest || "")).length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-[#7A7570] font-light">
                        Lidlar topilmadi.
                      </td>
                    </tr>
                  ) : (
                    leads.filter(l => searchMatch(l.name) || searchMatch(l.interest || "")).map(l => (
                      <tr key={l.id} className="hover:bg-[#FCFAFB] transition-colors bg-white">
                        <td className="p-4">
                          <span className="font-bold text-[#1E1B18] block">{l.name}</span>
                          <span className="text-[10px] text-[#7A7570] block">{l.notes}</span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            l.status === "CONVERTED" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" :
                            l.status === "QUALIFIED" ? "bg-blue-50 text-blue-800 border border-blue-200" :
                            l.status === "CONTACTED" ? "bg-yellow-50 text-yellow-800 border border-yellow-200" : "bg-gray-100 text-gray-800"
                          }`}>{l.status}</span>
                        </td>
                        <td className="p-4 text-[#7A7570] font-light">{l.source || "Website"}</td>
                        <td className="p-4 font-semibold text-[#1E1B18]">{l.interest || "Unspecified"}</td>
                        <td className="p-4">
                          <span className="block text-[#1E1B18]">{l.email || "—"}</span>
                          <span className="block text-[#7A7570] text-[10px] font-mono">{l.phone || "—"}</span>
                        </td>
                        <td className="p-4 text-center">
                          {l.status !== "CONVERTED" ? (
                            <button
                              onClick={() => handleLeadConversion(l)}
                              disabled={!isEditor}
                              className="px-2.5 py-1 bg-[#FAF9F5] border border-[#C5A059] hover:bg-[#C5A059] text-[#C5A059] hover:text-white transition-all text-[10px] font-bold rounded-lg uppercase flex items-center justify-center mx-auto space-x-1"
                            >
                              <UserMinus className="w-3.5 h-3.5 shrink-0" />
                              <span>Mijozga aylantirish</span>
                            </button>
                          ) : (
                            <span className="text-emerald-600 font-bold block text-center text-[10px] uppercase">Ro'yxatga olingan ✓</span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-1.5 align-middle mt-2">
                            <button onClick={() => handleEditInit(l)} disabled={!isEditor} className="p-1.5 text-[#7A7570] hover:text-[#C5A059] border border-[#E6E1DA] rounded hover:border-[#C5A059] transition-all"><Edit2 className="w-3.5 h-3.5" /></button>
                            <button onClick={() => handleDelete(l.id)} disabled={!isEditor} className="p-1.5 text-[#7A7570] hover:text-red-500 border border-[#E6E1DA] rounded hover:border-red-500 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* 3. DEALS HUB TABLE */}
          {activeTab === "DEALS" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#FAF9F5] text-[#7A7570] border-b border-[#E6E1DA]">
                    <th className="p-4 uppercase font-semibold">Kelishuv maqsadi</th>
                    <th className="p-4 uppercase font-semibold">Mijoz kompaniya</th>
                    <th className="p-4 uppercase font-semibold">Qiymat</th>
                    <th className="p-4 uppercase font-semibold font-mono">Bosqich</th>
                    <th className="p-4 uppercase font-semibold">Yopilish sanasi</th>
                    <th className="p-4 uppercase font-semibold text-center">Ehtimollik</th>
                    <th className="p-4 uppercase font-semibold text-right">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#FAF9F5]">
                  {deals.filter(d => searchMatch(d.title)).length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-[#7A7570] font-light">
                        Mos kelishuvlar topilmadi.
                      </td>
                    </tr>
                  ) : (
                    deals.filter(d => searchMatch(d.title)).map(d => (
                      <tr key={d.id} className="hover:bg-[#FCFAFB] transition-colors">
                        <td className="p-4 font-bold text-[#1E1B18]">{d.title}</td>
                        <td className="p-4 text-[#4A4642]">{d.customer?.name || "Client"}</td>
                        <td className="p-4 font-bold text-[#1E1B18]">${d.value.toLocaleString()}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            d.stage === "WON" ? "bg-emerald-50 text-emerald-800 border border-emerald-100" :
                            d.stage === "LOST" ? "bg-red-50 text-red-800" : "bg-[#FCFAF7] text-[#C5A059] border border-[#EACCA4]"
                          }`}>{d.stage}</span>
                        </td>
                        <td className="p-4 text-[#7A7570] font-mono">{d.expectedCloseDate ? new Date(d.expectedCloseDate).toLocaleDateString() : '—'}</td>
                        <td className="p-4 text-center">
                          <div className="w-full bg-[#E6E1DA] rounded-full h-1.5 max-w-[80px] mx-auto overflow-hidden">
                            <div className="bg-[#C5A059] h-1.5" style={{ width: `${d.probability}%` }} />
                          </div>
                          <span className="text-[10px] text-[#7A7570] block mt-1 font-mono">{d.probability}% ehtimol</span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-1.5">
                            <button onClick={() => handleEditInit(d)} disabled={!isEditor} className="p-1.5 text-[#7A7570] hover:text-[#C5A059] border border-[#E6E1DA] rounded hover:border-[#C5A059] transition-all"><Edit2 className="w-3.5 h-3.5" /></button>
                            <button onClick={() => handleDelete(d.id)} disabled={!isEditor} className="p-1.5 text-[#7A7570] hover:text-red-500 border border-[#E6E1DA] rounded hover:border-red-500 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* 4. CALENDAR TASKS FOLLOWUPS TABLE */}
          {activeTab === "TASKS" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#FAF9F5] text-[#7A7570] border-b border-[#E6E1DA]">
                    <th className="p-4 uppercase font-semibold text-center w-12">Bajarildi</th>
                    <th className="p-4 uppercase font-semibold">Kuzatuv vazifasi</th>
                    <th className="p-4 uppercase font-semibold">Muhimlik</th>
                    <th className="p-4 uppercase font-semibold">Bog'lanishlar</th>
                    <th className="p-4 uppercase font-semibold">Muddat</th>
                    <th className="p-4 uppercase font-semibold">Holat</th>
                    <th className="p-4 uppercase font-semibold text-right">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#FAF9F5]">
                  {tasks.filter(t => searchMatch(t.title)).length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-[#7A7570] font-light">
                        Kuzatuv vazifalari topilmadi.
                      </td>
                    </tr>
                  ) : (
                    tasks.filter(t => searchMatch(t.title)).map(t => {
                      const isKechikkan = t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "COMPLETED";
                      const checked = t.status === "COMPLETED";
                      return (
                        <tr key={t.id} className={`hover:bg-[#FCFAFB] transition-colors ${checked ? "bg-opacity-50 line-through text-gray-400 bg-[#FCFBF9]" : ""}`}>
                          <td className="p-4 text-center">
                            <button
                              type="button"
                              onClick={() => handleTaskCheck(t)}
                              disabled={!isEditor}
                              className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                                checked ? "bg-emerald-600 border-emerald-600 text-white" : "border-[#E6E1DA] hover:border-[#C5A059] bg-white"
                              }`}
                            >
                              {checked && <Check className="w-3.5 h-3.5" />}
                            </button>
                          </td>
                          <td className="p-4">
                            <p className={`font-semibold ${checked ? "text-gray-400" : "text-[#1E1B18]"}`}>{t.title}</p>
                            <span className="text-[10px] text-[#7A7570] font-light block italic">{t.description || "— Tavsif kiritilmagan —"}</span>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                              t.priority === "HIGH" ? "bg-red-50 text-red-700" :
                              t.priority === "MEDIUM" ? "bg-yellow-50 text-yellow-700" : "bg-gray-100 text-gray-700"
                            }`}>{t.priority}</span>
                          </td>
                          <td className="p-4 text-[#7A7570]">
                            {t.lead && <span className="block text-[10px]">Lid: <strong>{t.lead.name}</strong></span>}
                            {t.deal && <span className="block text-[10px]">Kelishuv: <strong>{t.deal.title}</strong></span>}
                            {!t.lead && !t.deal && "Umumiy ish"}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-3.5 h-3.5 text-[#C5A059]" />
                              <span className={`font-mono text-[11px] ${isKechikkan ? "text-red-600 font-bold" : "text-[#7A7570]"}`}>
                                {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "Muddatsiz"}
                              </span>
                              {isKechikkan && (
                                <span className="bg-red-100 text-red-700 text-[9px] font-extrabold px-1 rounded flex items-center gap-0.5">
                                  <AlertCircle className="w-2.5 h-2.5 shrink-0" />
                                  Kechikkan
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-4 text-[#7A7570] font-bold">{t.status}</td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end gap-1.5">
                              <button onClick={() => handleEditInit(t)} disabled={!isEditor} className="p-1.5 text-[#7A7570] hover:text-[#C5A059] border border-[#E6E1DA] rounded hover:border-[#C5A059] transition-all"><Edit2 className="w-3.5 h-3.5" /></button>
                              <button onClick={() => handleDelete(t.id)} disabled={!isEditor} className="p-1.5 text-[#7A7570] hover:text-red-500 border border-[#E6E1DA] rounded hover:border-red-500 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
