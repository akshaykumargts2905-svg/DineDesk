"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { ApiError, DiningTable, tableService } from "@/services/api";
import { useAuth } from "@/components/auth/AuthProvider";

const inputClass = "mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-800 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20";

export default function TableManagementPage() {
  const { user } = useAuth();
  const [tables, setTables] = useState<DiningTable[]>([]);
  const [tableNumber, setTableNumber] = useState("");
  const [seats, setSeats] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      tableService.getAll()
        .then((loadedTables) => { if (active) setTables(loadedTables); })
        .catch((error: unknown) => {
          if (active) setErrorMessage(error instanceof ApiError ? error.message : "Could not load restaurant tables.");
        })
        .finally(() => { if (active) setLoading(false); });
    }, 0);
    return () => { active = false; window.clearTimeout(timer); };
  }, []);

  const visibleTables = useMemo(() => tables.filter((table) => {
    if (statusFilter === "ACTIVE") return table.isActive;
    if (statusFilter === "INACTIVE") return !table.isActive;
    return true;
  }), [tables, statusFilter]);

  const createTable = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setErrorMessage("");
    setNotice("");
    try {
      const created = await tableService.create({
        tableNumber: Number(tableNumber),
        seats: seats ? Number(seats) : undefined,
        isActive,
      });
      setTables((current) => [...current, created].sort((a, b) => a.tableNumber - b.tableNumber));
      setTableNumber("");
      setSeats("");
      setIsActive(true);
      setNotice(`Table ${created.tableNumber} created.`);
    } catch (error) {
      setErrorMessage(error instanceof ApiError ? error.message : "Could not create table.");
    } finally {
      setSaving(false);
    }
  };

  const toggleTable = async (table: DiningTable) => {
    setUpdatingId(table.id);
    setErrorMessage("");
    setNotice("");
    try {
      const updated = await tableService.setActive(table.id, !table.isActive);
      setTables((current) => current.map((entry) => entry.id === updated.id ? updated : entry));
      setNotice(`Table ${updated.tableNumber} is now ${updated.isActive ? "active" : "inactive"}.`);
    } catch (error) {
      setErrorMessage(error instanceof ApiError ? error.message : "Could not update table status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const activeCount = tables.filter((table) => table.isActive).length;

  return (
    <DashboardLayout title="Table Management" subtitle="Manage seating capacity and table availability">
      {errorMessage && <p role="alert" className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</p>}
      {notice && <p role="status" className="mb-4 rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700">{notice}</p>}

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        <section className="lg:col-span-4">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:p-6">
            <div className="mb-4 flex items-center gap-2">
              <span className="h-5 w-1.5 rounded-full bg-orange-500" />
              <h3 className="font-bold text-gray-900">Add Restaurant Table</h3>
            </div>
            <form onSubmit={createTable} className="space-y-3.5">
              <label className="block text-xs font-semibold text-gray-600">Table number
                <input required type="number" min="1" step="1" value={tableNumber} onChange={(event) => setTableNumber(event.target.value)} className={inputClass} placeholder="1" />
              </label>
              <label className="block text-xs font-semibold text-gray-600">Seating capacity
                <input type="number" min="1" step="1" value={seats} onChange={(event) => setSeats(event.target.value)} className={inputClass} placeholder="4" />
              </label>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} className="h-4 w-4 accent-orange-500" />
                Active and available for orders
              </label>
              <button disabled={user?.isDemo || saving} className="w-full rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60">
                {saving ? "Saving…" : "Add Table"}
              </button>
            </form>
            <p className="mt-4 text-xs leading-relaxed text-gray-400">Table numbers must be positive and unique within your restaurant.</p>
          </div>
        </section>

        <section className="lg:col-span-8">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:p-6">
            <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-5 w-1.5 rounded-full bg-orange-500" />
                  <h3 className="font-bold text-gray-900">Restaurant Tables</h3>
                </div>
                <p className="ml-3.5 mt-1 text-xs text-gray-400">{activeCount} active of {tables.length} tables</p>
              </div>
              <label className="text-xs font-semibold text-gray-600">Show
                <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)} className="ml-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-orange-500 focus:outline-none">
                  <option value="ALL">All tables</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </label>
            </div>

            {loading ? <p className="py-10 text-center text-sm text-gray-400">Loading tables…</p> : visibleTables.length === 0 ? (
              <p className="rounded-xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-400">{tables.length === 0 ? "No tables yet. Add your first table to get started." : "No tables match this status filter."}</p>
            ) : <div className="overflow-x-auto rounded-xl border border-gray-100">
              <table className="w-full min-w-[520px] text-left">
                <thead><tr className="bg-[#F6F7FA] text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <th className="p-4">Table</th><th className="p-4">Seats</th><th className="p-4">Status</th><th className="p-4">Action</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {visibleTables.map((table) => <tr key={table.id} className="text-sm text-gray-700">
                    <td className="p-4 font-bold text-gray-900">Table {table.tableNumber}</td>
                    <td className="p-4">{table.seats ?? "—"}</td>
                    <td className="p-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${table.isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>{table.isActive ? "Active" : "Inactive"}</span></td>
                    <td className="p-4"><button type="button" disabled={user?.isDemo || updatingId === table.id} onClick={() => void toggleTable(table)} className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 transition hover:border-orange-300 hover:text-orange-600 disabled:opacity-50">{user?.isDemo ? "Read only" : updatingId === table.id ? "Updating…" : table.isActive ? "Deactivate" : "Activate"}</button></td>
                  </tr>)}
                </tbody>
              </table>
            </div>}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
