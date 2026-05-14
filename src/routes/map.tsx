import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { StationMap } from "@/components/StationMap";
import { listStations as fetchStations } from "@/lib/apiClient";
import {
  AMENITIES,
  AMENITY_LABELS,
  CONNECTOR_OPTIONS,
  STATIONS,
  googleDirectionsUrl,
  type ConnectorType,
  type Station,
} from "@/lib/mockData";
import { Coffee, Filter, Search, Star, Toilet, Wifi, Zap } from "lucide-react";

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "Mapa de eletropostos - Flui" },
      {
        name: "description",
        content:
          "Encontre pontos de recarga eletrica proximos com filtros por conector, potencia e comodidades.",
      },
    ],
  }),
  component: MapPage,
});

const POWER_STEPS = [0, 50, 100, 150];

const amenityIcon = {
  wifi: Wifi,
  cafe: Coffee,
  banheiro: Toilet,
};

function MapPage() {
  const [query, setQuery] = useState("");
  const [connectors, setConnectors] = useState<ConnectorType[]>([]);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [minPower, setMinPower] = useState(0);
  const [openOnly, setOpenOnly] = useState(false);
  const [selectedId, setSelectedId] = useState<string | undefined>(STATIONS[0]?.id);
  const [stations, setStations] = useState<Station[]>(STATIONS);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    fetchStations({
      query,
      connectors,
      amenities,
      minPower,
      available: openOnly,
    })
      .then((response) => {
        if (!cancelled) {
          setStations(response.data);
          setApiError(null);
        }
      })
      .catch((error: Error) => {
        if (!cancelled) {
          setApiError(error.message);
          setStations(
            STATIONS.filter((station) => {
              const searchable =
                `${station.name} ${station.address} ${station.connectors.join(" ")}`.toLowerCase();

              if (query && !searchable.includes(query.toLowerCase())) return false;
              if (
                connectors.length &&
                !connectors.some((connector) => station.connectors.includes(connector))
              )
                return false;
              if (
                amenities.length &&
                !amenities.every((amenity) => station.amenities.includes(amenity))
              )
                return false;
              if (station.powerKw < minPower) return false;
              if (openOnly && station.status !== "DISPONIVEL") return false;
              return true;
            }),
          );
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [amenities, connectors, minPower, openOnly, query]);

  const filtered = useMemo<Station[]>(() => stations, [stations]);

  const selectedStation = useMemo(
    () => filtered.find((station) => station.id === selectedId) ?? filtered[0] ?? undefined,
    [filtered, selectedId],
  );

  const toggleConnector = (connector: ConnectorType) =>
    setConnectors((prev) =>
      prev.includes(connector) ? prev.filter((item) => item !== connector) : [...prev, connector],
    );

  const toggleAmenity = (amenity: string) =>
    setAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((item) => item !== amenity) : [...prev, amenity],
    );

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <div className="mx-auto flex max-w-7xl flex-1 flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row">
        <aside className="flex w-full flex-col gap-4 lg:w-[400px]">
          <section className="rounded-xl border border-border/70 bg-card p-4 shadow-[var(--shadow-card)]">
            <label className="relative block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar ponto, endereco ou conector"
                aria-label="Buscar pontos de recarga"
                className="h-11 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
              />
            </label>

            <div className="mt-4">
              <FilterTitle label="Conector" />
              <div className="mt-2 flex flex-wrap gap-2">
                {CONNECTOR_OPTIONS.map((connector) => (
                  <TogglePill
                    key={connector}
                    active={connectors.includes(connector)}
                    onClick={() => toggleConnector(connector)}
                  >
                    {connector}
                  </TogglePill>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <FilterTitle label="Potencia minima" />
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {POWER_STEPS.map((power) => (
                  <button
                    key={power}
                    type="button"
                    onClick={() => setMinPower(power)}
                    className={`h-9 rounded-lg border px-2 text-xs font-semibold transition ${
                      minPower === power
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background hover:bg-accent"
                    }`}
                  >
                    {power === 0 ? "Todas" : `${power}+`}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <FilterTitle label="Comodidades" />
              <div className="mt-2 grid grid-cols-2 gap-2">
                {AMENITIES.map((amenity) => {
                  const Icon = amenityIcon[amenity.key as keyof typeof amenityIcon] ?? Star;

                  return (
                    <button
                      key={amenity.key}
                      type="button"
                      onClick={() => toggleAmenity(amenity.key)}
                      aria-pressed={amenities.includes(amenity.key)}
                      className={`flex h-9 items-center gap-2 rounded-lg border px-2 text-xs font-semibold transition ${
                        amenities.includes(amenity.key)
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span className="truncate">{amenity.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="mt-4 flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-border/70 bg-background px-3 py-2 text-sm font-medium">
              Pontos disponiveis agora
              <input
                type="checkbox"
                checked={openOnly}
                onChange={(event) => setOpenOnly(event.target.checked)}
                className="h-4 w-4 accent-[var(--primary)]"
              />
            </label>
          </section>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {filtered.length} {filtered.length === 1 ? "ponto" : "pontos"} encontrados
              {isLoading ? " - sincronizando API" : ""}
            </span>
            {(connectors.length > 0 || amenities.length > 0 || minPower > 0 || openOnly) && (
              <button
                type="button"
                onClick={() => {
                  setConnectors([]);
                  setAmenities([]);
                  setMinPower(0);
                  setOpenOnly(false);
                }}
                className="font-semibold text-primary hover:underline"
              >
                Limpar filtros
              </button>
            )}
          </div>
          {apiError && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              API indisponivel; exibindo cache local. {apiError}
            </div>
          )}

          <div className="flex flex-col gap-2 overflow-y-auto lg:max-h-[calc(100vh-430px)]">
            {filtered.map((station) => (
              <button
                key={station.id}
                type="button"
                onClick={() => setSelectedId(station.id)}
                className={`group flex gap-3 rounded-xl border p-3 text-left transition ${
                  selectedStation?.id === station.id
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:border-primary/40"
                }`}
              >
                <img
                  src={station.cover}
                  alt=""
                  className="h-16 w-16 shrink-0 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-primary">
                    {Array.from({ length: station.fluiStars }).map((_, index) => (
                      <span key={index}>*</span>
                    ))}
                    <span className="text-muted-foreground">Flui</span>
                  </div>
                  <div className="truncate text-sm font-semibold">{station.name}</div>
                  <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Zap className="h-3 w-3" /> {station.powerKw} kW
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-primary text-primary" />
                      {station.rating.toFixed(1)}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {station.amenities.slice(0, 3).map((amenity) => (
                      <span
                        key={amenity}
                        className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-secondary-foreground"
                      >
                        {AMENITY_LABELS[amenity] ?? amenity}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                Nenhum ponto corresponde aos filtros.
              </div>
            )}
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="h-[62vh] min-h-[430px] lg:h-[calc(100vh-120px)]">
            <StationMap
              stations={filtered}
              selectedId={selectedStation?.id}
              onSelect={setSelectedId}
            />
          </div>
          {selectedStation && (
            <section className="mt-4 grid gap-3 rounded-xl border border-border/70 bg-card p-4 shadow-[var(--shadow-card)] sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-primary">
                  {selectedStation.powerKw} kW - {selectedStation.connectors.join(", ")}
                </div>
                <h2 className="mt-1 text-lg font-semibold">{selectedStation.name}</h2>
                <p className="text-sm text-muted-foreground">{selectedStation.address}</p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span>{selectedStation.hours}</span>
                  <span>R$ {selectedStation.pricePerKwh.toFixed(2)}/kWh</span>
                  <span>{selectedStation.rating.toFixed(1)} de avaliacao</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 sm:justify-end">
                <a
                  href={googleDirectionsUrl(selectedStation)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-background px-3 text-sm font-semibold hover:bg-accent"
                >
                  Rotas
                </a>
                <Link
                  to="/stations/$id"
                  params={{ id: selectedStation.id }}
                  className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground hover:bg-primary-deep"
                >
                  Ver ficha
                </Link>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

function FilterTitle({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      <Filter className="h-3.5 w-3.5" />
      {label}
    </div>
  );
}

function TogglePill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background hover:bg-accent"
      }`}
    >
      {children}
    </button>
  );
}
