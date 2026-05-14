import { createFileRoute } from "@tanstack/react-router";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import {
  AMENITIES,
  AMENITY_LABELS,
  CONNECTOR_OPTIONS,
  STATIONS,
  type ConnectorType,
  type Station,
  type StationStatus,
} from "@/lib/mockData";
import { Check, Pencil, Plus, Search, X } from "lucide-react";

export const Route = createFileRoute("/admin/stations")({
  component: AdminStations,
});

type StationDraft = {
  name: string;
  address: string;
  lat: string;
  lng: string;
  powerKw: string;
  connectors: ConnectorType[];
  status: StationStatus;
  hours: string;
  amenities: string[];
  pricePerKwh: string;
  operator: string;
  fluiStars: "1" | "2" | "3";
};

const STATUS_OPTIONS: { value: StationStatus; label: string; tone: string }[] = [
  { value: "DISPONIVEL", label: "Disponivel", tone: "bg-primary/10 text-primary" },
  { value: "OCUPADO", label: "Ocupado", tone: "bg-amber-100 text-amber-700" },
  { value: "MANUTENCAO", label: "Manutencao", tone: "bg-muted text-muted-foreground" },
];

const DEFAULT_COVER =
  "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=900&q=70";

function AdminStations() {
  const [rows, setRows] = useState<Station[]>(STATIONS);
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<StationDraft>(() => emptyDraft());

  const filtered = useMemo(
    () =>
      rows.filter((row) =>
        `${row.name} ${row.address} ${row.connectors.join(" ")}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [query, rows],
  );

  const selected = editingId ? rows.find((station) => station.id === editingId) : undefined;
  const isEditing = Boolean(editingId);

  const startCreate = () => {
    setEditingId(null);
    setDraft(emptyDraft());
  };

  const startEdit = (station: Station) => {
    setEditingId(station.id);
    setDraft(toDraft(station));
  };

  const updateStatus = (id: string, status: StationStatus) =>
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, status } : row)));

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalized = normalizeDraft(draft, rows.length);

    if (editingId) {
      setRows((prev) =>
        prev.map((row) =>
          row.id === editingId
            ? {
                ...row,
                ...normalized,
                id: row.id,
                cover: row.cover,
                rating: row.rating,
                reviewsCount: row.reviewsCount,
                sessionsLast30d: row.sessionsLast30d,
                lastSync: new Date().toISOString(),
              }
            : row,
        ),
      );
    } else {
      setRows((prev) => [
        {
          ...normalized,
          id: nextStationId(prev),
          cover: DEFAULT_COVER,
          rating: 4.5,
          reviewsCount: 0,
          sessionsLast30d: 0,
          lastSync: new Date().toISOString(),
        },
        ...prev,
      ]);
    }

    setEditingId(null);
    setDraft(emptyDraft());
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
      <section className="min-w-0 space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Pontos de recarga</h1>
            <p className="text-sm text-muted-foreground">
              Listagem operacional com cadastro e edicao em dados simulados.
            </p>
          </div>
          <button
            type="button"
            onClick={startCreate}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-elegant)] hover:bg-primary-deep"
          >
            <Plus className="h-4 w-4" /> Novo ponto
          </button>
        </header>

        <div className="rounded-xl border border-border/70 bg-card shadow-[var(--shadow-card)]">
          <div className="border-b border-border/60 p-4">
            <label className="relative block max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar ponto, endereco ou conector"
                className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
              />
            </label>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3 font-semibold">Ponto</th>
                  <th className="px-4 py-3 font-semibold">Potencia</th>
                  <th className="px-4 py-3 font-semibold">Conectores</th>
                  <th className="px-4 py-3 font-semibold">Comodidades</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Acoes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filtered.map((station) => (
                  <tr key={station.id} className="hover:bg-accent/40">
                    <td className="min-w-[260px] px-4 py-3">
                      <div className="font-semibold">{station.name}</div>
                      <div className="text-xs text-muted-foreground">{station.address}</div>
                    </td>
                    <td className="px-4 py-3 font-medium text-primary">{station.powerKw} kW</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {station.connectors.map((connector) => (
                          <span
                            key={connector}
                            className="rounded bg-secondary px-1.5 py-0.5 text-[11px]"
                          >
                            {connector}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="max-w-[220px] px-4 py-3">
                      <div className="line-clamp-2 text-xs text-muted-foreground">
                        {station.amenities
                          .map((amenity) => AMENITY_LABELS[amenity] ?? amenity)
                          .join(", ")}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={station.status}
                        onChange={(event) =>
                          updateStatus(station.id, event.target.value as StationStatus)
                        }
                        aria-label={`Status de ${station.name}`}
                        className={`rounded-md border-0 px-2 py-1 text-xs font-semibold outline-none focus:ring-2 focus:ring-primary/40 ${
                          STATUS_OPTIONS.find((option) => option.value === station.status)?.tone
                        }`}
                      >
                        {STATUS_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => startEdit(station)}
                        aria-label={`Editar ${station.name}`}
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
      </section>

      <section className="rounded-xl border border-border/70 bg-card p-5 shadow-[var(--shadow-card)] xl:sticky xl:top-24 xl:self-start">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">{isEditing ? "Editar ponto" : "Novo ponto"}</h2>
            <p className="text-sm text-muted-foreground">{selected?.id ?? "Cadastro local"}</p>
          </div>
          {isEditing && (
            <button
              type="button"
              onClick={startCreate}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border hover:bg-accent"
              aria-label="Cancelar edicao"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <form onSubmit={submit} className="mt-5 space-y-4">
          <Field
            label="Nome"
            value={draft.name}
            onChange={(value) => setDraft((prev) => ({ ...prev, name: value }))}
            required
          />
          <Field
            label="Endereco"
            value={draft.address}
            onChange={(value) => setDraft((prev) => ({ ...prev, address: value }))}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Latitude"
              value={draft.lat}
              onChange={(value) => setDraft((prev) => ({ ...prev, lat: value }))}
              inputMode="decimal"
            />
            <Field
              label="Longitude"
              value={draft.lng}
              onChange={(value) => setDraft((prev) => ({ ...prev, lng: value }))}
              inputMode="decimal"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Potencia kW"
              value={draft.powerKw}
              onChange={(value) => setDraft((prev) => ({ ...prev, powerKw: value }))}
              inputMode="numeric"
            />
            <Field
              label="Preco kWh"
              value={draft.pricePerKwh}
              onChange={(value) => setDraft((prev) => ({ ...prev, pricePerKwh: value }))}
              inputMode="decimal"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm font-medium">
              Status
              <select
                value={draft.status}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    status: event.target.value as StationStatus,
                  }))
                }
                className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium">
              Estrelas
              <select
                value={draft.fluiStars}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    fluiStars: event.target.value as StationDraft["fluiStars"],
                  }))
                }
                className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
              >
                <option value="1">1 Flui</option>
                <option value="2">2 Flui</option>
                <option value="3">3 Flui</option>
              </select>
            </label>
          </div>
          <Field
            label="Horario"
            value={draft.hours}
            onChange={(value) => setDraft((prev) => ({ ...prev, hours: value }))}
          />
          <Field
            label="Operador"
            value={draft.operator}
            onChange={(value) => setDraft((prev) => ({ ...prev, operator: value }))}
          />

          <Checklist
            label="Conectores"
            values={CONNECTOR_OPTIONS}
            selected={draft.connectors}
            onToggle={(connector) =>
              setDraft((prev) => ({
                ...prev,
                connectors: toggle(prev.connectors, connector),
              }))
            }
          />
          <Checklist
            label="Comodidades"
            values={AMENITIES.map((amenity) => amenity.key)}
            labels={AMENITY_LABELS}
            selected={draft.amenities}
            onToggle={(amenity) =>
              setDraft((prev) => ({
                ...prev,
                amenities: toggle(prev.amenities, amenity),
              }))
            }
          />

          <button
            type="submit"
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-primary-foreground shadow-[var(--shadow-elegant)] hover:bg-primary-deep"
          >
            <Check className="h-4 w-4" />
            {isEditing ? "Salvar alteracoes" : "Cadastrar ponto"}
          </button>
        </form>
      </section>
    </div>
  );
}

function emptyDraft(): StationDraft {
  return {
    name: "",
    address: "",
    lat: "-23.58",
    lng: "-46.67",
    powerKw: "120",
    connectors: ["CCS2"],
    status: "DISPONIVEL",
    hours: "24h",
    amenities: ["wifi", "banheiro"],
    pricePerKwh: "1.89",
    operator: "Flui Energia",
    fluiStars: "1",
  };
}

function toDraft(station: Station): StationDraft {
  return {
    name: station.name,
    address: station.address,
    lat: String(station.lat),
    lng: String(station.lng),
    powerKw: String(station.powerKw),
    connectors: station.connectors,
    status: station.status,
    hours: station.hours,
    amenities: station.amenities,
    pricePerKwh: String(station.pricePerKwh),
    operator: station.operator,
    fluiStars: String(station.fluiStars) as StationDraft["fluiStars"],
  };
}

function normalizeDraft(draft: StationDraft, index: number) {
  const powerKw = numberOr(draft.powerKw, 120);
  const connectors = draft.connectors.length ? draft.connectors : ["CCS2"];

  return {
    name: draft.name.trim() || `Novo ponto Flui ${index + 1}`,
    address: draft.address.trim() || "Endereco a confirmar",
    lat: numberOr(draft.lat, -23.58),
    lng: numberOr(draft.lng, -46.67),
    powerKw,
    connectors,
    chargers: connectors.map((connector, connectorIndex) => ({
      id: `charger-${connectorIndex + 1}`,
      label: connectorIndex === 0 ? "Principal" : "Complementar",
      connector,
      powerKw: connector === "Tipo 2" ? Math.min(powerKw, 22) : powerKw,
      count: connectorIndex === 0 ? 2 : 1,
      available: connectorIndex === 0 ? 1 : 1,
    })),
    status: draft.status,
    hours: draft.hours.trim() || "24h",
    amenities: draft.amenities,
    pricePerKwh: numberOr(draft.pricePerKwh, 1.89),
    operator: draft.operator.trim() || "Flui Energia",
    fluiStars: Number(draft.fluiStars) as Station["fluiStars"],
  };
}

function nextStationId(rows: Station[]) {
  const max = rows.reduce((currentMax, row) => {
    const numeric = Number(row.id.replace(/\D/g, ""));
    return Number.isFinite(numeric) ? Math.max(currentMax, numeric) : currentMax;
  }, 0);

  return `st-${String(max + 1).padStart(3, "0")}`;
}

function numberOr(value: string, fallback: number) {
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toggle<T>(items: T[], item: T) {
  return items.includes(item) ? items.filter((current) => current !== item) : [...items, item];
}

function Field({
  label,
  value,
  onChange,
  required,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  inputMode?: "text" | "decimal" | "numeric";
}) {
  return (
    <label className="block text-sm font-medium">
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        inputMode={inputMode}
        className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
      />
    </label>
  );
}

function Checklist<T extends string>({
  label,
  values,
  labels,
  selected,
  onToggle,
}: {
  label: string;
  values: T[];
  labels?: Record<string, string>;
  selected: T[];
  onToggle: (value: T) => void;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-medium">{label}</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {values.map((value) => {
          const active = selected.includes(value);

          return (
            <button
              key={value}
              type="button"
              onClick={() => onToggle(value)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              {labels?.[value] ?? value}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
