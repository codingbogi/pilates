"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n";
import { Menu, X, Globe } from "lucide-react";

export function Navbar() {
  const { user, logout, loading } = useAuth();
  const { t, locale, setLocale } = useI18n();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setMobileOpen(false);
    router.push("/");
  };

  const toggleLocale = () => {
    setLocale(locale === "sr" ? "en" : "sr");
  };

  const closeMobile = () => setMobileOpen(false);

  const isAdmin = user?.role === "admin";
  const isClient = user?.role === "client";

  return (
    <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-pink-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2" onClick={closeMobile}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">PS</span>
            </div>
            <span className="font-semibold text-lg text-gray-800">
              Pilates <span className="text-pink-500">Studio</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {isAdmin ? (
              <>
                <Link href="/admin" className="text-sm font-medium text-gray-600 hover:text-pink-600 transition-colors">
                  {t("nav.admin")}
                </Link>
                <button onClick={handleLogout} className="text-sm font-medium text-gray-600 hover:text-pink-600 transition-colors">
                  {t("nav.logout")}
                </button>
              </>
            ) : (
              <>
                <Link href="/" className="text-sm font-medium text-gray-600 hover:text-pink-600 transition-colors">
                  {t("nav.home")}
                </Link>
                <Link href="/paketi" className="text-sm font-medium text-gray-600 hover:text-pink-600 transition-colors">
                  {t("nav.packages")}
                </Link>
                <Link href="/kontakt" className="text-sm font-medium text-gray-600 hover:text-pink-600 transition-colors">
                  {t("nav.contact")}
                </Link>
                {isClient ? (
                  <>
                    <Link href="/dashboard" className="text-sm font-medium text-pink-600 hover:text-pink-700 transition-colors">
                      {t("nav.dashboard")}
                    </Link>
                    <button onClick={handleLogout} className="text-sm font-medium text-gray-600 hover:text-pink-600 transition-colors">
                      {t("nav.logout")}
                    </button>
                  </>
                ) : (
                  !loading && (
                    <Link
                      href="/login"
                      className="text-sm font-medium bg-gradient-to-r from-pink-500 to-rose-500 text-white px-4 py-2 rounded-full hover:shadow-lg hover:shadow-pink-200 transition-all"
                    >
                      {t("nav.login")}
                    </Link>
                  )
                )}
              </>
            )}
            <button
              onClick={toggleLocale}
              className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-pink-600 transition-colors border border-gray-200 rounded-full px-3 py-1"
            >
              <Globe size={14} />
              {locale === "sr" ? "EN" : "SR"}
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleLocale}
              className="flex items-center gap-1 text-xs font-medium text-gray-500 border border-gray-200 rounded-full px-2 py-1"
            >
              <Globe size={12} />
              {locale === "sr" ? "EN" : "SR"}
            </button>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2">
              {mobileOpen ? <X size={24} className="text-gray-700" /> : <Menu size={24} className="text-gray-700" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-pink-100 shadow-lg">
          <div className="px-4 py-3 space-y-2">
            {isAdmin ? (
              <>
                <Link href="/admin" onClick={closeMobile} className="block py-2 text-gray-700 hover:text-pink-600">
                  {t("nav.admin")}
                </Link>
                <button onClick={handleLogout} className="block py-2 text-gray-700 hover:text-pink-600 w-full text-left">
                  {t("nav.logout")}
                </button>
              </>
            ) : (
              <>
                <Link href="/" onClick={closeMobile} className="block py-2 text-gray-700 hover:text-pink-600">
                  {t("nav.home")}
                </Link>
                <Link href="/paketi" onClick={closeMobile} className="block py-2 text-gray-700 hover:text-pink-600">
                  {t("nav.packages")}
                </Link>
                <Link href="/kontakt" onClick={closeMobile} className="block py-2 text-gray-700 hover:text-pink-600">
                  {t("nav.contact")}
                </Link>
                {isClient ? (
                  <>
                    <Link href="/dashboard" onClick={closeMobile} className="block py-2 text-pink-600 font-medium">
                      {t("nav.dashboard")}
                    </Link>
                    <button onClick={handleLogout} className="block py-2 text-gray-700 hover:text-pink-600 w-full text-left">
                      {t("nav.logout")}
                    </button>
                  </>
                ) : (
                  !loading && (
                    <Link href="/login" onClick={closeMobile} className="block py-2 text-pink-600 font-medium">
                      {t("nav.login")}
                    </Link>
                  )
                )}
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
