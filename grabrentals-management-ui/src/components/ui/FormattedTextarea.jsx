"use client";

import { useState, useRef } from "react";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Sparkles,
  Eye,
  Edit3,
  Check,
  Tag,
  RotateCcw,
} from "lucide-react";

export function FormattedTextarea({
  label = "Description",
  value = "",
  onChange,
  placeholder = "Add highlights, specifications, baggage capacity, amenities...",
  rows = 4,
  maxLength = 800,
  quickTags = [
    "Dual AC",
    "Spacious Boot Space",
    "Pushback Seats",
    "Music System / Bluetooth",
    "FastTag Enabled",
    "GPS Live Tracked",
    "Clean & Sanitized",
    "Carrier Available",
  ],
  required = false,
  className = "",
}) {
  const [tab, setTab] = useState("write"); // 'write' | 'preview'
  const textareaRef = useRef(null);

  // Helper to wrap selected text or insert text at cursor
  const insertFormatting = (prefix, suffix = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = value || "";
    const selected = text.substring(start, end);

    let replacement = "";
    let newCursorPos = start;

    if (selected.length > 0) {
      replacement = `${prefix}${selected}${suffix}`;
      newCursorPos = start + replacement.length;
    } else {
      replacement = `${prefix}${suffix}`;
      newCursorPos = start + prefix.length;
    }

    const updated = text.substring(0, start) + replacement + text.substring(end);
    onChange(updated);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 10);
  };

  const insertLinePrefix = (prefix) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const text = value || "";
    const lastNewline = text.lastIndexOf("\n", start - 1);
    const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;

    const updated = text.substring(0, lineStart) + prefix + text.substring(lineStart);
    onChange(updated);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length);
    }, 10);
  };

  const handleAddTag = (tag) => {
    const tagText = `• ${tag}\n`;
    const text = value || "";
    if (text.includes(tag)) return; // already added
    const separator = text.length > 0 && !text.endsWith("\n") ? "\n" : "";
    onChange(text + separator + tagText);
  };

  // Simple Markdown-to-JSX preview parser
  const renderFormattedPreview = (content) => {
    if (!content || !content.trim()) {
      return (
        <span className="text-slate-400 italic text-xs">
          No description entered yet. Switch back to "Write" to add details.
        </span>
      );
    }

    const lines = content.split("\n");
    return (
      <div className="space-y-1.5 text-xs text-slate-700 leading-relaxed">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) {
            return <div key={idx} className="h-2" />;
          }

          // Bullet line
          if (trimmed.startsWith("•") || trimmed.startsWith("-") || trimmed.startsWith("* ")) {
            const bulletContent = trimmed.replace(/^[•\-\*]\s*/, "");
            return (
              <div key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                <span dangerouslySetInnerHTML={{ __html: parseInlineStyles(bulletContent) }} />
              </div>
            );
          }

          // Numbered line
          const numMatch = trimmed.match(/^(\d+)\.\s*(.*)/);
          if (numMatch) {
            return (
              <div key={idx} className="flex items-start gap-2">
                <span className="font-bold text-blue-600 text-[11px] shrink-0 mt-0.5">
                  {numMatch[1]}.
                </span>
                <span dangerouslySetInnerHTML={{ __html: parseInlineStyles(numMatch[2]) }} />
              </div>
            );
          }

          return (
            <p
              key={idx}
              dangerouslySetInnerHTML={{ __html: parseInlineStyles(line) }}
            />
          );
        })}
      </div>
    );
  };

  const parseInlineStyles = (str) => {
    if (!str) return "";
    let safe = str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Bold **text**
    safe = safe.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>');
    // Italic *text*
    safe = safe.replace(/\*(.*?)\*/g, '<em class="italic text-slate-800">$1</em>');
    // Bracket tag [tag]
    safe = safe.replace(
      /\[(.*?)\]/g,
      '<span class="inline-block bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-[10px] font-semibold border border-blue-200">$1</span>'
    );
    return safe;
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {/* Label and Mode Switcher */}
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-700">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[11px]">
          <button
            type="button"
            onClick={() => setTab("write")}
            className={`px-2 py-0.5 rounded font-medium transition-colors flex items-center gap-1 ${
              tab === "write" ? "bg-white text-blue-600 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Edit3 className="w-3 h-3" /> Write
          </button>
          <button
            type="button"
            onClick={() => setTab("preview")}
            className={`px-2 py-0.5 rounded font-medium transition-colors flex items-center gap-1 ${
              tab === "preview" ? "bg-white text-blue-600 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Eye className="w-3 h-3" /> Live Preview
          </button>
        </div>
      </div>

      {/* Editor Box */}
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all shadow-xs">
        {/* Toolbar (visible in write mode) */}
        {tab === "write" && (
          <div className="flex items-center justify-between px-2.5 py-1.5 bg-slate-50 border-b border-slate-200 text-slate-600 gap-1 flex-wrap">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => insertFormatting("**", "**")}
                title="Bold (**text**)"
                className="p-1 hover:bg-slate-200 rounded text-slate-700 hover:text-slate-900 transition-colors"
              >
                <Bold className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("*", "*")}
                title="Italic (*text*)"
                className="p-1 hover:bg-slate-200 rounded text-slate-700 hover:text-slate-900 transition-colors"
              >
                <Italic className="w-3.5 h-3.5" />
              </button>
              <span className="w-px h-3.5 bg-slate-200 mx-1" />
              <button
                type="button"
                onClick={() => insertLinePrefix("• ")}
                title="Bullet Point (• Item)"
                className="p-1 hover:bg-slate-200 rounded text-slate-700 hover:text-slate-900 transition-colors flex items-center gap-0.5 text-xs font-bold"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertLinePrefix("1. ")}
                title="Numbered List (1. Item)"
                className="p-1 hover:bg-slate-200 rounded text-slate-700 hover:text-slate-900 transition-colors flex items-center gap-0.5 text-xs font-bold"
              >
                <ListOrdered className="w-3.5 h-3.5" />
              </button>
              <span className="w-px h-3.5 bg-slate-200 mx-1" />
              <button
                type="button"
                onClick={() => insertFormatting("[", "]")}
                title="Feature Badge [Tag]"
                className="p-1 hover:bg-slate-200 rounded text-slate-700 hover:text-slate-900 transition-colors flex items-center gap-1 text-[11px] font-medium"
              >
                <Tag className="w-3 h-3" /> Badge
              </button>
            </div>

            {value && (
              <button
                type="button"
                onClick={() => onChange("")}
                title="Clear content"
                className="text-[10px] text-slate-400 hover:text-rose-600 transition-colors flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-rose-50"
              >
                <RotateCcw className="w-2.5 h-2.5" /> Clear
              </button>
            )}
          </div>
        )}

        {/* Content area */}
        {tab === "write" ? (
          <textarea
            ref={textareaRef}
            rows={rows}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            maxLength={maxLength}
            className="w-full px-3 py-2.5 text-xs text-slate-800 focus:outline-none placeholder:text-slate-400 font-sans leading-relaxed resize-y min-h-[90px]"
          />
        ) : (
          <div className="p-3 min-h-[105px] bg-slate-50/60 max-h-48 overflow-y-auto">
            {renderFormattedPreview(value)}
          </div>
        )}
      </div>

      {/* Footer helpers: Quick Tags & Char Count */}
      <div className="space-y-1.5 pt-0.5">
        {quickTags && quickTags.length > 0 && tab === "write" && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" /> Quick Add:
            </span>
            {quickTags.map((tag) => {
              const active = (value || "").includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleAddTag(tag)}
                  className={`text-[10px] px-2 py-0.5 rounded-md font-medium transition-colors border flex items-center gap-1 ${
                    active
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : "bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600 hover:bg-slate-50"
                  }`}
                >
                  {active && <Check className="w-2.5 h-2.5" />}
                  {tag}
                </button>
              );
            })}
          </div>
        )}

        <div className="flex items-center justify-between text-[10px] text-slate-400 px-0.5">
          <span>Formatted with bold, bullets & highlight tags</span>
          <span>
            {(value || "").length} / {maxLength}
          </span>
        </div>
      </div>
    </div>
  );
}
