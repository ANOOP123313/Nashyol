import { useState, useEffect } from "react";
import { toast } from "sonner";
import { cmsAPI, categoriesAPI, uploadAPI } from "../services/api";

const SECTION_TYPES = [
  { value: "hero_banner", label: "Hero Banner Carousel" },
  { value: "service_features", label: "Service / Feature Cards (Glass Cards)" },
  { value: "promo_carousel", label: "Promo / Flash Deals Carousel" },
  { value: "quick_categories", label: "Quick Category Icons Grid" },
  { value: "loved_ones", label: "Shop for Loved Ones" },
  { value: "promotional_cards", label: "Promotional / Festival Specials" },
  { value: "clearance_offers", label: "Clearance Offers" },
  { value: "shop_by_category", label: "Shop by Category Cards" },
  { value: "special_offers", label: "Special Offers & Promotions (Ad Banner)" },
  { value: "category_products", label: "Category Products Grid (Dynamic)" },
  { value: "product_grid", label: "Product Grid (Dynamic)" },
  { value: "featured_products", label: "Featured Products (Dynamic)" },
  { value: "rewards", label: "Rewards Program Card" },
  { value: "newsletter", label: "Newsletter Section" },
  { value: "custom", label: "Custom Section" },
];

export default function HomePageSectionManager() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [editSection, setEditSection] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchSections = async () => {
    setLoading(true);
    try {
      const data = await cmsAPI.getHomePageSections();
      setSections(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch home page sections:", err);
      toast.error("Failed to load sections: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await categoriesAPI.getAll();
      const list = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
      setCategories(list);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  useEffect(() => {
    fetchSections();
    fetchCategories();
  }, []);

  const handleToggleStatus = async (sec) => {
    const newStatus = !sec.isActive;
    try {
      await cmsAPI.toggleHomePageSectionStatus(sec._id, newStatus);
      toast.success(`Section ${newStatus ? "enabled" : "disabled"}`);
      setSections((prev) =>
        prev.map((s) => (s._id === sec._id ? { ...s, isActive: newStatus } : s))
      );
    } catch (err) {
      toast.error("Failed to update status: " + err.message);
    }
  };

  const handleMove = async (index, direction) => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const newSections = [...sections];
    const temp = newSections[index];
    newSections[index] = newSections[targetIndex];
    newSections[targetIndex] = temp;

    // Update displayOrder numbers
    const orders = newSections.map((s, idx) => ({
      id: s._id,
      displayOrder: idx + 1,
    }));

    setSections(
      newSections.map((s, idx) => ({ ...s, displayOrder: idx + 1 }))
    );

    try {
      await cmsAPI.reorderHomePageSections(orders);
      toast.success("Section reordered successfully");
    } catch (err) {
      toast.error("Failed to reorder: " + err.message);
      fetchSections();
    }
  };

  const handleDelete = async (sec) => {
    if (!window.confirm(`Are you sure you want to delete the section "${sec.title || sec.sectionKey}"?`)) {
      return;
    }
    try {
      await cmsAPI.deleteHomePageSection(sec._id);
      toast.success("Section deleted");
      fetchSections();
    } catch (err) {
      toast.error("Failed to delete section: " + err.message);
    }
  };

  const handleSeedDefaults = async () => {
    if (
      !window.confirm(
        "This will reset all Home Page sections to match the default configuration. Any custom modifications will be replaced. Continue?"
      )
    ) {
      return;
    }
    try {
      await cmsAPI.seedHomePageSections();
      toast.success("Default sections restored successfully!");
      fetchSections();
    } catch (err) {
      toast.error("Failed to restore default sections: " + err.message);
    }
  };

  const filteredSections = sections.filter((s) => {
    const q = searchQuery.toLowerCase();
    return (
      (s.title && s.title.toLowerCase().includes(q)) ||
      (s.sectionKey && s.sectionKey.toLowerCase().includes(q)) ||
      (s.sectionType && s.sectionType.toLowerCase().includes(q))
    );
  });

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
      {/* Top action bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Home Page Section Manager</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Add, edit, reorder, and toggle sections on the customer-facing Home Page.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <a
            href="http://localhost:3000"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold border border-gray-200 hover:border-gray-300 text-gray-700 hover:text-gray-900 rounded-lg transition-colors bg-white shadow-xs"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            <span>Preview Home Page</span>
          </a>

          <button
            onClick={handleSeedDefaults}
            className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold border border-orange-200 hover:border-orange-300 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors bg-white"
            title="Reset to default sections if needed"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Restore Defaults</span>
          </button>

          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-xs"
          >
            <span className="text-base font-bold">+</span>
            <span>Add Section</span>
          </button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="mb-4">
        <div className="relative max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search sections by title, key, or type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
        </div>
      </div>

      {/* Sections List */}
      {loading ? (
        <div className="py-16 text-center text-gray-400">Loading home page sections...</div>
      ) : filteredSections.length === 0 ? (
        <div className="py-16 text-center text-gray-400">
          <p className="text-4xl mb-3">🧩</p>
          <p className="text-base font-medium text-gray-600">No home page sections found</p>
          <p className="text-sm text-gray-400 mt-1">Click "Restore Defaults" or "Add Section" to get started.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left" style={{ minWidth: "850px" }}>
            <thead>
              <tr className="border-t border-b border-gray-100 bg-gray-50/50">
                <th className="py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-16 text-center">Order</th>
                <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Section Title & Key</th>
                <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Content Info</th>
                <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredSections.map((sec, idx) => (
                <tr key={sec._id || idx} className="hover:bg-orange-50/40 transition-colors">
                  {/* Order & Move buttons */}
                  <td className="py-3.5 px-3 text-center whitespace-nowrap">
                    <div className="inline-flex items-center gap-1">
                      <span className="font-mono text-xs font-bold bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                        #{sec.displayOrder ?? idx + 1}
                      </span>
                      <div className="flex flex-col ml-1">
                        <button
                          onClick={() => handleMove(idx, "up")}
                          disabled={idx === 0}
                          className="text-gray-400 hover:text-orange-500 disabled:opacity-20 disabled:hover:text-gray-400 leading-none p-0.5"
                          title="Move up"
                        >
                          ▲
                        </button>
                        <button
                          onClick={() => handleMove(idx, "down")}
                          disabled={idx === sections.length - 1}
                          className="text-gray-400 hover:text-orange-500 disabled:opacity-20 disabled:hover:text-gray-400 leading-none p-0.5"
                          title="Move down"
                        >
                          ▼
                        </button>
                      </div>
                    </div>
                  </td>

                  {/* Title & Key */}
                  <td className="py-3.5 px-4">
                    <div>
                      <div className="font-semibold text-sm text-gray-900">{sec.title || "Untitled Section"}</div>
                      <div className="font-mono text-xs text-gray-400 mt-0.5">{sec.sectionKey}</div>
                    </div>
                  </td>

                  {/* Section Type Badge */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                      {SECTION_TYPES.find((t) => t.value === sec.sectionType)?.label || sec.sectionType}
                    </span>
                  </td>

                  {/* Active Toggle */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleStatus(sec)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                        sec.isActive
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${sec.isActive ? "bg-green-500" : "bg-gray-400"}`} />
                      {sec.isActive ? "Active" : "Disabled"}
                    </button>
                  </td>

                  {/* Content Info */}
                  <td className="py-3.5 px-4 text-xs text-gray-500">
                    {sec.sectionType === "category_products" || sec.sectionType === "product_grid" ? (
                      <span>
                        Source: <span className="font-medium text-gray-700">{sec.settings?.sourceType || "category"}</span>
                        {sec.settings?.categoryName && ` (${sec.settings.categoryName})`}
                        {sec.settings?.productLimit && ` • Limit: ${sec.settings.productLimit}`}
                      </span>
                    ) : Array.isArray(sec.items) && sec.items.length > 0 ? (
                      <span>{sec.items.length} card items</span>
                    ) : sec.sectionType === "hero_banner" ? (
                      <span>Dynamic from Banners tab</span>
                    ) : sec.sectionType === "featured_products" ? (
                      <span>Dynamic featured products API</span>
                    ) : (
                      <span>Configured</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditSection(sec)}
                        className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:text-orange-600 bg-white hover:bg-orange-50 border border-gray-200 hover:border-orange-300 rounded-lg transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => handleDelete(sec)}
                        className="p-1.5 text-gray-400 hover:text-red-600 bg-white hover:bg-red-50 border border-gray-200 hover:border-red-300 rounded-lg transition-colors"
                        title="Delete section"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Create Section Modal */}
      {createModalOpen && (
        <SectionFormModal
          categories={categories}
          onClose={() => setCreateModalOpen(false)}
          onSuccess={() => {
            setCreateModalOpen(false);
            fetchSections();
          }}
        />
      )}

      {/* Edit Section Modal */}
      {editSection && (
        <SectionFormModal
          section={editSection}
          categories={categories}
          onClose={() => setEditSection(null)}
          onSuccess={() => {
            setEditSection(null);
            fetchSections();
          }}
        />
      )}
    </div>
  );
}

// ── ADD / EDIT SECTION MODAL ──
function SectionFormModal({ section, categories = [], onClose, onSuccess }) {
  const isEditing = Boolean(section && section._id);

  const [sectionKey, setSectionKey] = useState(section?.sectionKey || "");
  const [sectionType, setSectionType] = useState(section?.sectionType || "category_products");
  const [title, setTitle] = useState(section?.title || "");
  const [subtitle, setSubtitle] = useState(section?.subtitle || "");
  const [description, setDescription] = useState(section?.description || "");
  const [badge, setBadge] = useState(section?.badge || "");
  const [isActive, setIsActive] = useState(section?.isActive !== false);
  const [displayOrder, setDisplayOrder] = useState(section?.displayOrder || 1);

  // Settings
  const [sourceType, setSourceType] = useState(section?.settings?.sourceType || "category");
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    section?.settings?.category?._id || section?.settings?.category || ""
  );
  const [categoryName, setCategoryName] = useState(section?.settings?.categoryName || "");
  const [productLimit, setProductLimit] = useState(section?.settings?.productLimit || 8);
  const [sort, setSort] = useState(section?.settings?.sort || "-createdAt");
  const [viewAllLink, setViewAllLink] = useState(section?.settings?.viewAllLink || "");
  const [buttonText, setButtonText] = useState(section?.settings?.buttonText || "");
  const [buttonLink, setButtonLink] = useState(section?.settings?.buttonLink || "");
  const [placeholder, setPlaceholder] = useState(section?.settings?.placeholder || "");

  // Items
  const [items, setItems] = useState(Array.isArray(section?.items) ? section.items : []);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("general"); // "general" | "items" | "settings"

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        name: `Item ${prev.length + 1}`,
        title: `Item ${prev.length + 1}`,
        subtitle: "",
        description: "",
        image: "",
        link: "",
        buttonText: "Shop Now",
        buttonLink: "/category",
        price: "",
        discount: "",
        badge: "",
        gradient: "from-orange-500 to-amber-500",
        icon: "Truck",
        isActive: true,
        displayOrder: prev.length + 1,
      },
    ]);
  };

  const handleUpdateItem = (index, field, value) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleRemoveItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemImageUpload = async (index, file) => {
    if (!file) return;
    try {
      toast.info("Uploading item image...");
      const res = await uploadAPI.uploadImage(file);
      if (res?.url) {
        handleUpdateItem(index, "image", res.url);
        toast.success("Image uploaded!");
      }
    } catch (err) {
      toast.error("Failed to upload image: " + err.message);
    }
  };

  const handleLoadSubcategoriesAsCards = () => {
    const cat = categories.find((c) => c._id === selectedCategoryId || c.name === categoryName);
    if (!cat || !cat.subCategories || cat.subCategories.length === 0) {
      toast.error(`No subcategories found for "${categoryName || "selected category"}".`);
      return;
    }

    const subcategoryCards = cat.subCategories.map((sc, idx) => ({
      name: sc.name,
      title: sc.name,
      subtitle: sc.description || "",
      description: sc.description || "",
      image: sc.image || "",
      link: `/category?category=${encodeURIComponent(cat.name)}&subcategory=${encodeURIComponent(sc.name)}`,
      buttonLink: `/category?category=${encodeURIComponent(cat.name)}&subcategory=${encodeURIComponent(sc.name)}`,
      buttonText: "Shop Now",
      price: "",
      discount: "",
      badge: "",
      gradient: "from-orange-500 to-amber-500",
      icon: "ShoppingBag",
      isActive: true,
      displayOrder: idx + 1,
    }));

    setItems(subcategoryCards);
    toast.success(`Imported ${subcategoryCards.length} subcategories from "${cat.name}" as cards!`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!sectionKey.trim()) {
      toast.error("Section Key is required");
      return;
    }

    setLoading(true);
    const payload = {
      sectionKey: sectionKey.trim(),
      sectionType,
      title,
      subtitle,
      description,
      badge,
      isActive,
      displayOrder: Number(displayOrder),
      settings: {
        sourceType,
        category: selectedCategoryId || null,
        categoryName: categoryName || (categories.find((c) => c._id === selectedCategoryId)?.name || ""),
        productLimit: Number(productLimit),
        sort,
        viewAllLink,
        buttonText,
        buttonLink,
        placeholder,
      },
      items,
    };

    try {
      if (isEditing) {
        await cmsAPI.updateHomePageSection(section._id, payload);
        toast.success("Section updated successfully!");
      } else {
        await cmsAPI.createHomePageSection(payload);
        toast.success("Section created successfully!");
      }
      onSuccess();
    } catch (err) {
      toast.error(`Failed to ${isEditing ? "update" : "create"} section: ` + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {isEditing ? `Edit Section: ${section.title || section.sectionKey}` : "Create Home Page Section"}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Configure layout, data sources, and promotional content.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="flex border-b border-gray-200 px-6 bg-white">
          <button
            type="button"
            onClick={() => setActiveTab("general")}
            className={`py-3 px-4 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === "general"
                ? "border-orange-500 text-orange-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            1. General Settings
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("settings")}
            className={`py-3 px-4 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === "settings"
                ? "border-orange-500 text-orange-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            2. Type Specific Config
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("items")}
            className={`py-3 px-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "items"
                ? "border-orange-500 text-orange-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <span>3. Cards / Items</span>
            {items.length > 0 && (
              <span className="bg-orange-100 text-orange-600 text-xs px-2 py-0.5 rounded-full font-bold">
                {items.length}
              </span>
            )}
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: GENERAL */}
          {activeTab === "general" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Section Key <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    disabled={isEditing}
                    placeholder="e.g. panchami_specials"
                    value={sectionKey}
                    onChange={(e) => setSectionKey(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3.5 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-300 disabled:bg-gray-100"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">Unique identifier used by frontend renderer</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Section Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={sectionType}
                    onChange={(e) => setSectionType(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3.5 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
                  >
                    {SECTION_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Section Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Basant Panchami Specials"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3.5 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Badge / Tag (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 🔥 Limited Time Offers"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3.5 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Subtitle
                </label>
                <input
                  type="text"
                  placeholder="Optional section subtitle"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3.5 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Detailed description or promo text..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3.5 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3.5 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Visibility Status
                  </label>
                  <div className="flex items-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsActive(!isActive)}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        isActive ? "bg-orange-500" : "bg-gray-200"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                          isActive ? "translate-x-6" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                    <span className="text-sm font-semibold text-gray-700">
                      {isActive ? "Active on Home Page" : "Disabled (Hidden)"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TYPE SPECIFIC CONFIG */}
          {activeTab === "settings" && (
            <div className="space-y-4">
              {/* Product/Category Grid Settings */}
              {(sectionType === "category_products" || sectionType === "product_grid") && (
                <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100 space-y-4">
                  <h4 className="text-sm font-bold text-orange-900">Product Data Source Configuration</h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Source Type</label>
                      <select
                        value={sourceType}
                        onChange={(e) => setSourceType(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none"
                      >
                        <option value="category">Category Based</option>
                        <option value="featured">Featured Products</option>
                        <option value="offers">Discount / Offer Products</option>
                        <option value="latest">Latest Products</option>
                        <option value="manual">Manual Products</option>
                      </select>
                    </div>

                    {sourceType === "category" && (
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Select Category</label>
                        <select
                          value={selectedCategoryId}
                          onChange={(e) => {
                            setSelectedCategoryId(e.target.value);
                            const cat = categories.find((c) => c._id === e.target.value);
                            if (cat) setCategoryName(cat.name);
                          }}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none"
                        >
                          <option value="">-- Choose Category --</option>
                          {categories.map((c) => (
                            <option key={c._id} value={c._id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Product Limit</label>
                      <input
                        type="number"
                        min="1"
                        max="32"
                        value={productLimit}
                        onChange={(e) => setProductLimit(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Sort Order</label>
                      <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none"
                      >
                        <option value="-createdAt">Newest First</option>
                        <option value="variants.sellingPrice">Price: Low to High</option>
                        <option value="-variants.sellingPrice">Price: High to Low</option>
                        <option value="title">Alphabetical (A-Z)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">View All Link</label>
                      <input
                        type="text"
                        placeholder="/category"
                        value={viewAllLink}
                        onChange={(e) => setViewAllLink(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Rewards / Newsletter / CTA Banner Settings */}
              {(sectionType === "rewards" || sectionType === "newsletter" || sectionType === "special_offers") && (
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-4">
                  <h4 className="text-sm font-bold text-gray-800">CTA & Button Settings</h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Button Text</label>
                      <input
                        type="text"
                        placeholder="e.g. Learn More / Shop Now"
                        value={buttonText}
                        onChange={(e) => setButtonText(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Button Link / URL</label>
                      <input
                        type="text"
                        placeholder="/rewards"
                        value={buttonLink}
                        onChange={(e) => setButtonLink(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  {sectionType === "newsletter" && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Input Placeholder</label>
                      <input
                        type="text"
                        placeholder="Enter your email"
                        value={placeholder}
                        onChange={(e) => setPlaceholder(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Hero Banner Notice */}
              {sectionType === "hero_banner" && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800">
                  <p className="font-semibold">ℹ️ Hero Banner Carousel</p>
                  <p className="mt-1 text-xs text-blue-700 leading-relaxed">
                    Hero slides are managed dynamically in the <strong>Banners</strong> tab of Content Management.
                    This section controls where the Hero Banner appears on the Home Page and its active visibility.
                  </p>
                </div>
              )}

              {/* Featured Products Notice */}
              {sectionType === "featured_products" && (
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl text-sm text-purple-800">
                  <p className="font-semibold">⭐ Featured Products</p>
                  <p className="mt-1 text-xs text-purple-700 leading-relaxed">
                    This section renders items marked as <code>featured: true</code> in the Product Management module.
                    You can change the title, subtitle, product limit, and order from this form.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CARDS / ITEMS */}
          {activeTab === "items" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-bold text-gray-800">Section Cards & Items ({items.length})</h4>
                  <p className="text-xs text-gray-500">
                    Add or modify promotional cards, quick icons, or category links.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {(selectedCategoryId || categoryName) && (
                    <button
                      type="button"
                      onClick={handleLoadSubcategoriesAsCards}
                      className="flex items-center gap-1 text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-lg transition-colors"
                      title="Populate cards from the subcategories of the selected category"
                    >
                      <span>⚡ Import Subcategories as Cards</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="flex items-center gap-1 text-xs font-semibold bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <span>+ Add Item</span>
                  </button>
                </div>
              </div>

              {items.length === 0 ? (
                <div className="py-12 border-2 border-dashed border-gray-200 rounded-xl text-center text-gray-400">
                  <p className="text-sm font-medium">No items added to this section yet.</p>
                  <div className="mt-2 flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="text-xs font-semibold text-orange-500 hover:text-orange-600 underline"
                    >
                      Add card manually
                    </button>
                    {(selectedCategoryId || categoryName) && (
                      <>
                        <span className="text-gray-300">|</span>
                        <button
                          type="button"
                          onClick={handleLoadSubcategoriesAsCards}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-700 underline"
                        >
                          Import subcategories as cards
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
                  {items.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 border border-gray-200 rounded-xl bg-gray-50/50 hover:border-orange-200 transition-colors space-y-3 relative"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                        <span className="text-xs font-bold text-gray-700">Item #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="text-xs font-semibold text-red-500 hover:text-red-700"
                        >
                          ✕ Remove
                        </button>
                      </div>

                      {categories.length > 0 && (
                        <div className="bg-orange-50/60 p-2.5 rounded-lg border border-orange-100 flex flex-col sm:flex-row sm:items-center gap-2">
                          <span className="text-[11px] font-bold text-orange-800 whitespace-nowrap">
                            Auto-fill Subcategory:
                          </span>
                          <select
                            onChange={(e) => {
                              if (!e.target.value) return;
                              const [catName, subName] = e.target.value.split("::");
                              const foundCat = categories.find((c) => c.name === catName);
                              const foundSub = foundCat?.subCategories?.find((s) => s.name === subName);
                              handleUpdateItem(idx, "name", subName);
                              handleUpdateItem(idx, "title", subName);
                              const linkUrl = `/category?category=${encodeURIComponent(catName)}&subcategory=${encodeURIComponent(subName)}`;
                              handleUpdateItem(idx, "link", linkUrl);
                              handleUpdateItem(idx, "buttonLink", linkUrl);
                              if (foundSub?.image) {
                                handleUpdateItem(idx, "image", foundSub.image);
                              }
                              toast.success(`Filled card with "${subName}"`);
                            }}
                            defaultValue=""
                            className="flex-1 border border-orange-200 rounded px-2 py-1 text-xs bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-orange-400"
                          >
                            <option value="">-- Choose Subcategory to Auto-fill --</option>
                            {categories.map((cat) => (
                              <optgroup key={cat._id || cat.name} label={`${cat.icon ? `${cat.icon} ` : ""}${cat.name}`}>
                                {(cat.subCategories || []).map((sc) => (
                                  <option key={sc._id || sc.name} value={`${cat.name}::${sc.name}`}>
                                    {cat.name} › {sc.name}
                                  </option>
                                ))}
                              </optgroup>
                            ))}
                          </select>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-gray-600 mb-1">Name / Title</label>
                          <input
                            type="text"
                            value={item.name || item.title || ""}
                            onChange={(e) => {
                              handleUpdateItem(idx, "name", e.target.value);
                              handleUpdateItem(idx, "title", e.target.value);
                            }}
                            className="w-full border border-gray-200 rounded px-2.5 py-1.5 text-xs bg-white focus:outline-none"
                            placeholder="Card Title"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-gray-600 mb-1">Subtitle / Desc</label>
                          <input
                            type="text"
                            value={item.subtitle || item.description || ""}
                            onChange={(e) => {
                              handleUpdateItem(idx, "subtitle", e.target.value);
                              handleUpdateItem(idx, "description", e.target.value);
                            }}
                            className="w-full border border-gray-200 rounded px-2.5 py-1.5 text-xs bg-white focus:outline-none"
                            placeholder="Card Subtitle"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-gray-600 mb-1">Price / Discount / Offer</label>
                          <input
                            type="text"
                            value={item.price || item.discount || item.offer || ""}
                            onChange={(e) => {
                              handleUpdateItem(idx, "price", e.target.value);
                              handleUpdateItem(idx, "discount", e.target.value);
                              handleUpdateItem(idx, "offer", e.target.value);
                            }}
                            className="w-full border border-gray-200 rounded px-2.5 py-1.5 text-xs bg-white focus:outline-none"
                            placeholder="e.g. Min. 70% Off / From ₹299"
                          />
                        </div>
                      </div>

                      {/* Image Upload & URL */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                        <div>
                          <label className="block text-[11px] font-semibold text-gray-600 mb-1">Image URL</label>
                          <input
                            type="text"
                            value={item.image || ""}
                            onChange={(e) => handleUpdateItem(idx, "image", e.target.value)}
                            className="w-full border border-gray-200 rounded px-2.5 py-1.5 text-xs bg-white focus:outline-none"
                            placeholder="https://..."
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-gray-600 mb-1">Or Upload Image</label>
                          <label className="w-full border border-gray-200 rounded px-2.5 py-1.5 text-xs bg-white flex items-center justify-between cursor-pointer hover:border-gray-300">
                            <span className="text-gray-500 truncate">Choose File...</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleItemImageUpload(idx, e.target.files?.[0])}
                            />
                            <span className="text-orange-500 font-semibold text-[11px]">Upload</span>
                          </label>
                        </div>
                      </div>

                      {item.image && (
                        <div className="flex items-center gap-3 pt-1">
                          <img
                            src={item.image}
                            alt="Preview"
                            className="w-12 h-12 object-cover rounded border border-gray-200 shadow-xs"
                          />
                          <span className="text-[11px] text-gray-400 truncate max-w-xs">{item.image}</span>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-gray-600 mb-1">Link URL</label>
                          <input
                            type="text"
                            value={item.link || item.buttonLink || ""}
                            onChange={(e) => {
                              handleUpdateItem(idx, "link", e.target.value);
                              handleUpdateItem(idx, "buttonLink", e.target.value);
                            }}
                            className="w-full border border-gray-200 rounded px-2.5 py-1.5 text-xs bg-white focus:outline-none"
                            placeholder="/category?category=..."
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-gray-600 mb-1">Button Text</label>
                          <input
                            type="text"
                            value={item.buttonText || ""}
                            onChange={(e) => handleUpdateItem(idx, "buttonText", e.target.value)}
                            className="w-full border border-gray-200 rounded px-2.5 py-1.5 text-xs bg-white focus:outline-none"
                            placeholder="Shop Now"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-gray-600 mb-1">Badge / Tag</label>
                          <input
                            type="text"
                            value={item.badge || ""}
                            onChange={(e) => handleUpdateItem(idx, "badge", e.target.value)}
                            className="w-full border border-gray-200 rounded px-2.5 py-1.5 text-xs bg-white focus:outline-none"
                            placeholder="e.g. Sale / Hot"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-sm font-semibold text-gray-700 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-colors disabled:opacity-50 shadow-xs"
            >
              {loading ? "Saving..." : isEditing ? "Save Changes" : "Create Section"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
