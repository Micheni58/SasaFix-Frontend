import { useState, useEffect, useCallback, useMemo } from "react";
import Sidebar from "../../layout/Sidebar";
import Navbar from "../../components/Navbar";
import { useToast } from "../../components/ui/ToastProvider";

const BRAND = "#056db3";
const BRAND_DARK = "#04599a";
const BRAND_LIGHT = "#e8f3fb";

const API = "http://localhost:8000/api/admin/categories";

const EMOJI_CHOICES = [
  "🔧",
  "⚡",
  "🪚",
  "🧹",
  "🎨",
  "🌿",
  "🚚",
  "❄️",
  "📹",
  "💅",
  "📚",
  "🛠️",
  "🚿",
  "🔌",
  "🏠",
  "🧰",
  "🐕",
  "🚗",
  "🍳",
  "💻",
];

const inputCls =
  "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 bg-white outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

const Label = ({ children, htmlFor }) => (
  <label
    htmlFor={htmlFor}
    className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide"
  >
    {children}
  </label>
);

const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const errorMessage = (detail, fallback) => {
  if (Array.isArray(detail)) return detail.map((d) => d.msg).join(", ");
  return detail || fallback;
};

// Small fetch wrapper: adds the token, parses JSON, throws Error with .status
async function api(path = "", options = {}) {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    // empty body
  }

  if (!res.ok) {
    const err = new Error(errorMessage(data?.detail, "Request failed"));
    err.status = res.status;
    throw err;
  }

  return data;
}

// ─────────────────────────────────────────────────────────────
// Category card
// ─────────────────────────────────────────────────────────────

const CategoryCard = ({ category, busy, onEdit, onToggle, onDelete }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col">
    <div className={category.is_active ? "" : "opacity-50"}>
      <div className="flex items-start gap-3 mb-3">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
          style={{ backgroundColor: BRAND_LIGHT }}
        >
          {category.icon || "📁"}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-base font-bold text-gray-900 truncate">
            {category.name}
          </h3>
          <p className="text-xs text-gray-400 truncate">/{category.slug}</p>
        </div>
      </div>

      <p className="text-sm text-gray-500 line-clamp-2 min-h-10 mb-4">
        {category.description || "No description yet."}
      </p>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="rounded-xl bg-gray-50 px-3 py-2">
          <p className="text-lg font-bold text-gray-900">
            {category.providers_count}
          </p>
          <p className="text-xs text-gray-400">Providers</p>
        </div>
        <div className="rounded-xl bg-gray-50 px-3 py-2">
          <p className="text-lg font-bold text-gray-900">
            {category.bookings_count}
          </p>
          <p className="text-xs text-gray-400">Bookings</p>
        </div>
        <div className="rounded-xl bg-gray-50 px-3 py-2">
          <p className="text-lg font-bold text-gray-900">
            {category.display_order}
          </p>
          <p className="text-xs text-gray-400">Order</p>
        </div>
      </div>
    </div>

    <div className="flex items-center gap-2 mt-auto">
      <span
        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
          category.is_active
            ? "bg-green-100 text-green-700"
            : "bg-gray-200 text-gray-600"
        }`}
      >
        {category.is_active ? "Active" : "Hidden"}
      </span>

      <div className="flex gap-1.5 ml-auto">
        <button
          onClick={() => onEdit(category)}
          disabled={busy}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-colors hover:bg-blue-50 disabled:opacity-50"
          style={{ borderColor: BRAND, color: BRAND }}
        >
          Edit
        </button>
        <button
          onClick={() => onToggle(category)}
          disabled={busy}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
        >
          {category.is_active ? "Hide" : "Show"}
        </button>
        <button
          onClick={() => onDelete(category)}
          disabled={busy}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────
// Modal shell (backdrop, Escape to close)
// ─────────────────────────────────────────────────────────────

const ModalShell = ({ title, onClose, locked, children }) => {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && !locked) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, locked]);

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !locked) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6"
      >
        <h2 className="text-xl font-bold text-gray-900 mb-4">{title}</h2>
        {children}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Add / Edit modal
// ─────────────────────────────────────────────────────────────

const CategoryModal = ({ category, onClose, onSaved }) => {
  const toast = useToast();
  const isEdit = Boolean(category);

  const [form, setForm] = useState(() =>
    category
      ? {
          name: category.name,
          slug: category.slug,
          description: category.description || "",
          icon: category.icon || "",
          is_active: category.is_active,
          display_order: String(category.display_order ?? ""),
        }
      : {
          name: "",
          slug: "",
          description: "",
          icon: "",
          is_active: true,
          display_order: "",
        },
  );
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  const setField = (key, value) => setForm((p) => ({ ...p, [key]: value }));

  const handleName = (value) =>
    setForm((p) => ({
      ...p,
      name: value,
      slug: slugTouched ? p.slug : slugify(value),
    }));

  const renaming = isEdit && form.name.trim() !== category.name;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.name.trim().length < 2) {
      toast.error("Name is too short", "Use at least 2 characters.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim() || slugify(form.name),
      description: form.description.trim(),
      icon: form.icon.trim(),
      is_active: form.is_active,
    };

    if (form.display_order !== "") {
      const order = parseInt(form.display_order, 10);
      if (!Number.isNaN(order)) payload.display_order = order;
    }

    setSaving(true);

    try {
      const saved = isEdit
        ? await api(`/${category.id}`, {
            method: "PATCH",
            body: JSON.stringify(payload),
          })
        : await api("/", {
            method: "POST",
            body: JSON.stringify(payload),
          });

      toast.success(
        isEdit ? "Category updated" : "Category created",
        `${saved.name} has been saved.`,
      );
      onSaved();
    } catch (err) {
      toast.error("Save failed", err.message || "Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell
      title={isEdit ? "Edit category" : "Add category"}
      onClose={onClose}
      locked={saving}
    >
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <Label htmlFor="cat-name">Name</Label>
          <input
            id="cat-name"
            autoFocus
            className={inputCls}
            value={form.name}
            placeholder="e.g. Home Cleaning"
            maxLength={60}
            onChange={(e) => handleName(e.target.value)}
          />
          {renaming && (
            <p className="text-xs text-amber-600 mt-1">
              Renaming also updates the category on every provider using it.
            </p>
          )}
        </div>

        <div className="mb-4">
          <Label htmlFor="cat-slug">Slug</Label>
          <input
            id="cat-slug"
            className={inputCls}
            value={form.slug}
            placeholder="home-cleaning"
            onChange={(e) => {
              setSlugTouched(true);
              setField("slug", slugify(e.target.value));
            }}
          />
          <p className="text-xs text-gray-400 mt-1">
            Used in URLs and filters. Created from the name unless you edit it.
          </p>
        </div>

        <div className="mb-4">
          <Label htmlFor="cat-desc">Description</Label>
          <textarea
            id="cat-desc"
            className={inputCls}
            rows={3}
            maxLength={300}
            value={form.description}
            placeholder="One or two sentences clients will see on Find Services."
            onChange={(e) => setField("description", e.target.value)}
            style={{ resize: "vertical" }}
          />
          <p className="text-xs text-gray-400 mt-1">
            {form.description.length} / 300
          </p>
        </div>

        <div className="mb-4">
          <Label htmlFor="cat-icon">Icon</Label>
          <input
            id="cat-icon"
            className={inputCls}
            value={form.icon}
            placeholder="Type or paste an emoji"
            maxLength={8}
            onChange={(e) => setField("icon", e.target.value)}
          />
          <div className="flex flex-wrap gap-1.5 mt-2">
            {EMOJI_CHOICES.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setField("icon", emoji)}
                aria-label={`Use ${emoji}`}
                className="w-9 h-9 rounded-lg text-lg flex items-center justify-center border transition-colors hover:bg-blue-50"
                style={{
                  borderColor: form.icon === emoji ? BRAND : "#e5e7eb",
                  backgroundColor: form.icon === emoji ? BRAND_LIGHT : "white",
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <Label>Status</Label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: true, label: "Active" },
                { value: false, label: "Hidden" },
              ].map((option) => (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => setField("is_active", option.value)}
                  className="px-3 py-2.5 rounded-lg text-sm font-semibold border-2 transition-colors"
                  style={{
                    borderColor:
                      form.is_active === option.value ? BRAND : "#e5e7eb",
                    backgroundColor:
                      form.is_active === option.value ? BRAND_LIGHT : "white",
                    color: form.is_active === option.value ? BRAND : "#6b7280",
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {form.is_active
                ? "Visible to clients."
                : "Kept in the system, hidden from clients."}
            </p>
          </div>

          <div>
            <Label htmlFor="cat-order">Display order</Label>
            <input
              id="cat-order"
              className={inputCls}
              type="number"
              min="0"
              value={form.display_order}
              placeholder="Last"
              onChange={(e) => setField("display_order", e.target.value)}
            />
            <p className="text-xs text-gray-400 mt-1">
              Lower numbers appear first.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-60 transition-colors"
            style={{ backgroundColor: BRAND }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = BRAND_DARK;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = BRAND;
            }}
          >
            {saving ? "Saving..." : isEdit ? "Save changes" : "Add category"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
};

// ─────────────────────────────────────────────────────────────
// Delete confirmation (offers "Hide instead" when the server blocks it)
// ─────────────────────────────────────────────────────────────

const DeleteModal = ({ category, onClose, onDeleted, onHideInstead }) => {
  const toast = useToast();
  const [deleting, setDeleting] = useState(false);
  const [blockedReason, setBlockedReason] = useState("");

  const confirmDelete = async () => {
    setDeleting(true);
    setBlockedReason("");

    try {
      await api(`/${category.id}`, { method: "DELETE" });
      toast.success("Category deleted", `${category.name} has been removed.`);
      onDeleted();
    } catch (err) {
      if (err.status === 409) {
        setBlockedReason(err.message);
      } else {
        toast.error("Delete failed", err.message || "Please try again.");
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <ModalShell title="Delete category" onClose={onClose} locked={deleting}>
      {blockedReason ? (
        <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 mb-5">
          <p className="text-sm font-semibold text-amber-800">
            This category can't be deleted
          </p>
          <p className="text-sm text-amber-700 mt-1">{blockedReason}</p>
        </div>
      ) : (
        <p className="text-sm text-gray-600 mb-5">
          Delete <strong>{category.name}</strong>? This can't be undone. If
          providers or open bookings use it, you'll be asked to hide it instead.
        </p>
      )}

      <div className="flex justify-end gap-3">
        <button
          onClick={onClose}
          disabled={deleting}
          className="px-5 py-2.5 rounded-lg text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-60"
        >
          Cancel
        </button>

        {blockedReason ? (
          category.is_active && (
            <button
              onClick={onHideInstead}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white"
              style={{ backgroundColor: BRAND }}
            >
              Hide instead
            </button>
          )
        ) : (
          <button
            onClick={confirmDelete}
            disabled={deleting}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-60"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        )}
      </div>
    </ModalShell>
  );
};

// ─────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────

function Categories() {
  const toast = useToast();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const [editing, setEditing] = useState(undefined); // undefined = closed, null = new, object = edit
  const [deleting, setDeleting] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoadError("");
      const data = await api("/");
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      setLoadError(err.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggleActive = async (category) => {
    setBusyId(category.id);

    try {
      await api(`/${category.id}`, {
        method: "PATCH",
        body: JSON.stringify({ is_active: !category.is_active }),
      });

      toast.success(
        category.is_active ? "Category hidden" : "Category visible",
        category.is_active
          ? `${category.name} no longer appears to clients.`
          : `${category.name} is visible to clients again.`,
      );
      await load();
    } catch (err) {
      toast.error("Update failed", err.message || "Please try again.");
    } finally {
      setBusyId(null);
    }
  };

  const counts = useMemo(
    () => ({
      all: categories.length,
      active: categories.filter((c) => c.is_active).length,
      hidden: categories.filter((c) => !c.is_active).length,
    }),
    [categories],
  );

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();

    return categories.filter((c) => {
      if (filter === "active" && !c.is_active) return false;
      if (filter === "hidden" && c.is_active) return false;
      if (!term) return true;

      return (
        c.name.toLowerCase().includes(term) ||
        (c.description || "").toLowerCase().includes(term)
      );
    });
  }, [categories, filter, search]);

  const FILTERS = [
    { id: "all", label: "All" },
    { id: "active", label: "Active" },
    { id: "hidden", label: "Hidden" },
  ];

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar role="admin" />

      <div className="flex-1 ml-0 lg:ml-72">
        <Navbar />

        <main className="pt-24 px-6 pb-6">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Service Categories
              </h1>
              <p className="text-sm text-gray-400 mt-0.5">
                Control which services clients can browse and book
              </p>
            </div>

            <button
              onClick={() => setEditing(null)}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors"
              style={{ backgroundColor: BRAND }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = BRAND_DARK;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = BRAND;
              }}
            >
              Add category
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3 mb-5">
            <div className="flex gap-1.5">
              {FILTERS.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setFilter(id)}
                  className="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: filter === id ? BRAND_LIGHT : "white",
                    color: filter === id ? BRAND : "#6b7280",
                    border: `1px solid ${filter === id ? BRAND : "#e5e7eb"}`,
                  }}
                >
                  {label} ({counts[id]})
                </button>
              ))}
            </div>

            <input
              className={`${inputCls} max-w-xs ml-auto`}
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
              <p className="text-sm text-gray-500">Loading categories...</p>
            </div>
          ) : loadError ? (
            <div className="bg-white rounded-2xl border border-red-100 p-10 text-center">
              <p className="text-sm font-semibold text-red-600 mb-1">
                Couldn't load categories
              </p>
              <p className="text-sm text-gray-500 mb-4">{loadError}</p>
              <button
                onClick={() => {
                  setLoading(true);
                  load();
                }}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white"
                style={{ backgroundColor: BRAND }}
              >
                Try again
              </button>
            </div>
          ) : visible.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
              <p className="text-sm text-gray-500">
                {categories.length === 0
                  ? "No categories yet. Add your first one to get started."
                  : "No categories match your filter."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {visible.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  busy={busyId === category.id}
                  onEdit={setEditing}
                  onToggle={toggleActive}
                  onDelete={setDeleting}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {editing !== undefined && (
        <CategoryModal
          key={editing?.id ?? "new"}
          category={editing}
          onClose={() => setEditing(undefined)}
          onSaved={() => {
            setEditing(undefined);
            load();
          }}
        />
      )}

      {deleting && (
        <DeleteModal
          category={deleting}
          onClose={() => setDeleting(null)}
          onDeleted={() => {
            setDeleting(null);
            load();
          }}
          onHideInstead={() => {
            const target = deleting;
            setDeleting(null);
            toggleActive(target);
          }}
        />
      )}
    </div>
  );
}

export default Categories;
