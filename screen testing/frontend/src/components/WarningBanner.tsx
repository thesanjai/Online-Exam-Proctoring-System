
import React from "react";
import { AlertCircle } from "lucide-react";

export function WarningBanner({ warning }: { warning: string }) {
  return (
    <div className="w-full bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2 p-3 mb-2">
      <AlertCircle className="text-red-500" size={22} />
      <span className="font-semibold">{warning}</span>
    </div>
  );
}
