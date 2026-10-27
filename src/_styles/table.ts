// src/styles/table.ts
export const tableClasses = {
  container: "border rounded-lg relative w-full overflow-x-auto",
  table: "w-full caption-bottom text-sm",
  th: "text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
  tr: "hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors",
  body: "[&_tr:last-child]:border-0",
  td: "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
  input: "border px-2 py-1 rounded",
  button: "px-2 py-1 border rounded disabled:opacity-50",
}

export const paginationClasses = {
  container: "flex items-center justify-center mx-auto gap-2 mt-2 text-sm",
  previous: "px-2 py-1 border rounded-md disabled:opacity-50",
  next: "px-2 py-1 border rounded-md disabled:opacity-50"
}
