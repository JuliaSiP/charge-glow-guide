import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { STATIONS, type Station, type StationStatus } from "@/lib/mockData";
import { Pencil, Plus, Search } from "lucide-react";

export const Route = createFileRoute("/admin/stations")({
  component: AdminStations,
});

const STATUS_OPTIONS: { value: StationStatus; label: string; tone: string }[] = [
  { value: "DISPONIVEL", label: "Disponível", tone: "bg-primary/10 text-primary" },
  { value: "OCUPADO", label: "Ocupado", tone: "bg-amber-100 text-amber-700" },
  { value: "MANUTENCAO", label: "Manutenção", tone: "bg-muted text-muted-foreground" },
];

function AdminStations() {
  const [rows, setRows] = useState<Station[]>(STATIONS);
  const [query, setQuery] = useState("");

  const filtered = rows.filter((r) =>
    r.name.toLowerCase().includes(query.toLowerCase()),
  );

  const updateStatus = (id: string, status: StationStatus) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Estações</h1>
          <p className="text-sm text-muted-foreground">
            Gestão de inventário e status em tempo real
          </p>
        </div>
        <button className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-elegant)] hover:bg-primary-deep">
          <Plus className="h-4 w-4" /> Nova estação
        </button>
      </header>

      <div className="rounded-2xl border border-border/70 bg-card shadow-[var(--shadow-card)]">
        <div className="border-b border-border/60 p-4">
          <label className="relative block max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar estação…"
              className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
            />
          </label>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 font-semibold">Estação</th>
                <th className="px-4 py-3 font-semibold">Potência</th>
                <th className="px-4 py-3 font-semibold">Conectores</th>
                <th className="px-4 py-3 font-semibold">Estrelas</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-accent/40">
                  <td className="px-4 py-3">
                    <div className="font-semibold">{s.name}</div>
                    <div className="text-xs text-muted-foreground">{s.address}</div>
                  </td>
                  <td className="px-4 py-3 font-medium text-primary">
                    {s.powerKw} kW
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {s.connectors.map((c) => (
                        <span
                          key={c}
                          className="rounded bg-secondary px-1.5 py-0.5 text-[11px]"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-primary">
                    {Array.from({ length: s.fluiStars }).map((_, i) => "★").join("")}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={s.status}
                      onChange={(e) =>
                        updateStatus(s.id, e.target.value as StationStatus)
                      }
                      aria-label={`Status de ${s.name}`}
                      className={`rounded-md border-0 px-2 py-1 text-xs font-semibold outline-none focus:ring-2 focus:ring-primary/40 ${
                        STATUS_OPTIONS.find((o) => o.value === s.status)?.tone
                      }`}
                    >
                      {STATUS_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      aria-label={`Editar ${s.name}`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border hover:bg-accent"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
