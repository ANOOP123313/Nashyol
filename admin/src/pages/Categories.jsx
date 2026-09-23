import React, { useState, useRef, useEffect } from "react";
import { categoriesAPI, uploadAPI } from "../services/api";

function useOutsideClick(ref, callback) {
  useEffect(() => {
    function h(e) {
      if (ref.current && !ref.current.contains(e.target)) callback();
    }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [ref, callback]);
}

function CustomDropdown({ value, onChange, options }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useOutsideClick(ref, () => setOpen(false));
  const selectedLabel = options.find((o) => o.value === value)?.label || value;
  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 border border-gray-200 rounded-lg pl-3 pr-2 py-2 text-sm text-gray-700 font-medium bg-white min-w-max hover:border-gray-300 transition-colors shadow-sm"
      >
        <span>{selectedLabel}</span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden min-w-max">
          {options.map((opt) => {
            const sel = value === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className="w-full flex items-center justify-between gap-8 px-4 py-2.5 text-sm text-left hover:bg-gray-50 transition-colors"
                style={sel ? { backgroundColor: "#FFF7ED" } : {}}
              >
                <span className={`font-medium ${sel ? "text-orange-500" : "text-gray-700"}`}>
                  {opt.label}
                </span>
                {sel && (
                  <svg
                    className="w-4 h-4 text-orange-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ActionMenu({ item, onEdit, onToggleStatus, onAddSubcategory, onDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useOutsideClick(ref, () => setOpen(false));

  const isParent = item.type === "Parent";
  const isActive = item.status === "active";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
        title="Actions"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="5" r="1.5" />
          <circle cx="12" cy="12" r="1.5" />
          <circle cx="12" cy="19" r="1.5" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden min-w-[170px] py-1">
          {isParent && (
            <button
              type="button"
              onClick={() => {
                onAddSubcategory?.(item);
                setOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-left text-orange-600 hover:bg-orange-50 transition-colors font-medium"
            >
              <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Subcategory</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              onEdit?.(item);
              setOpen(false);
            }}
            className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            <span className="font-medium">Edit {isParent ? "Category" : "Subcategory"}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onToggleStatus?.(item);
              setOpen(false);
            }}
            className={`w-full flex items-center gap-2.5 px-4 py-2 text-sm text-left transition-colors ${
              isActive ? "text-amber-700 hover:bg-amber-50" : "text-emerald-700 hover:bg-emerald-50"
            }`}
          >
            {isActive ? (
              <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <span className="font-medium">{isActive ? "Deactivate" : "Activate"}</span>
          </button>

          <div className="border-t border-gray-100 my-1" />

          <button
            type="button"
            onClick={() => {
              onDelete?.(item);
              setOpen(false);
            }}
            className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50 transition-colors"
          >
            <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            <span className="font-medium">Delete</span>
          </button>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const active = status === "active";
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
        active ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-700"
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${active ? "bg-emerald-500" : "bg-gray-400"}`} />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function ParentBadge() {
  return (
    <span
      className="inline-block text-xs font-semibold px-2 py-0.5 rounded-md text-white shadow-xs"
      style={{ backgroundColor: "#F97316" }}
    >
      Parent
    </span>
  );
}

function SubBadge({ parentName }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
      <span>Subcategory</span>
      {parentName && <span className="text-gray-400">• in {parentName}</span>}
    </span>
  );
}

function ParentRow({
  item,
  isExpanded,
  onToggleExpand,
  onEdit,
  onToggleStatus,
  onAddSubcategory,
  onDelete,
}) {
  const hasChildren = item.children && item.children.length > 0;

  return (
    <tr className="border-b border-gray-100 hover:bg-orange-50/20 transition-colors group">
      <td className="py-4 px-5">
        <div className="flex items-center gap-3">
          {hasChildren ? (
            <button
              type="button"
              onClick={onToggleExpand}
              className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
              title={isExpanded ? "Collapse subcategories" : "Expand subcategories"}
            >
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? "rotate-90 text-orange-500" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ) : (
            <span className="w-6" />
          )}

          {item.image ? (
            <img
              src={item.image}
              alt=""
              className="w-9 h-9 rounded-lg object-cover border border-gray-200 shrink-0"
            />
          ) : (
            <span className="text-2xl flex-shrink-0">{item.emoji || "📦"}</span>
          )}

          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-gray-900 text-sm">{item.name}</p>
              <ParentBadge />
            </div>
            <div className="mt-0.5 flex items-center gap-2">
              {hasChildren && (
                <button
                  type="button"
                  onClick={onToggleExpand}
                  className="text-xs text-orange-600 font-medium hover:underline"
                >
                  {item.children.length} {item.children.length === 1 ? "subcategory" : "subcategories"}
                </button>
              )}
            </div>
          </div>
        </div>
      </td>
      <td className="py-4 px-5 text-sm text-gray-500 font-mono text-xs">{item.slug}</td>
      <td className="py-4 px-5 text-sm text-gray-500 max-w-xs truncate">{item.description || "—"}</td>
      <td className="py-4 px-5">
        <span className="border border-gray-200 bg-gray-50 rounded-md px-2.5 py-1 text-xs text-gray-700 font-medium">
          {item.products?.toLocaleString() || 0} products
        </span>
      </td>
      <td className="py-4 px-5">
        <StatusBadge status={item.status} />
      </td>
      <td className="py-4 px-5">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onAddSubcategory?.(item)}
            className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-orange-600 hover:text-orange-700 hover:bg-orange-50 px-2 py-1 rounded transition-colors"
            title="Add subcategory to this category"
          >
            <span>+ Sub</span>
          </button>
          <ActionMenu
            item={item}
            onEdit={onEdit}
            onToggleStatus={onToggleStatus}
            onAddSubcategory={onAddSubcategory}
            onDelete={onDelete}
          />
        </div>
      </td>
    </tr>
  );
}

function ChildRow({ item, parentName, onEdit, onToggleStatus, onDelete }) {
  return (
    <tr className="border-b border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors">
      <td className="py-3 px-5">
        <div className="flex items-center gap-3 pl-8">
          <div className="w-2 h-2 rounded-full bg-gray-300" />
          {item.image ? (
            <img
              src={item.image}
              alt=""
              className="w-7 h-7 rounded-md object-cover border border-gray-200 shrink-0"
            />
          ) : (
            <span className="text-xl flex-shrink-0">{item.emoji || "📁"}</span>
          )}
          <div>
            <p className="font-medium text-gray-800 text-sm">{item.name}</p>
            <div className="mt-0.5">
              <SubBadge parentName={parentName} />
            </div>
          </div>
        </div>
      </td>
      <td className="py-3 px-5 text-xs font-mono text-gray-400">{item.slug}</td>
      <td className="py-3 px-5 text-xs text-gray-500 max-w-xs truncate">{item.description || "—"}</td>
      <td className="py-3 px-5">
        <span className="text-xs text-gray-400">—</span>
      </td>
      <td className="py-3 px-5">
        <StatusBadge status={item.status} />
      </td>
      <td className="py-3 px-5">
        <ActionMenu
          item={item}
          onEdit={onEdit}
          onToggleStatus={onToggleStatus}
          onDelete={onDelete}
        />
      </td>
    </tr>
  );
}

function MobileCard({ item, isChild, parentName, onEdit, onToggleStatus, onAddSubcategory, onDelete }) {
  return (
    <div className={`border-b border-gray-100 px-4 py-3.5 ${isChild ? "bg-gray-50/80 pl-8" : "bg-white"}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 min-w-0">
          <span className="text-2xl flex-shrink-0">{item.emoji || (isChild ? "📁" : "📦")}</span>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 text-sm leading-tight">{item.name}</p>
            <div className="mt-1">
              {item.type === "Parent" ? <ParentBadge /> : <SubBadge parentName={parentName} />}
            </div>
            <p className="text-xs font-mono text-gray-400 mt-1 truncate">{item.slug}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 pt-0.5">
          <StatusBadge status={item.status} />
          <ActionMenu
            item={item}
            onEdit={onEdit}
            onToggleStatus={onToggleStatus}
            onAddSubcategory={onAddSubcategory}
            onDelete={onDelete}
          />
        </div>
      </div>
      {item.description && (
        <div className="mt-2 pl-9">
          <p className="text-xs text-gray-500 line-clamp-1">{item.description}</p>
        </div>
      )}
    </div>
  );
}

function ModalBase({ title, subtitle, onClose, children, footer }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] z-10 flex flex-col border border-gray-100">
        <div className="flex items-start justify-between px-6 pt-5 pb-4 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{title}</h2>
            <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 rounded-lg p-1 hover:bg-gray-100 text-xl leading-none transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="border-t border-gray-100" />
        <div className="px-6 py-4 space-y-4 flex-1 overflow-y-auto">{children}</div>
        <div className="border-t border-gray-100 shrink-0" />
        <div className="flex items-center justify-end gap-3 px-6 py-4 shrink-0 bg-gray-50/50 rounded-b-2xl">
          {footer}
        </div>
      </div>
    </div>
  );
}

function FormInput({ label, required, children }) {
  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function ParentCategoryDropdown({ categories, value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useOutsideClick(ref, () => setOpen(false));
  const selected = value === "" ? null : categories.find((c) => String(c.id) === String(value));

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full border border-gray-200 focus:border-orange-400 rounded-lg px-3 py-2.5 text-sm bg-white flex items-center justify-between transition-colors shadow-xs"
      >
        <span className="flex items-center gap-2">
          {selected ? (
            <>
              <span className="text-base">{selected.emoji || "📦"}</span>
              <span className="text-gray-800 font-semibold">{selected.name}</span>
            </>
          ) : (
            <span className="text-gray-500 font-medium">🚫 None (Create as Top-Level Parent)</span>
          )}
        </span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto">
          <button
            type="button"
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-left transition-colors"
            style={
              value === ""
                ? { backgroundColor: "#FFF7ED", color: "#F97316" }
                : { color: "#4B5563" }
            }
          >
            <span>🚫</span>
            <span>None (Create as Top-Level Parent)</span>
          </button>
          <div className="border-t border-gray-100 mx-3" />
          {categories.map((cat) => {
            const sel = String(value) === String(cat.id);
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  onChange(cat.id);
                  setOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left hover:bg-gray-50 transition-colors"
                style={sel ? { backgroundColor: "#FFF7ED" } : {}}
              >
                <span className="text-base">{cat.emoji || "📦"}</span>
                <span className={`font-medium ${sel ? "text-orange-600 font-bold" : "text-gray-700"}`}>
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

const inputCls =
  "w-full border border-gray-200 focus:border-orange-400 focus:ring-1 focus:ring-orange-400 outline-none rounded-lg px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 transition-colors shadow-xs";

const POPULAR_EMOJIS = [
  "📦", "💻", "📱", "🎧", "⌚",
  "👕", "👗", "👟", "👜", "💄",
  "🌿", "🏡", "⚽", "📚", "🎮",
  "🧸", "💎", "🚗", "🍕", "🛒"
];

function EmojiInput({ value, onChange }) {
  const [openPicker, setOpenPicker] = useState(false);
  const ref = useRef(null);
  useOutsideClick(ref, () => setOpenPicker(false));

  return (
    <div className="relative" ref={ref}>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setOpenPicker((o) => !o)}
          className="flex items-center justify-center w-12 h-10 border border-gray-200 rounded-lg text-2xl hover:border-orange-400 bg-gray-50 hover:bg-orange-50/50 transition-all shadow-xs shrink-0"
          title="Pick Emoji"
        >
          {value || "📦"}
        </button>
        <input
          type="text"
          className={inputCls}
          placeholder="Icon / Emoji (e.g. 💻)"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>

      {openPicker && (
        <div className="absolute left-0 top-full mt-2 p-3 bg-white border border-gray-200 rounded-xl shadow-xl z-50 w-72">
          <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
            Select Icon
          </p>
          <div className="grid grid-cols-5 gap-1.5">
            {POPULAR_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => {
                  onChange(emoji);
                  setOpenPicker(false);
                }}
                className={`text-2xl p-2 rounded-lg hover:bg-orange-50 transition-all flex items-center justify-center ${
                  value === emoji ? "bg-orange-100 ring-2 ring-orange-400" : ""
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatusDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useOutsideClick(ref, () => setOpen(false));
  const options = ["Active", "Inactive"];

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full border border-gray-200 focus:border-orange-400 rounded-lg px-3 py-2.5 text-sm bg-white flex items-center justify-between transition-colors shadow-xs"
      >
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${value === "Active" ? "bg-emerald-500" : "bg-gray-400"}`}
          />
          <span className="text-gray-800 font-semibold">{value}</span>
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
          {options.map((opt) => {
            const sel = value === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-colors ${
                  sel ? "bg-orange-50 text-orange-600 font-bold" : "hover:bg-gray-50 text-gray-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${opt === "Active" ? "bg-emerald-500" : "bg-gray-400"}`}
                  />
                  <span>{opt}</span>
                </div>
                {sel && (
                  <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CategoryFormFields({ form, setForm, parentDropdown }) {
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadAPI.uploadImage(file);
      if (res?.url) {
        setForm((f) => ({ ...f, image: res.url }));
      }
    } catch (err) {
      console.error("Image upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      {parentDropdown && (
        <FormInput label="Parent Category">
          {parentDropdown}
        </FormInput>
      )}

      <FormInput label="Category Name" required>
        <input
          type="text"
          className={inputCls}
          placeholder="e.g. Menswear or Electronics"
          value={form.name}
          autoFocus
          onChange={(e) => {
            const n = e.target.value;
            setForm((f) => ({
              ...f,
              name: n,
              slug: n
                .toLowerCase()
                .trim()
                .replace(/\s+/g, "-")
                .replace(/[^a-z0-9-]/g, ""),
            }));
          }}
        />
      </FormInput>

      <FormInput label="Slug (URL identifier)" required>
        <input
          type="text"
          className={inputCls}
          placeholder="e.g. menswear"
          value={form.slug}
          onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
        />
      </FormInput>

      <FormInput label="Description">
        <textarea
          className={`${inputCls} resize-none`}
          rows={2}
          placeholder="Brief category summary"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        />
      </FormInput>

      <div className="grid grid-cols-2 gap-3">
        <FormInput label="Icon / Emoji">
          <EmojiInput
            value={form.emoji}
            onChange={(v) => setForm((f) => ({ ...f, emoji: v }))}
          />
        </FormInput>

        <FormInput label="Status">
          <StatusDropdown
            value={form.status}
            onChange={(v) => setForm((f) => ({ ...f, status: v }))}
          />
        </FormInput>
      </div>

      <FormInput label="Category Banner / Image">
        <div className="flex items-center gap-3">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="text-xs text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-orange-50 file:text-orange-600 hover:file:bg-orange-100 cursor-pointer"
          />
          {uploading && <span className="text-xs text-orange-500 font-medium">Uploading...</span>}
        </div>
        {form.image && (
          <div className="mt-2 flex items-center gap-3">
            <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
              <img src={form.image} alt="Preview" className="w-full h-full object-cover" />
            </div>
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, image: "" }))}
              className="text-xs text-red-500 hover:underline"
            >
              Remove image
            </button>
          </div>
        )}
      </FormInput>
    </>
  );
}

const OrangeBtn = ({ onClick, disabled, children }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="px-5 py-2.5 text-sm font-semibold text-white rounded-xl transition-all shadow-sm hover:opacity-95 active:scale-98 disabled:opacity-50"
    style={{ backgroundColor: "#F97316" }}
  >
    {children}
  </button>
);

const GrayBtn = ({ onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className="px-5 py-2.5 text-sm font-semibold text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
  >
    {children}
  </button>
);

function EditCategoryModal({ onClose, item, categories, onRefresh, showToastMsg }) {
  const isSubcategory = item.type === "Subcategory";
  const [form, setForm] = useState({
    name: item.name || "",
    slug: item.slug || "",
    description: item.description || "",
    emoji: item.emoji || (isSubcategory ? "📁" : "📦"),
    image: item.image || "",
    parent: item.parentId || "",
    status: item.status === "active" ? "Active" : "Inactive",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!form.name.trim()) return;
    setSubmitting(true);
    try {
      await categoriesAPI.update(item.id, {
        name: form.name.trim(),
        slug: form.slug.trim(),
        description: form.description,
        icon: form.emoji,
        image: form.image,
        parentCategory: form.parent || null,
        isActive: form.status === "Active",
      });
      showToastMsg(`${isSubcategory ? "Subcategory" : "Category"} updated successfully`);
      onRefresh();
      onClose();
    } catch (err) {
      console.error(err);
      showToastMsg(err.message || "Failed to update category");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalBase
      title={`Edit ${isSubcategory ? "Subcategory" : "Category"}`}
      subtitle={`Update details for "${item.name}"`}
      onClose={onClose}
      footer={
        <>
          <GrayBtn onClick={onClose}>Cancel</GrayBtn>
          <OrangeBtn onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Saving..." : "Save Changes"}
          </OrangeBtn>
        </>
      }
    >
      <CategoryFormFields
        form={form}
        setForm={setForm}
        parentDropdown={
          isSubcategory ? (
            <ParentCategoryDropdown
              categories={categories.filter((c) => c.id !== item.id)}
              value={form.parent}
              onChange={(v) => setForm((f) => ({ ...f, parent: v }))}
            />
          ) : null
        }
      />
    </ModalBase>
  );
}

function AddCategoryModal({ onClose, categories, defaultParentId = "", onRefresh, showToastMsg }) {
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    parent: defaultParentId || "",
    emoji: defaultParentId ? "📁" : "📦",
    image: "",
    status: "Active",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setForm((f) => ({
      ...f,
      parent: defaultParentId || "",
      emoji: defaultParentId ? "📁" : (f.emoji || "📦"),
    }));
  }, [defaultParentId]);

  const handleSubmit = async () => {
    if (!form.name.trim()) return;
    setSubmitting(true);
    try {
      const generatedSlug =
        form.slug?.trim() ||
        form.name
          .trim()
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "");

      await categoriesAPI.create({
        name: form.name.trim(),
        slug: generatedSlug,
        description: form.description,
        icon: form.emoji,
        image: form.image,
        parentCategory: form.parent || null,
        isActive: form.status === "Active",
      });
      showToastMsg(`${form.parent ? "Subcategory" : "Category"} created successfully`);
      onRefresh();
      onClose();
    } catch (err) {
      console.error(err);
      showToastMsg(err.message || "Failed to create category");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalBase
      title={form.parent ? "Add New Subcategory" : "Add New Category"}
      subtitle={
        form.parent
          ? "Create a subcategory under the selected parent"
          : "Create a top-level product category or choose a parent below"
      }
      onClose={onClose}
      footer={
        <>
          <GrayBtn onClick={onClose}>Cancel</GrayBtn>
          <OrangeBtn onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Adding..." : form.parent ? "Add Subcategory" : "Add Category"}
          </OrangeBtn>
        </>
      }
    >
      {form.parent && (
        <div className="flex items-center gap-2 px-3.5 py-2.5 bg-orange-50 border border-orange-200 rounded-xl text-xs text-orange-800 font-medium">
          <span>📁 Creating as subcategory under:</span>
          <span className="font-bold text-orange-950">
            {categories.find((c) => String(c.id) === String(form.parent))?.name || "Parent Category"}
          </span>
        </div>
      )}
      <CategoryFormFields
        form={form}
        setForm={setForm}
        parentDropdown={
          <ParentCategoryDropdown
            categories={categories}
            value={form.parent}
            onChange={(v) =>
              setForm((f) => ({
                ...f,
                parent: v,
                emoji: v ? (f.emoji === "📦" ? "📁" : f.emoji) : f.emoji,
              }))
            }
          />
        }
      />
    </ModalBase>
  );
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [showModal, setShowModal] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState("");
  const [editItem, setEditItem] = useState(null);
  const [toast, setToast] = useState(null);
  const [expandedParents, setExpandedParents] = useState({});

  const loadCategories = () => {
    categoriesAPI
      .getAll()
      .then((data) => {
        const raw = Array.isArray(data) ? data : data?.data || [];
        const mapped = raw.map((c) => ({
          id: c._id,
          name: c.name,
          type: "Parent",
          slug: c.slug || c.name.toLowerCase().replace(/\s+/g, "-"),
          description: c.description || "",
          image: c.image || "",
          products: c.productCount || 0,
          status: c.isActive !== false ? "active" : "inactive",
          emoji: c.icon || "📂",
          children: (c.subCategories || []).map((sc, i) => ({
            id: sc._id || `${c._id}-sub-${i}`,
            parentId: c._id,
            parentName: c.name,
            name: typeof sc === "string" ? sc : sc.name,
            type: "Subcategory",
            slug: (typeof sc === "string" ? sc : sc.slug || sc.name)
              .toLowerCase()
              .replace(/\s+/g, "-"),
            description: sc.description || "",
            image: sc.image || "",
            products: sc.productCount || 0,
            status: sc.isActive !== false ? "active" : "inactive",
            emoji: sc.icon || "📁",
          })),
        }));

        setCategories(mapped);

        // Auto-expand all parents with children by default
        setExpandedParents((prev) => {
          const next = { ...prev };
          mapped.forEach((cat) => {
            if (next[cat.id] === undefined) {
              next[cat.id] = true;
            }
          });
          return next;
        });
      })
      .catch((err) => console.error("Categories fetch error:", err));
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const toggleExpand = (id) => {
    setExpandedParents((p) => ({ ...p, [id]: !p[id] }));
  };

  const allItems = categories.flatMap((c) => [c, ...(c.children || [])]);
  const stats = [
    { label: "Total Categories", value: String(allItems.length), color: "text-gray-900" },
    {
      label: "Active",
      value: String(allItems.filter((i) => i.status === "active").length),
      color: "text-emerald-600",
    },
    {
      label: "Inactive",
      value: String(allItems.filter((i) => i.status === "inactive").length),
      color: "text-gray-600",
    },
    { label: "Parent Categories", value: String(categories.length), color: "text-gray-900" },
    {
      label: "Subcategories",
      value: String(categories.reduce((s, c) => s + (c.children?.length || 0), 0)),
      color: "text-gray-900",
    },
    {
      label: "Total Products",
      value: categories.reduce((s, i) => s + (i.products || 0), 0).toLocaleString(),
      color: "text-orange-500",
    },
  ];

  const statusOptions = [
    { value: "All Status", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];

  const typeOptions = [
    { value: "All Types", label: "All Types" },
    { value: "Parent", label: "Parent Only" },
    { value: "Subcategory", label: "Subcategories Only" },
  ];

  // Robust Search & Filter Logic
  const filtered = categories
    .map((cat) => {
      const s = search.toLowerCase().trim();

      const matchingChildren = (cat.children || []).filter((ch) => {
        const matchesSearch =
          !s || ch.name.toLowerCase().includes(s) || ch.slug.toLowerCase().includes(s);
        const matchesStatus = statusFilter === "All Status" || ch.status === statusFilter;
        return matchesSearch && matchesStatus;
      });

      const parentMatchesSearch =
        !s || cat.name.toLowerCase().includes(s) || cat.slug.toLowerCase().includes(s);
      const parentMatchesStatus = statusFilter === "All Status" || cat.status === statusFilter;

      if (typeFilter === "Subcategory") {
        if (matchingChildren.length === 0) return null;
        return {
          ...cat,
          hideParent: true,
          children: matchingChildren,
        };
      }

      if (typeFilter === "Parent") {
        if (parentMatchesSearch && parentMatchesStatus) {
          return {
            ...cat,
            children: [],
          };
        }
        return null;
      }

      // "All Types"
      if ((parentMatchesSearch && parentMatchesStatus) || matchingChildren.length > 0) {
        return {
          ...cat,
          hideParent: !(parentMatchesSearch && parentMatchesStatus),
          children: s || statusFilter !== "All Status" ? matchingChildren : cat.children,
        };
      }

      return null;
    })
    .filter(Boolean);

  const showToastMsg = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleToggleStatus = async (item) => {
    const newStatus = item.status === "active" ? "inactive" : "active";
    try {
      await categoriesAPI.update(item.id, { isActive: newStatus === "active" });
      showToastMsg(`"${item.name}" is now ${newStatus}`);
      loadCategories();
    } catch (err) {
      showToastMsg(err.message || "Failed to update status");
    }
  };

  const handleDelete = async (item) => {
    const isSub = item.type === "Subcategory";
    if (
      !window.confirm(
        `Are you sure you want to delete ${isSub ? "subcategory" : "category"} "${item.name}"?`
      )
    ) {
      return;
    }
    try {
      await categoriesAPI.delete(item.id);
      showToastMsg(`${isSub ? "Subcategory" : "Category"} deleted successfully`);
      loadCategories();
    } catch (err) {
      showToastMsg(err.message || "Failed to delete category");
    }
  };

  const handleAddSubcategory = (parentItem) => {
    setSelectedParentId(parentItem.id);
    setShowModal(true);
  };

  const rowProps = {
    onEdit: setEditItem,
    onToggleStatus: handleToggleStatus,
    onAddSubcategory: handleAddSubcategory,
    onDelete: handleDelete,
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 bg-gray-900 text-white text-sm font-medium px-4 py-3 rounded-xl shadow-xl whitespace-nowrap animate-in fade-in">
          <span className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </span>
          {toast}
        </div>
      )}

      {editItem && (
        <EditCategoryModal
          item={editItem}
          categories={categories}
          onClose={() => setEditItem(null)}
          onRefresh={loadCategories}
          showToastMsg={showToastMsg}
        />
      )}

      {showModal && (
        <AddCategoryModal
          defaultParentId={selectedParentId}
          categories={categories}
          onClose={() => {
            setShowModal(false);
            setSelectedParentId("");
          }}
          onRefresh={loadCategories}
          showToastMsg={showToastMsg}
        />
      )}

      <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-screen-xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Categories</h1>
            <p className="text-sm text-gray-500 mt-1">
              Organize top-level categories, subcategories, and hierarchies
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSelectedParentId("");
              setShowModal(true);
            }}
            className="flex items-center gap-2 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm hover:opacity-95 active:scale-98 shrink-0"
            style={{ backgroundColor: "#F97316" }}
          >
            <span className="text-base font-bold">+</span>
            <span>Add Category</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {stats.map((s) => (
            <div key={s.label} className="bg-white rounded-xl p-4 border border-gray-200 shadow-xs">
              <p className="text-xs text-gray-500 mb-1 leading-snug font-medium">{s.label}</p>
              <p className={`text-2xl sm:text-3xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Table card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          {/* Toolbar */}
          <div className="px-4 sm:px-5 py-3.5 border-b border-gray-100 bg-gray-50/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-base font-bold text-gray-900">All Categories</h2>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative flex-1 sm:flex-none min-w-0">
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
                    />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search category or subcategory..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 pr-3 py-2 border border-gray-200 focus:border-orange-400 outline-none rounded-lg text-sm text-gray-700 placeholder-gray-400 w-full sm:w-56 lg:w-64 transition-colors shadow-xs"
                  />
                </div>
                <CustomDropdown
                  value={statusFilter}
                  onChange={setStatusFilter}
                  options={statusOptions}
                />
                <CustomDropdown
                  value={typeFilter}
                  onChange={setTypeFilter}
                  options={typeOptions}
                />
              </div>
            </div>
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/30">
                  <th className="py-3 px-5 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                    Category / Subcategory
                  </th>
                  <th className="py-3 px-5 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                    Slug
                  </th>
                  <th className="py-3 px-5 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                    Description
                  </th>
                  <th className="py-3 px-5 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                    Products
                  </th>
                  <th className="py-3 px-5 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="py-3 px-5 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((cat) => (
                  <React.Fragment key={cat.id}>
                    {!cat.hideParent && (
                      <ParentRow
                        item={cat}
                        isExpanded={expandedParents[cat.id] !== false}
                        onToggleExpand={() => toggleExpand(cat.id)}
                        {...rowProps}
                      />
                    )}
                    {(expandedParents[cat.id] !== false || cat.hideParent) &&
                      cat.children.map((ch) => (
                        <ChildRow
                          key={ch.id}
                          item={ch}
                          parentName={cat.name}
                          {...rowProps}
                        />
                      ))}
                  </React.Fragment>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-sm text-gray-400">
                      No categories found matching your filters
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-gray-100">
            {filtered.map((cat) => (
              <React.Fragment key={cat.id}>
                {!cat.hideParent && (
                  <MobileCard
                    item={cat}
                    isChild={false}
                    {...rowProps}
                  />
                )}
                {cat.children.map((ch) => (
                  <MobileCard
                    key={ch.id}
                    item={ch}
                    isChild={true}
                    parentName={cat.name}
                    {...rowProps}
                  />
                ))}
              </React.Fragment>
            ))}
            {filtered.length === 0 && (
              <div className="py-16 text-center text-sm text-gray-400">
                No categories found matching your filters
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}