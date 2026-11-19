"use client";

interface Column<T> {
  header: string;
  accessor?: keyof T;
  className?: string;
  render?: (row: T, index: number) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T, index: number) => string | number;
  emptyMessage?: string;
  className?: string;
}

export default function DataTable<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = "No records found.",
  className = "",
}: DataTableProps<T>) {
  return (
    <div className={`overflow-x-auto rounded-xl border border-gray-100 ${className}`}>
      <table className="w-full text-left min-w-[700px] border-collapse">
        <thead>
          <tr className="bg-[#F6F7FA] text-gray-500 text-xs md:text-sm font-semibold uppercase tracking-wider">
            {columns.map((col, idx) => (
              <th key={idx} className={`p-4 ${col.className || ""}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="p-8 text-center text-gray-400 text-sm"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIdx) => (
              <tr
                key={keyExtractor(row, rowIdx)}
                className="hover:bg-orange-50/30 transition-colors"
              >
                {columns.map((col, colIdx) => (
                  <td
                    key={colIdx}
                    className={`p-4 text-sm text-gray-800 ${col.className || ""}`}
                  >
                    {col.render
                      ? col.render(row, rowIdx)
                      : col.accessor
                      ? String(row[col.accessor] ?? "")
                      : null}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
