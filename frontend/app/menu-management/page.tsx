"use client";

import { FormEvent, useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { ApiError, MenuCategory, MenuItem, menuService } from "@/services/api";

const fieldClass = "mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-800 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20";

export default function MenuManagementPage() {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingCategory, setSavingCategory] = useState(false);
  const [savingItem, setSavingItem] = useState(false);
  const [updatingItem, setUpdatingItem] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [notice, setNotice] = useState("");
  const [categoryForm, setCategoryForm] = useState({ name: "", description: "" });
  const [itemForm, setItemForm] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "",
    prepTimeMinutes: "",
    isAvailable: true,
  });

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      Promise.all([menuService.getCategories(), menuService.getAllItems()])
        .then(([loadedCategories, loadedItems]) => {
          if (!active) return;
          setCategories(loadedCategories);
          setItems(loadedItems);
          setItemForm((current) => ({
            ...current,
            categoryId: current.categoryId || loadedCategories[0]?.id || "",
          }));
          setErrorMessage("");
        })
        .catch((error: unknown) => {
          if (active) setErrorMessage(error instanceof ApiError ? error.message : "Could not load menu data.");
        })
        .finally(() => { if (active) setLoading(false); });
    }, 0);
    return () => { active = false; window.clearTimeout(timer); };
  }, []);

  const createCategory = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavingCategory(true);
    setErrorMessage("");
    setNotice("");
    try {
      const created = await menuService.createCategory({
        name: categoryForm.name.trim(),
        description: categoryForm.description.trim() || undefined,
      });
      setCategories((current) => [...current, { ...created, _count: { menuItems: 0 } }].sort((a, b) => a.name.localeCompare(b.name)));
      setItemForm((current) => ({ ...current, categoryId: current.categoryId || created.id }));
      setCategoryForm({ name: "", description: "" });
      setNotice(`Category “${created.name}” created.`);
    } catch (error) {
      setErrorMessage(error instanceof ApiError ? error.message : "Could not create category.");
    } finally {
      setSavingCategory(false);
    }
  };

  const createItem = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavingItem(true);
    setErrorMessage("");
    setNotice("");
    try {
      const created = await menuService.createItem({
        name: itemForm.name.trim(),
        description: itemForm.description.trim() || undefined,
        price: Number(itemForm.price),
        categoryId: itemForm.categoryId,
        prepTimeMinutes: itemForm.prepTimeMinutes ? Number(itemForm.prepTimeMinutes) : undefined,
        isAvailable: itemForm.isAvailable,
      });
      setItems((current) => [created, ...current]);
      setCategories((current) => current.map((category) => category.id === created.categoryId
        ? { ...category, _count: { menuItems: (category._count?.menuItems || 0) + 1 } }
        : category));
      setItemForm((current) => ({ ...current, name: "", description: "", price: "", prepTimeMinutes: "" }));
      setNotice(`Menu item “${created.name}” created.`);
    } catch (error) {
      setErrorMessage(error instanceof ApiError ? error.message : "Could not create menu item.");
    } finally {
      setSavingItem(false);
    }
  };

  const toggleAvailability = async (item: MenuItem) => {
    setUpdatingItem(item.id);
    setErrorMessage("");
    setNotice("");
    try {
      const updated = await menuService.setAvailability(item.id, !item.isAvailable);
      setItems((current) => current.map((entry) => entry.id === updated.id ? updated : entry));
      setNotice(`“${updated.name}” is now ${updated.isAvailable ? "available" : "unavailable"}.`);
    } catch (error) {
      setErrorMessage(error instanceof ApiError ? error.message : "Could not update item availability.");
    } finally {
      setUpdatingItem(null);
    }
  };

  return (
    <DashboardLayout title="Menu Management" subtitle="Manage menu categories and items for your restaurant">
      {errorMessage && <p role="alert" className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</p>}
      {notice && <p role="status" className="mb-4 rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700">{notice}</p>}

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-12">
        <section className="space-y-5 xl:col-span-4">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:p-6">
            <div className="mb-4 flex items-center gap-2">
              <span className="h-5 w-1.5 rounded-full bg-orange-500" />
              <h3 className="font-bold text-gray-900">Create Category</h3>
            </div>
            <form onSubmit={createCategory} className="space-y-3.5">
              <label className="block text-xs font-semibold text-gray-600">Category name
                <input required maxLength={80} value={categoryForm.name} onChange={(event) => setCategoryForm({ ...categoryForm, name: event.target.value })} className={fieldClass} placeholder="e.g. Starters" />
              </label>
              <label className="block text-xs font-semibold text-gray-600">Description
                <textarea rows={2} maxLength={250} value={categoryForm.description} onChange={(event) => setCategoryForm({ ...categoryForm, description: event.target.value })} className={fieldClass} placeholder="Optional category details" />
              </label>
              <button disabled={savingCategory} className="w-full rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60">
                {savingCategory ? "Saving…" : "Add Category"}
              </button>
            </form>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="h-5 w-1.5 rounded-full bg-orange-500" />
                <h3 className="font-bold text-gray-900">Categories</h3>
              </div>
              <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-bold text-orange-600">{categories.length}</span>
            </div>
            {loading ? <p className="py-5 text-center text-sm text-gray-400">Loading categories…</p> : categories.length === 0 ? (
              <p className="rounded-xl border border-dashed border-gray-200 p-5 text-center text-sm text-gray-400">No categories yet. Add one to start building your menu.</p>
            ) : <ul className="divide-y divide-gray-100">
              {categories.map((category) => <li key={category.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-800">{category.name}</p>
                  {category.description && <p className="mt-0.5 truncate text-xs text-gray-400">{category.description}</p>}
                </div>
                <span className="shrink-0 text-xs text-gray-400">{category._count?.menuItems || 0} items</span>
              </li>)}
            </ul>}
          </div>
        </section>

        <section className="space-y-5 xl:col-span-8">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:p-6">
            <div className="mb-4 flex items-center gap-2">
              <span className="h-5 w-1.5 rounded-full bg-orange-500" />
              <h3 className="font-bold text-gray-900">Add Menu Item</h3>
            </div>
            {categories.length === 0 && !loading && <p className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">Create a category before adding menu items.</p>}
            <form onSubmit={createItem} className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
              <label className="block text-xs font-semibold text-gray-600">Item name
                <input required maxLength={100} value={itemForm.name} onChange={(event) => setItemForm({ ...itemForm, name: event.target.value })} className={fieldClass} placeholder="e.g. Paneer Tikka" />
              </label>
              <label className="block text-xs font-semibold text-gray-600">Category
                <select required disabled={categories.length === 0 || loading} value={itemForm.categoryId} onChange={(event) => setItemForm({ ...itemForm, categoryId: event.target.value })} className={fieldClass}>
                  <option value="">Select a category</option>
                  {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                </select>
              </label>
              <label className="block text-xs font-semibold text-gray-600">Price (₹)
                <input required type="number" min="0" step="0.01" value={itemForm.price} onChange={(event) => setItemForm({ ...itemForm, price: event.target.value })} className={fieldClass} placeholder="220.00" />
              </label>
              <label className="block text-xs font-semibold text-gray-600">Preparation time (minutes)
                <input type="number" min="1" step="1" value={itemForm.prepTimeMinutes} onChange={(event) => setItemForm({ ...itemForm, prepTimeMinutes: event.target.value })} className={fieldClass} placeholder="15" />
              </label>
              <label className="block text-xs font-semibold text-gray-600 md:col-span-2">Description
                <textarea rows={2} maxLength={500} value={itemForm.description} onChange={(event) => setItemForm({ ...itemForm, description: event.target.value })} className={fieldClass} placeholder="Optional item description" />
              </label>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 md:col-span-2">
                <input type="checkbox" checked={itemForm.isAvailable} onChange={(event) => setItemForm({ ...itemForm, isAvailable: event.target.checked })} className="h-4 w-4 accent-orange-500" />
                Available to order
              </label>
              <button disabled={savingItem || loading || categories.length === 0} className="rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60 md:col-span-2">
                {savingItem ? "Saving…" : "Add Menu Item"}
              </button>
            </form>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="h-5 w-1.5 rounded-full bg-orange-500" />
                <h3 className="font-bold text-gray-900">Menu Items</h3>
              </div>
              <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-bold text-orange-600">{items.length}</span>
            </div>
            {loading ? <p className="py-5 text-center text-sm text-gray-400">Loading menu items…</p> : items.length === 0 ? (
              <p className="rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-400">No menu items yet. Add an item using the form above.</p>
            ) : <div className="divide-y divide-gray-100">
              {items.map((item) => <article key={item.id} className="flex flex-col gap-3 py-4 first:pt-0 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-bold text-gray-900">{item.name}</h4>
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${item.isAvailable ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>{item.isAvailable ? "Available" : "Unavailable"}</span>
                  </div>
                  <p className="mt-1 text-xs font-medium text-orange-600">{item.category?.name || categories.find((category) => category.id === item.categoryId)?.name || "Category"}</p>
                  {item.description && <p className="mt-1 text-sm text-gray-500">{item.description}</p>}
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
                    <span>₹{Number(item.price).toFixed(2)}</span>
                    <span>{item.prepTimeMinutes ? `${item.prepTimeMinutes} min prep` : "Prep time not set"}</span>
                  </div>
                </div>
                <button type="button" disabled={updatingItem === item.id} onClick={() => void toggleAvailability(item)} className="shrink-0 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 transition hover:border-orange-300 hover:text-orange-600 disabled:opacity-50">
                  {updatingItem === item.id ? "Updating…" : item.isAvailable ? "Mark unavailable" : "Mark available"}
                </button>
              </article>)}
            </div>}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
