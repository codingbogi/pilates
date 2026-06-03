"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n";
import { toast } from "@/components/ui/Toast";
import { Loader } from "@/components/ui/Loader";
import { AnimatedSection } from "@/components/home/AnimatedSection";
import { getNext7Days, isSunday, formatDate, canCancel } from "@/lib/utils";
import { TIME_SLOTS } from "@/types";
import { User, Calendar, List, X } from "lucide-react";

interface ProfileData {
  id: string;
  fullName: string;
  email: string;
  trainingType: string;
  remainingSessions: number;
}

interface SlotInfo {
  time: string;
  available: number;
  capacity: number;
  isBlocked: boolean;
  isFull: boolean;
}

interface ReservationData {
  id: string;
  date: string;
  timeSlot: string;
  trainingType: string;
  status: string;
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { t, locale } = useI18n();
  const router = useRouter();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [reservations, setReservations] = useState<ReservationData[]>([]);
  const [selectedDate, setSelectedDate] = useState(getNext7Days()[0]);
  const [slots, setSlots] = useState<SlotInfo[]>([]);
  const [hasBookingForDay, setHasBookingForDay] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [bookingSlot, setBookingSlot] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"calendar" | "reservations">("calendar");

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "client")) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const loadProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/profile");
      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile);
      }
    } catch { /* empty */ }
    setLoadingProfile(false);
  }, []);

  const loadReservations = useCallback(async () => {
    try {
      const res = await fetch("/api/reservations");
      if (res.ok) {
        const data = await res.json();
        setReservations(data.reservations);
      }
    } catch { /* empty */ }
  }, []);

  const loadSlots = useCallback(async (date: string) => {
    if (isSunday(date)) {
      setSlots([]);
      return;
    }
    setLoadingSlots(true);
    try {
      const res = await fetch(`/api/reservations/slots?date=${date}`);
      if (res.ok) {
        const data = await res.json();
        setSlots(data.slots);
        setHasBookingForDay(data.hasBookingForDay);
      }
    } catch { /* empty */ }
    setLoadingSlots(false);
  }, []);

  useEffect(() => {
    if (user?.role === "client") {
      loadProfile();
      loadReservations();
    }
  }, [user, loadProfile, loadReservations]);

  useEffect(() => {
    if (user?.role === "client") {
      loadSlots(selectedDate);
    }
  }, [selectedDate, user, loadSlots]);

  const handleBook = async (timeSlot: string) => {
    if (!profile) return;
    if (profile.remainingSessions <= 0) {
      toast(t("dashboard.noSessions"), "error");
      return;
    }
    if (hasBookingForDay) {
      toast(t("dashboard.alreadyBooked"), "error");
      return;
    }

    setBookingSlot(timeSlot);
    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: selectedDate, timeSlot }),
      });

      if (res.ok) {
        toast(t("dashboard.bookSuccess"), "success");
        loadSlots(selectedDate);
        loadReservations();
        loadProfile();
      } else {
        const data = await res.json();
        if (data.error === "Already booked for this day") toast(t("dashboard.alreadyBooked"), "error");
        else if (data.error === "Slot is full") toast(t("dashboard.slotFull"), "error");
        else if (data.error === "Slot is blocked") toast(t("dashboard.blocked"), "error");
        else if (data.error === "No remaining sessions") toast(t("dashboard.noSessions"), "error");
        else toast(t("dashboard.bookError"), "error");
      }
    } catch {
      toast(t("dashboard.bookError"), "error");
    }
    setBookingSlot(null);
  };

  const handleCancel = async (reservationId: string, date: string, timeSlot: string) => {
    if (!canCancel(date, timeSlot)) {
      toast(t("dashboard.cancelNotAllowed"), "error");
      return;
    }
    if (!confirm(t("dashboard.cancelConfirm"))) return;

    setCancellingId(reservationId);
    try {
      const res = await fetch("/api/reservations/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reservationId }),
      });

      if (res.ok) {
        toast(t("dashboard.cancelSuccess"), "success");
        loadReservations();
        loadSlots(selectedDate);
        loadProfile();
      } else {
        toast(t("dashboard.cancelError"), "error");
      }
    } catch {
      toast(t("dashboard.cancelError"), "error");
    }
    setCancellingId(null);
  };

  const trainingTypeLabel = (type: string) => {
    if (type === "group") return t("dashboard.group");
    if (type === "duo") return t("dashboard.duo");
    return t("dashboard.individual");
  };

  if (authLoading || loadingProfile) {
    return <Loader text={t("common.loading")} />;
  }

  if (!user || !profile) return null;

  const days = getNext7Days();

  return (
    <div className="py-8 px-4 bg-gradient-to-b from-pink-50 to-white min-h-screen">
      <div className="max-w-5xl mx-auto">
        <AnimatedSection>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">{t("dashboard.title")}</h1>
        </AnimatedSection>

        {/* Profile Card */}
        <AnimatedSection>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-pink-100 mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center">
                <User size={24} className="text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-800">{profile.fullName}</h2>
                <p className="text-sm text-gray-500">{profile.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-pink-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">{t("dashboard.trainingType")}</p>
                <p className="font-semibold text-gray-800">{trainingTypeLabel(profile.trainingType)}</p>
              </div>
              <div className="bg-pink-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">{t("dashboard.remaining")}</p>
                <p className="font-semibold text-gray-800">
                  {profile.remainingSessions} {t("dashboard.sessions")}
                </p>
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("calendar")}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeTab === "calendar"
                ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md"
                : "bg-white text-gray-600 border border-pink-200 hover:bg-pink-50"
            }`}
          >
            <Calendar size={16} />
            {t("dashboard.calendar")}
          </button>
          <button
            onClick={() => setActiveTab("reservations")}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeTab === "reservations"
                ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md"
                : "bg-white text-gray-600 border border-pink-200 hover:bg-pink-50"
            }`}
          >
            <List size={16} />
            {t("dashboard.myReservations")}
          </button>
        </div>

        {/* Calendar Tab */}
        {activeTab === "calendar" && (
          <AnimatedSection>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-pink-100">
              {/* Date selector */}
              <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
                {days.map((day) => {
                  const isSelected = day === selectedDate;
                  const sunday = isSunday(day);
                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDate(day)}
                      disabled={sunday}
                      className={`shrink-0 px-4 py-3 rounded-xl text-center transition-all min-w-[80px] ${
                        sunday
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : isSelected
                          ? "bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-md"
                          : "bg-pink-50 text-gray-700 hover:bg-pink-100"
                      }`}
                    >
                      <div className="text-xs font-medium">
                        {formatDate(day, locale).split(",")[0]}
                      </div>
                      <div className="text-sm font-semibold mt-1">
                        {new Date(day + "T00:00:00").getDate()}
                      </div>
                    </button>
                  );
                })}
              </div>

              {isSunday(selectedDate) ? (
                <p className="text-center text-gray-500 py-8">{t("dashboard.sunday")}</p>
              ) : loadingSlots ? (
                <Loader />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {slots.map((slot) => {
                    const disabled = slot.isBlocked || slot.isFull || hasBookingForDay || profile.remainingSessions <= 0;
                    const isBooking = bookingSlot === slot.time;

                    return (
                      <div
                        key={slot.time}
                        className={`rounded-xl p-4 border transition-all ${
                          slot.isBlocked
                            ? "bg-gray-50 border-gray-200 opacity-50"
                            : slot.isFull
                            ? "bg-red-50 border-red-100"
                            : "bg-green-50 border-green-100"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-gray-800">
                            {slot.time} - {String(Number(slot.time.split(":")[0]) + 1).padStart(2, "0")}:00
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mb-3">
                          {slot.isBlocked
                            ? t("dashboard.blocked")
                            : slot.isFull
                            ? t("dashboard.full")
                            : `${slot.available}/${slot.capacity} ${t("dashboard.available")}`}
                        </div>
                        <button
                          onClick={() => handleBook(slot.time)}
                          disabled={disabled || isBooking}
                          className={`w-full py-2 rounded-lg text-sm font-medium transition-all ${
                            disabled
                              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                              : "bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:shadow-md"
                          }`}
                        >
                          {isBooking ? "..." : t("dashboard.book")}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </AnimatedSection>
        )}

        {/* Reservations Tab */}
        {activeTab === "reservations" && (
          <AnimatedSection>
            <div className="bg-white rounded-2xl shadow-sm border border-pink-100 overflow-hidden">
              {reservations.length === 0 ? (
                <p className="text-center text-gray-500 py-12">{t("dashboard.noReservations")}</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-pink-50 border-b border-pink-100">
                        <th className="text-left px-4 py-3 font-medium text-gray-600">{t("dashboard.date")}</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">{t("dashboard.time")}</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">{t("dashboard.type")}</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">{t("dashboard.status")}</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">{t("dashboard.actions")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reservations.map((r) => (
                        <tr key={r.id} className="border-b border-pink-50 hover:bg-pink-50/50">
                          <td className="px-4 py-3">{formatDate(r.date, locale)}</td>
                          <td className="px-4 py-3">{r.timeSlot}</td>
                          <td className="px-4 py-3">{trainingTypeLabel(r.trainingType)}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              r.status === "active"
                                ? "bg-green-50 text-green-700"
                                : "bg-gray-100 text-gray-500"
                            }`}>
                              {r.status === "active" ? t("dashboard.active") : t("dashboard.cancelled")}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {r.status === "active" && (
                              <button
                                onClick={() => handleCancel(r.id, r.date, r.timeSlot)}
                                disabled={cancellingId === r.id}
                                className="flex items-center gap-1 text-red-500 hover:text-red-700 text-xs font-medium transition-colors"
                              >
                                <X size={14} />
                                {t("dashboard.cancel")}
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
      </div>
    </div>
  );
}
