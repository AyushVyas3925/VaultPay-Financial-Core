import React from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  subtext?: string;
  trend?: {
    value: string;
    type: "positive" | "negative";
  };
}

export const StatCard = ({ label, value, icon: Icon, subtext, trend }: StatCardProps) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex items-center justify-between transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:shadow-md hover:border-blue-200/60 hover:shadow-blue-50/50">
      <div className="space-y-1">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
          {label}
        </span>
        <h3 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight leading-none">
          {value}
        </h3>
        
        {trend && (
          <div className="flex items-center gap-1.5 mt-2">
            <span className={`text-xs font-bold ${
              trend.type === "positive" ? "text-emerald-600" : "text-red-500"
            }`}>
              {trend.value}
            </span>
            {subtext && <span className="text-xs text-slate-400">{subtext}</span>}
          </div>
        )}
        {!trend && subtext && (
          <p className="text-xs text-slate-500 mt-2">{subtext}</p>
        )}
      </div>

      {Icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-slate-500 border border-slate-100">
          <Icon className="h-6 w-6" />
        </div>
      )}
    </div>
  );
};
export default StatCard;
