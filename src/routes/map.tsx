import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { StationMap } from "@/components/StationMap";
import { STATIONS, type ConnectorType, type Station } from "@/lib/mockData";
import { Filter, Search, Star, Zap } from "lucide-react";

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "Mapa de eletropostos · Flui" },
      {
        name: "description",
        content:
          "Encontre estações de recarga elétrica próximas com filtros por conector, potência e disponibilidade.",
      },
    ],
  }),
  component: MapPage,
});

const ALL_CONNECTORS: ConnectorType[] = ["Tipo 2", "CCS2", "CHAdeMO", "GB/T"];

function MapPage() {
  const [query, setQuery] = useState("");
  const [connectors, setConnectors] = useState<ConnectorType[]>([]);
  const [minPower, setMinPower] = useState(0);
  const [openOnly, setOpenOnly] = useState(false);
  const [selectedId, setSelectedId] = useState<string | undefined>();

  const filtered = useMemo<Station[]>(() => {
    return STATIONS.filter((s) => {
      if (
        query &&
        !`${s.name} ${s.address}`.toLowerCase().includes(query.toLowerCase())
      )
        return false;
      if (
        connectors.length &&
        !connectors.some((c) => s.connectors.includes(c))
      )
        return false;
      if (s.powerKw < minPower) return false;
      if (openOnly && s.status === "MANUTENCAO") return false;
      return true;
    });
  }, [query, connectors, minPower, openOnly]);

  const toggleConnector = (c: ConnectorType) =>
    setConnectors((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c],
    );

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-4 px-4 py-6 sm:px-6 lg:flex-row">
        {/* Sidebar filtros + lista */}
        <aside className="flex w-full flex-col gap-4 lg:w-[380px]">
          <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-[var(--shadow-card)]">
            <label className="relative block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar estação ou endereço…"
                aria-label="Buscar estações"
                className="h-11 w-full rounded-xl border border-input bg-background pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
              />
            </label>

            <div className="mt-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <Filter className="h-3.5 w-3.5" /> Conectores
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {ALL_CONNECTORS.map((c) => {
                  const active = connectors.includes(c);
                  return (
                    <button
                      key={c}
                      onClick={() => toggleConnector(c)}
                      aria-pressed={active}
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                        active
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background hover:bg-accent"
                      }`}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <span>Potência mínima</span>
                <span className="text-primary">{minPower} kW</span>
              </div>
              <input
                type="range"
                min={0}
                max={200}
                step={10}
                value={minPower}
                onChange={(e) => setMinPower(Number(e.target.value))}
                className="mt-2 w-full accent-[var(--primary)]"
              />
            </div>

            <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={openOnly}
                onChange={(e) => setOpenOnly(e.target.checked)}
                className="h-4 w-4 accent-[var(--primary)]"
              />
              Apenas abertas agora
            </label>
          </div>

          <div className="text-xs text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? "estação" : "estações"} encontradas
          </div>

          <div className="flex flex-col gap-2 overflow-y-auto lg:max-h-[calc(100vh-360px)]">
            {filtered.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedId(s.id)}
                className={`group flex gap-3 rounded-xl border p-3 text-left transition ${
                  selectedId === s.id
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:border-primary/40"
                }`}
              >
                <img
                  src={s.cover}
                  alt=""
                  className="h-16 w-16 shrink-0 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-primary">
                    {Array.from({ length: s.fluiStars }).map((_, i) => (
                      <span key={i}>★</span>
                    ))}
                  </div>
                  <div className="truncate text-sm font-semibold">{s.name}</div>
                  <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Zap className="h-3 w-3" /> {s.powerKw} kW
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-primary text-primary" />
                      {s.rating.toFixed(1)}
                    </span>
                  </div>
                </div>
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                Nenhuma estação corresponde aos filtros.
              </div>
            )}
          </div>
        </aside>

        {/* Mapa */}
        <div className="relative flex-1">
          <div className="h-[60vh] lg:h-[calc(100vh-160px)]">
            <StationMap
              stations={filtered}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          </div>
          {selectedId && (
            <div className="absolute inset-x-3 bottom-3 rounded-2xl border border-border/70 bg-card p-4 shadow-[var(--shadow-elegant)] sm:inset-x-auto sm:right-3 sm:max-w-sm">
              {(() => {
                const s = STATIONS.find((x) => x.id === selectedId)!;
                return (
                  <div>
                    <div className="text-xs font-semibold text-primary">
                      {Array.from({ length: s.fluiStars }).map((_, i) => "★").join("")} Flui
                    </div>
                    <div className="mt-1 font-semibold">{s.name}</div>
                    <div className="text-xs text-muted-foreground">{s.address}</div>
                    <Link
                      to="/stations/$id"
                      params={{ id: s.id }}
                      className="mt-3 inline-flex h-9 items-center rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground hover:bg-primary-deep"
                    >
                      Ver ficha completa →
                    </Link>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
