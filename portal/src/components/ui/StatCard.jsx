import { TrendingUp, TrendingDown } from "lucide-react";

export default function StatCard({
  title,
  value,
  subtitle,
  trend,
  trendPositive = true,
  icon: Icon,
  iconColor = "text-amber-600 bg-amber-50 border-amber-100",
  onClick
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-slate-200 p-5 shadow-xs transition-all hover:shadow-md ${
        onClick ? "cursor-pointer hover:border-amber-300" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          {title}
        </span>
        {Icon && (
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${iconColor}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {value}
        </span>
        {trend && (
          <span
            className={`inline-flex items-center text-xs font-bold ${
              trendPositive ? "text-emerald-600" : "text-rose-600"
            }`}
          >
            {trendPositive ? (
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
            )}
            {trend}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1 text-xs text-slate-500 font-medium">
          {subtitle}
        </p>
      )}
    </div>
  );
}
