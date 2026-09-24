export default function NumberPlate({ number, variant = "yellow", className = "" }) {
  if (!number) return <span className="text-slate-400 italic text-xs">Unassigned</span>;

  // Format TN-38-AB-1234 into neat standard format: TN 38 AB 1234
  const formatted = number.includes("-") 
    ? number.replace(/-/g, " ") 
    : number;

  if (variant === "dark") {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 text-amber-400 font-mono font-black text-xs tracking-wider border border-slate-800 shadow-2xs whitespace-nowrap select-all ${className}`}
      >
        <span className="text-[8px] font-black text-slate-400 pr-1 border-r border-slate-700 leading-none select-none">
          IND
        </span>
        <span>{formatted}</span>
      </span>
    );
  }

  if (variant === "slate") {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-900 font-mono font-black text-xs tracking-wider border border-slate-300 shadow-2xs whitespace-nowrap select-all ${className}`}
      >
        <span className="text-[8px] font-black text-blue-800 pr-1.5 border-r border-slate-300 leading-none select-none">
          IND
        </span>
        <span>{formatted}</span>
      </span>
    );
  }

  // Default: Authentic Commercial Transport Plate (Yellow with black embossed lettering & blue IND stamp)
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-300 text-slate-950 font-mono font-black text-xs tracking-wider border border-amber-400/90 shadow-2xs whitespace-nowrap select-all ${className}`}
    >
      <span className="text-[8px] font-black text-blue-900 pr-1.5 border-r border-slate-950/20 leading-none select-none">
        IND
      </span>
      <span>{formatted}</span>
    </span>
  );
}
