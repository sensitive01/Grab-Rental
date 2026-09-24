import { getStatusStyle } from "@/lib/utils";

export default function StatusBadge({ status, className = "" }) {
  if (!status) return null;
  const style = getStatusStyle(status);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border capitalize tracking-tight whitespace-nowrap ${style} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-80"></span>
      {status}
    </span>
  );
}
