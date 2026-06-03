"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n";
import { toast } from "@/components/ui/Toast";
import { Loader } from "@/components/ui/Loader";
import { Modal } from "@/components/ui/Modal";
import { AnimatedSection } from "@/components/home/AnimatedSection";
import { formatDate } from "@/lib/utils";
import { TIME_SLOTS } from "@/types";
import {
  Users, CalendarDays, BarChart3, Plus, Trash2, Edit2, Save,
  X, Lock, ShieldBan, UserX,
} from "lucide-react";

interface Client {
  id: string;
  fullName: string;
  email: string;
  trainingType: string;
  remainingSessions: number;
}

interface ReservationAdmin {
  id: string;
  userId: string;
  date: string;
  timeSlot: string;
  trainingType: string;
  status: string;
  clientName: string | null;
  clientEmail: string | null;
}

interface BlockedSlotData {
  id: string;
  date: string;
  timeSlot: string | null;
}

interface Stats {
  totalClients: number;
  todayReservations: number;
  weekReservations: number;
}

type Tab = "dashboard" | "clients" | "reservations" | "blocked";

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const { t, locale } = useI18n();
  const router = useRouter();

  const [tab, setTab] = useState<Tab>("dashboard");
  const [stats, setStats] = useState<Stats>({ totalClients: 0, todayReservations: 0, weekReservations: 0 });
  const [clients, setClients] = useState<Client[]>([]);
  const [adminReservations, setAdminReservations] = useState<ReservationAdmin[]>([]);
  const [blocked, setBlocked] = useState<BlockedSlotData[]>([]);
  const [loading, setLoading] = useState(true);

  // Add client modal
  const [showAddClient, setShowAddClient] = useState(false);
  const [newClient, setNewClient] = useState({ fullName: "", email: "", password: "", trainingType: "group" });
  const [addingClient, setAddingClient] = useState(false);

  // Edit client
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editForm, setEditForm] = useState({ trainingType: "", remainingSessions: 0 });

  // Reset password
  const [resetPwClient, setResetPwClient] = useState<Client | null>(null);
  const [newPassword, setNewPassword] = useState("");

  // Block slot
  const [blockDate, setBlockDate] = useState("");
  const [blockTime, setBlockTime] = useState("");
  const [blockWholeDay, setBlockWholeDay] = useState(false);

  // Reservation filter
  const [filterDate, setFilterDate] = useState("");

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const loadStats = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/stats");
      if (res.ok) setStats(await res.json());
    } catch { /* empty */ }
  }, []);

  const loadClients = useCallback(async () => {
    try {
      const res = await fetch("/api/clients");
      if (res.ok) {
        const data = await res.json();
        setClients(data.clients);
      }
    } catch { /* empty */ }
  }, []);

  const loadReservations = useCallback(async () => {
    try {
      const url = filterDate ? `/api/reservations?date=${filterDate}` : "/api/reservations";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setAdminReservations(data.reservations);
      }
    } catch { /* empty */ }
  }, [filterDate]);

  const loadBlocked = useCallback(async () => {
    try {
      const res = await fetch("/api/blocked-slots");
      if (res.ok) {
        const data = await res.json();
        setBlocked(data.blockedSlots);
      }
    } catch { /* empty */ }
  }, []);

  useEffect(() => {
    if (user?.role === "admin") {
      Promise.all([loadStats(), loadClients(), loadReservations(), loadBlocked()]).then(() =>
        setLoading(false)
      );
    }
  }, [user, loadStats, loadClients, loadReservations, loadBlocked]);

  // Re-load reservations when filter changes
  useEffect(() => {
    if (user?.role === "admin") loadReservations();
  }, [filterDate, user, loadReservations]);

  const handleAddClient = async () => {
    if (!newClient.fullName || !newClient.email || !newClient.password) return;
    setAddingClient(true);
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newClient),
      });
      if (res.ok) {
        toast(t("admin.addSuccess"), "success");
        setShowAddClient(false);
        setNewClient({ fullName: "", email: "", password: "", trainingType: "group" });
        loadClients();
        loadStats();
      } else {
        const data = await res.json();
        toast(data.error || t("admin.addError"), "error");
      }
    } catch {
      toast(t("admin.addError"), "error");
    }
    setAddingClient(false);
  };

  const handleDeleteClient = async (id: string) => {
    if (!confirm(t("admin.deleteConfirm"))) return;
    try {
      const res = await fetch("/api/clients", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        toast(t("admin.deleteSuccess"), "success");
        loadClients();
        loadStats();
      } else {
        toast(t("admin.deleteError"), "error");
      }
    } catch {
      toast(t("admin.deleteError"), "error");
    }
  };

  const handleUpdateClient = async () => {
    if (!editingClient) return;
    try {
      const res = await fetch("/api/clients", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingClient.id,
          trainingType: editForm.trainingType,
          remainingSessions: editForm.remainingSessions,
        }),
      });
      if (res.ok) {
        toast(t("admin.updateSuccess"), "success");
        setEditingClient(null);
        loadClients();
      } else {
        toast(t("admin.updateError"), "error");
      }
    } catch {
      toast(t("admin.updateError"), "error");
    }
  };

  const handleResetPassword = async () => {
    if (!resetPwClient || !newPassword) return;
    try {
      const res = await fetch("/api/clients", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: resetPwClient.id, newPassword }),
      });
      if (res.ok) {
        toast(t("admin.updateSuccess"), "success");
        setResetPwClient(null);
        setNewPassword("");
      } else {
        toast(t("admin.updateError"), "error");
      }
    } catch {
      toast(t("admin.updateError"), "error");
    }
  };

  const handleCancelReservation = async (reservationId: string) => {
    try {
      const res = await fetch("/api/reservations/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reservationId }),
      });
      if (res.ok) {
        toast(t("admin.updateSuccess"), "success");
        loadReservations();
        loadStats();
      } else {
        toast(t("admin.updateError"), "error");
      }
    } catch {
      toast(t("admin.updateError"), "error");
    }
  };

  const handleBlockSlot = async () => {
    if (!blockDate) return;
    try {
      const res = await fetch("/api/blocked-slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: blockDate,
          timeSlot: blockWholeDay ? null : blockTime || null,
        }),
      });
      if (res.ok) {
        toast(t("admin.blockSuccess"), "success");
        loadBlocked();
        setBlockDate("");
        setBlockTime("");
        setBlockWholeDay(false);
      } else {
        toast(t("admin.blockError"), "error");
      }
    } catch {
      toast(t("admin.blockError"), "error");
    }
  };

  const handleUnblock = async (id: string) => {
    try {
      const res = await fetch("/api/blocked-slots", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        toast(t("admin.unblockSuccess"), "success");
        loadBlocked();
      } else {
        toast(t("admin.unblockError"), "error");
      }
    } catch {
      toast(t("admin.unblockError"), "error");
    }
  };

  const trainingTypeLabel = (type: string) => {
    if (type === "group") return t("admin.group");
    if (type === "duo") return t("admin.duo");
    return t("admin.individual");
  };

  if (authLoading || loading) {
    return <Loader text={t("common.loading")} />;
  }

  if (!user || user.role !== "admin") return null;

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: "dashboard", label: t("admin.dashboard"), icon: BarChart3 },
    { key: "clients", label: t("admin.clients"), icon: Users },
    { key: "reservations", label: t("admin.reservations"), icon: CalendarDays },
    { key: "blocked", label: t("admin.blockedSlots"), icon: ShieldBan },
  ];

  return (
    <div className="py-8 px-4 bg-gradient-to-b from-pink-50 to-white min-h-screen">
      <div className="max-w-7xl mx-auto">
        <AnimatedSection>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">{t("admin.title")}</h1>
        </AnimatedSection>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tb) => {
            const Icon = tb.icon;
            return (
              <button
                key={tb.key}
                onClick={() => setTab(tb.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  tab === tb.key
                    ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md"
                    : "bg-white text-gray-600 border border-pink-200 hover:bg-pink-50"
                }`}
              >
                <Icon size={16} />
                {tb.label}
              </button>
            );
          })}
        </div>

        {/* Dashboard Tab */}
        {tab === "dashboard" && (
          <AnimatedSection>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { label: t("admin.totalClients"), value: stats.totalClients, icon: Users, color: "from-pink-400 to-rose-500" },
                { label: t("admin.todayReservations"), value: stats.todayReservations, icon: CalendarDays, color: "from-rose-400 to-pink-500" },
                { label: t("admin.weekReservations"), value: stats.weekReservations, icon: BarChart3, color: "from-pink-500 to-rose-600" },
              ].map((card, i) => {
                const Icon = card.icon;
                return (
                  <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-pink-100">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                        <Icon size={24} className="text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">{card.label}</p>
                        <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </AnimatedSection>
        )}

        {/* Clients Tab */}
        {tab === "clients" && (
          <AnimatedSection>
            <div className="bg-white rounded-2xl shadow-sm border border-pink-100 overflow-hidden">
              <div className="p-4 border-b border-pink-100 flex items-center justify-between">
                <h2 className="font-semibold text-gray-800">{t("admin.clients")}</h2>
                <button
                  onClick={() => setShowAddClient(true)}
                  className="flex items-center gap-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:shadow-md transition-all"
                >
                  <Plus size={16} />
                  {t("admin.addClient")}
                </button>
              </div>

              {clients.length === 0 ? (
                <p className="text-center text-gray-500 py-12">{t("admin.noClients")}</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-pink-50/50 border-b border-pink-100">
                        <th className="text-left px-4 py-3 font-medium text-gray-600">{t("admin.fullName")}</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">{t("admin.email")}</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">{t("admin.trainingType")}</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">{t("admin.remainingSessions")}</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">{t("admin.actions")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clients.map((c) => (
                        <tr key={c.id} className="border-b border-pink-50 hover:bg-pink-50/30">
                          <td className="px-4 py-3 font-medium">{c.fullName}</td>
                          <td className="px-4 py-3 text-gray-500">{c.email}</td>
                          <td className="px-4 py-3">{trainingTypeLabel(c.trainingType)}</td>
                          <td className="px-4 py-3">{c.remainingSessions}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setEditingClient(c);
                                  setEditForm({ trainingType: c.trainingType, remainingSessions: c.remainingSessions });
                                }}
                                className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors"
                                title={t("admin.edit")}
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => setResetPwClient(c)}
                                className="p-1.5 rounded-lg hover:bg-yellow-50 text-yellow-600 transition-colors"
                                title={t("admin.resetPassword")}
                              >
                                <Lock size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteClient(c.id)}
                                className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                                title={t("admin.delete")}
                              >
                                <UserX size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </AnimatedSection>
        )}

        {/* Reservations Tab */}
        {tab === "reservations" && (
          <AnimatedSection>
            <div className="bg-white rounded-2xl shadow-sm border border-pink-100 overflow-hidden">
              <div className="p-4 border-b border-pink-100 flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-semibold text-gray-800">{t("admin.reservations")}</h2>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="px-3 py-1.5 border border-pink-200 rounded-lg text-sm focus:ring-2 focus:ring-pink-300 outline-none"
                  />
                  {filterDate && (
                    <button
                      onClick={() => setFilterDate("")}
                      className="text-xs text-gray-500 hover:text-pink-500"
                    >
                      {t("admin.all")}
                    </button>
                  )}
                </div>
              </div>

              {adminReservations.length === 0 ? (
                <p className="text-center text-gray-500 py-12">{t("admin.noReservations")}</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-pink-50/50 border-b border-pink-100">
                        <th className="text-left px-4 py-3 font-medium text-gray-600">{t("admin.date")}</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">{t("admin.time")}</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">{t("admin.client")}</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">{t("admin.type")}</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">{t("admin.status")}</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">{t("admin.actions")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminReservations.map((r) => (
                        <tr key={r.id} className="border-b border-pink-50 hover:bg-pink-50/30">
                          <td className="px-4 py-3">{formatDate(r.date, locale)}</td>
                          <td className="px-4 py-3">{r.timeSlot}</td>
                          <td className="px-4 py-3 font-medium">{r.clientName || "-"}</td>
                          <td className="px-4 py-3">{trainingTypeLabel(r.trainingType)}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              r.status === "active" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
                            }`}>
                              {r.status === "active" ? "Active" : "Cancelled"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {r.status === "active" && (
                              <button
                                onClick={() => handleCancelReservation(r.id)}
                                className="flex items-center gap-1 text-red-500 hover:text-red-700 text-xs font-medium"
                              >
                                <X size={14} />
                                {t("admin.cancelReservation")}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </AnimatedSection>
        )}

        {/* Blocked Slots Tab */}
        {tab === "blocked" && (
          <AnimatedSection>
            <div className="space-y-6">
              {/* Block form */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-pink-100">
                <h2 className="font-semibold text-gray-800 mb-4">{t("admin.blockSlot")}</h2>
                <div className="flex flex-wrap gap-3 items-end">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">{t("admin.selectDate")}</label>
                    <input
                      type="date"
                      value={blockDate}
                      onChange={(e) => setBlockDate(e.target.value)}
                      className="px-3 py-2 border border-pink-200 rounded-lg text-sm focus:ring-2 focus:ring-pink-300 outline-none"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm text-gray-600">
                      <input
                        type="checkbox"
                        checked={blockWholeDay}
                        onChange={(e) => setBlockWholeDay(e.target.checked)}
                        className="rounded border-pink-300 text-pink-500 focus:ring-pink-300"
                      />
                      {t("admin.wholeDay")}
                    </label>
                  </div>
                  {!blockWholeDay && (
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">{t("admin.selectTime")}</label>
                      <select
                        value={blockTime}
                        onChange={(e) => setBlockTime(e.target.value)}
                        className="px-3 py-2 border border-pink-200 rounded-lg text-sm focus:ring-2 focus:ring-pink-300 outline-none"
                      >
                        <option value="">--</option>
                        {TIME_SLOTS.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <button
                    onClick={handleBlockSlot}
                    disabled={!blockDate || (!blockWholeDay && !blockTime)}
                    className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-md transition-all disabled:opacity-50"
                  >
                    {t("admin.blockSlot")}
                  </button>
                </div>
              </div>

              {/* Blocked list */}
              <div className="bg-white rounded-2xl shadow-sm border border-pink-100 overflow-hidden">
                <div className="p-4 border-b border-pink-100">
                  <h2 className="font-semibold text-gray-800">{t("admin.blockedSlots")}</h2>
                </div>
                {blocked.length === 0 ? (
                  <p className="text-center text-gray-500 py-12">{t("admin.noBlocked")}</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-pink-50/50 border-b border-pink-100">
                          <th className="text-left px-4 py-3 font-medium text-gray-600">{t("admin.date")}</th>
                          <th className="text-left px-4 py-3 font-medium text-gray-600">{t("admin.time")}</th>
                          <th className="text-left px-4 py-3 font-medium text-gray-600">{t("admin.actions")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {blocked.map((b) => (
                          <tr key={b.id} className="border-b border-pink-50 hover:bg-pink-50/30">
                            <td className="px-4 py-3">{formatDate(b.date, locale)}</td>
                            <td className="px-4 py-3">{b.timeSlot || t("admin.wholeDay")}</td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => handleUnblock(b.id)}
                                className="flex items-center gap-1 text-red-500 hover:text-red-700 text-xs font-medium"
                              >
                                <Trash2 size={14} />
                                {t("admin.unblock")}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </AnimatedSection>
        )}

        {/* Add Client Modal */}
        <Modal open={showAddClient} onClose={() => setShowAddClient(false)} title={t("admin.addClient")}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("admin.fullName")}</label>
              <input
                type="text"
                value={newClient.fullName}
                onChange={(e) => setNewClient({ ...newClient, fullName: e.target.value })}
                className="w-full px-3 py-2 border border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-300 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("admin.email")}</label>
              <input
                type="email"
                value={newClient.email}
                onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                className="w-full px-3 py-2 border border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-300 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("admin.password")}</label>
              <input
                type="password"
                value={newClient.password}
                onChange={(e) => setNewClient({ ...newClient, password: e.target.value })}
                className="w-full px-3 py-2 border border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-300 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("admin.trainingType")}</label>
              <select
                value={newClient.trainingType}
                onChange={(e) => setNewClient({ ...newClient, trainingType: e.target.value })}
                className="w-full px-3 py-2 border border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-300 outline-none"
              >
                <option value="group">{t("admin.group")}</option>
                <option value="duo">{t("admin.duo")}</option>
                <option value="individual">{t("admin.individual")}</option>
              </select>
            </div>
            <button
              onClick={handleAddClient}
              disabled={addingClient}
              className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-2.5 rounded-full font-medium hover:shadow-md transition-all disabled:opacity-50"
            >
              {addingClient ? t("admin.creating") : t("admin.addClient")}
            </button>
          </div>
        </Modal>

        {/* Edit Client Modal */}
        <Modal
          open={!!editingClient}
          onClose={() => setEditingClient(null)}
          title={`${t("admin.edit")} - ${editingClient?.fullName || ""}`}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("admin.trainingType")}</label>
              <select
                value={editForm.trainingType}
                onChange={(e) => setEditForm({ ...editForm, trainingType: e.target.value })}
                className="w-full px-3 py-2 border border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-300 outline-none"
              >
                <option value="group">{t("admin.group")}</option>
                <option value="duo">{t("admin.duo")}</option>
                <option value="individual">{t("admin.individual")}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("admin.remainingSessions")}</label>
              <input
                type="number"
                min={0}
                value={editForm.remainingSessions}
                onChange={(e) => setEditForm({ ...editForm, remainingSessions: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-300 outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setEditingClient(null)}
                className="flex-1 py-2.5 rounded-full border border-pink-200 text-gray-600 font-medium hover:bg-pink-50 transition-all"
              >
                {t("admin.cancel")}
              </button>
              <button
                onClick={handleUpdateClient}
                className="flex-1 flex items-center justify-center gap-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white py-2.5 rounded-full font-medium hover:shadow-md transition-all"
              >
                <Save size={16} />
                {t("admin.save")}
              </button>
            </div>
          </div>
        </Modal>

        {/* Reset Password Modal */}
        <Modal
          open={!!resetPwClient}
          onClose={() => { setResetPwClient(null); setNewPassword(""); }}
          title={`${t("admin.resetPassword")} - ${resetPwClient?.fullName || ""}`}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("admin.newPassword")}</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 border border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-300 outline-none"
              />
            </div>
            <button
              onClick={handleResetPassword}
              disabled={!newPassword}
              className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-2.5 rounded-full font-medium hover:shadow-md transition-all disabled:opacity-50"
            >
              {t("admin.resetPassword")}
            </button>
          </div>
        </Modal>
      </div>
    </div>
  );
}
