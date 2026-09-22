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
  const isLongValue = typeof value === "string" && value.length > 7;

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs transition-all hover:shadow-md min-w-0 flex flex-col justify-between ${
        onClick ? "cursor-pointer hover:border-amber-300" : ""
      }`}
    >
      <div>
        <div className="flex items-center justify-between gap-1.5">
          <span
            title={title}
            className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate"
          >
            {title}
          </span>
          {Icon && (
            <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center border shrink-0 ${iconColor}`}>
              <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          )}
        </div>

        <div className="mt-2.5 flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span
            className={`${
              isLongValue ? "text-xl sm:text-2xl" : "text-2xl sm:text-3xl"
            } font-black text-slate-900 tracking-tight`}
          >
            {value}
          </span>
          {trend && (
            <span
              className={`inline-flex items-center text-xs font-bold px-1.5 py-0.5 rounded-md shrink-0 whitespace-nowrap ${
                trendPositive
                  ? "text-emerald-700 bg-emerald-50 border border-emerald-200/60"
                  : "text-rose-700 bg-rose-50 border border-rose-200/60"
              }`}
            >
              {trendPositive ? (
                <TrendingUp className="w-3.5 h-3.5 mr-0.5 shrink-0" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5 mr-0.5 shrink-0" />
              )}
              {trend}
            </span>
          )}
        </div>
      </div>

      {subtitle && (
        <p
          title={subtitle}
          className="mt-2 text-xs text-slate-500 font-medium truncate"
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
