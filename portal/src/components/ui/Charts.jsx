"use client";

import { useState } from "react";

export function AreaLineChart({ data, height = 220, strokeColor = "#f59e0b", fillColor = "#fef3c7" }) {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  if (!data || data.length === 0) return null;

  const paddingX = 40;
  const paddingY = 30;
  const width = 600;

  const maxValue = Math.max(...data.map(d => d.value)) * 1.15 || 100;
  const minValue = 0;

  const points = data.map((d, index) => {
    const x = paddingX + (index / (data.length - 1)) * (width - paddingX * 2);
    const y = height - paddingY - ((d.value - minValue) / (maxValue - minValue)) * (height - paddingY * 2);
    return { x, y, label: d.label, value: d.value, subtitle: d.subtitle };
  });

  const pathD = points.reduce((acc, p, i) => `${acc} ${i === 0 ? "M" : "L"} ${p.x} ${p.y}`, "");
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  return (
    <div className="relative w-full overflow-hidden select-none">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.35" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {[0, 0.33, 0.66, 1].map((ratio, i) => {
          const y = height - paddingY - ratio * (height - paddingY * 2);
          return (
            <line
              key={i}
              x1={paddingX}
              y1={y}
              x2={width - paddingX}
              y2={y}
              stroke="#e2e8f0"
              strokeDasharray="4 4"
            />
          );
        })}

        {/* Area fill */}
        <path d={areaD} fill="url(#areaGradient)" />

        {/* Smooth line */}
        <path d={pathD} fill="none" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

        {/* Data points */}
        {points.map((p, i) => (
          <g key={i} className="cursor-pointer">
            <circle
              cx={p.x}
              cy={p.y}
              r={hoveredPoint === i ? 6 : 4}
              fill="#ffffff"
              stroke={strokeColor}
              strokeWidth="2.5"
              className="transition-all duration-150"
              onMouseEnter={() => setHoveredPoint(i)}
              onMouseLeave={() => setHoveredPoint(null)}
            />
            {/* X Axis Labels */}
            <text
              x={p.x}
              y={height - 10}
              textAnchor="middle"
              className="text-[11px] font-bold fill-slate-400"
            >
              {p.label}
            </text>
          </g>
        ))}
      </svg>

      {/* Floating Tooltip */}
      {hoveredPoint !== null && (
        <div
          className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-full bg-slate-900 text-white px-3 py-1.5 rounded-xl text-xs shadow-lg border border-slate-700 z-20"
          style={{
            left: `${(points[hoveredPoint].x / width) * 100}%`,
            top: `${(points[hoveredPoint].y / height) * 100 - 8}%`
          }}
        >
          <div className="font-bold">{points[hoveredPoint].label}</div>
          <div className="text-amber-400 font-black">
            {typeof points[hoveredPoint].value === "number" && points[hoveredPoint].value > 1000
              ? `₹${points[hoveredPoint].value.toLocaleString("en-IN")}`
              : points[hoveredPoint].value}
          </div>
          {points[hoveredPoint].subtitle && (
            <div className="text-[10px] text-slate-300">{points[hoveredPoint].subtitle}</div>
          )}
        </div>
      )}
    </div>
  );
}

export function BarChart({ data, height = 200, barColor = "#0284c7" }) {
  const [hoveredBar, setHoveredBar] = useState(null);

  if (!data || data.length === 0) return null;

  const maxValue = Math.max(...data.map(d => d.value)) * 1.15 || 100;

  return (
    <div className="w-full space-y-3">
      <div className="flex items-end justify-between gap-2 h-44 pt-4 px-2">
        {data.map((item, index) => {
          const heightPercent = Math.max(8, (item.value / maxValue) * 100);
          const isHovered = hoveredBar === index;
          return (
            <div
              key={index}
              className="flex-1 flex flex-col items-center h-full justify-end group relative"
              onMouseEnter={() => setHoveredBar(index)}
              onMouseLeave={() => setHoveredBar(null)}
            >
              {/* Tooltip */}
              {isHovered && (
                <div className="absolute -top-10 bg-slate-900 text-white px-2.5 py-1 rounded-lg text-[11px] font-bold shadow whitespace-nowrap z-20">
                  {typeof item.value === "number" && item.value > 1000
                    ? `₹${item.value.toLocaleString("en-IN")}`
                    : item.value}
                </div>
              )}

              {/* Bar */}
              <div
                className="w-full max-w-[40px] rounded-t-lg transition-all duration-200"
                style={{
                  height: `${heightPercent}%`,
                  backgroundColor: isHovered ? "#f59e0b" : barColor
                }}
              />

              {/* Label */}
              <span className="text-[11px] font-bold text-slate-500 mt-2 truncate w-full text-center">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function DonutChart({ data, size = 180 }) {
  if (!data || data.length === 0) return null;

  const total = data.reduce((acc, curr) => acc + curr.value, 0) || 1;
  let accumulatedAngle = 0;

  const radius = 70;
  const strokeWidth = 24;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
          {data.map((item, idx) => {
            const strokeDasharray = `${(item.value / total) * circumference} ${circumference}`;
            const strokeDashoffset = -accumulatedAngle;
            accumulatedAngle += (item.value / total) * circumference;

            return (
              <circle
                key={idx}
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke={item.color || "#94a3b8"}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-300 hover:opacity-85 cursor-pointer"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-black text-slate-900">{total}</span>
          <span className="text-[10px] font-bold uppercase text-slate-400">Total</span>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-2 text-xs">
        {data.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="font-semibold text-slate-600">{item.label}:</span>
            <span className="font-black text-slate-900 ml-auto pl-2">{item.value}</span>
            <span className="text-slate-400 text-[10px]">({Math.round((item.value / total) * 100)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}
