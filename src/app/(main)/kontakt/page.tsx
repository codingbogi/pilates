"use client";

import { useState, type FormEvent } from "react";
import { useI18n } from "@/lib/i18n";
import { AnimatedSection } from "@/components/home/AnimatedSection";
import { toast } from "@/components/ui/Toast";
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";

export default function KontaktPage() {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = t("contactPage.required");
    if (!form.email.trim()) errs.email = t("contactPage.required");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = t("contactPage.invalidEmail");
    if (!form.phone.trim()) errs.phone = t("contactPage.required");
    if (!form.message.trim()) errs.message = t("contactPage.required");
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        toast(t("contactPage.success"), "success");
        setForm({ name: "", email: "", phone: "", message: "" });
      } else {
        toast(t("contactPage.error"), "error");
      }
    } catch {
      toast(t("contactPage.error"), "error");
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    { icon: MapPin, label: t("contactPage.address"), value: t("contactPage.addressValue") },
    { icon: Phone, label: t("contactPage.phoneLabel"), value: t("contactPage.phoneValue") },
    { icon: Mail, label: t("contactPage.emailLabel"), value: t("contactPage.emailValue") },
    { icon: Clock, label: t("contactPage.hours"), value: t("contactPage.hoursValue") },
  ];

  return (
    <div className="py-16 px-4 bg-gradient-to-b from-pink-50 to-white min-h-screen">
      <div className="max-w-7xl mx-auto">
        <AnimatedSection className="text-center mb-14">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {t("contactPage.title")}
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            {t("contactPage.subtitle")}
          </p>
          <div className="w-16 h-1 bg-gradient-to-r from-pink-400 to-rose-400 mx-auto rounded-full mt-6" />
        </AnimatedSection>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <AnimatedSection>
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-sm border border-pink-100">
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t("contactPage.name")}</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-3 border border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-pink-400 outline-none transition-all bg-pink-50/30"
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t("contactPage.email")}</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-3 border border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-pink-400 outline-none transition-all bg-pink-50/30"
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t("contactPage.phone")}</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-pink-400 outline-none transition-all bg-pink-50/30"
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t("contactPage.message")}</label>
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-pink-400 outline-none transition-all bg-pink-50/30 resize-none"
                  />
                  {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white py-3 rounded-full font-medium shadow-md hover:shadow-lg hover:shadow-pink-200 transition-all disabled:opacity-60"
                >
                  {loading ? (
                    <>{t("contactPage.sending")}</>
                  ) : (
                    <>
                      <Send size={18} />
                      {t("contactPage.send")}
                    </>
                  )}
                </button>
              </div>
            </form>
          </AnimatedSection>

          {/* Contact Info + Map */}
          <AnimatedSection delay={0.2}>
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-pink-100">
                <div className="space-y-6">
                  {contactInfo.map((info, i) => {
                    const Icon = info.icon;
                    return (
                      <div key={i} className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center shrink-0">
                          <Icon size={20} className="text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">{info.label}</p>
                          <p className="text-gray-800">{info.value}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-pink-100">
                <div className="p-4 border-b border-pink-100">
                  <h3 className="font-medium text-gray-800">{t("contactPage.findUs")}</h3>
                </div>
                <div className="aspect-video bg-pink-50 flex items-center justify-center">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2830.167!2d20.457!3d44.817!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDTCsDQ5JzAxLjIiTiAyMMKwMjcnMjUuMiJF!5e0!3m2!1ssr!2srs!4v1600000000000"
                    width="100%"
                    height="100%"
                    style={{ border: 0, minHeight: "250px" }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Pilates Studio Location"
                  />
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </div>
  );
}
