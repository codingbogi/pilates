"use client";

import { useI18n } from "@/lib/i18n";
import { Heart } from "lucide-react";

export function Footer() {
  const { t } = useI18n();

  return (
    <footer className="bg-gray-900 text-gray-400 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center">
              <span className="text-white font-bold text-xs">PS</span>
            </div>
            <span className="text-white font-medium">{t("footer.studio")}</span>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <span>© {new Date().getFullYear()}</span>
            <Heart size={14} className="text-pink-400" />
            <span>{t("footer.rights")}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
