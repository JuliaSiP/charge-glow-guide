import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { REVIEWS, STATIONS, type Review } from "@/lib/mockData";
import { Check, MessageSquare, Star, X } from "lucide-react";

export const Route = createFileRoute("/admin/reviews")({
  component: AdminReviews,
});

type Decision = "PENDING" | "APPROVED" | "REJECTED";

function AdminReviews() {
  const [state, setState] = useState<Record<string, Decision>>(
    Object.fromEntries(REVIEWS.map((review) => [review.id, "PENDING"])),
  );
  const [tab, setTab] = useState<Decision>("PENDING");
  const [stationId, setStationId] = useState<string>("ALL");

  const selectedStation =
    stationId === "ALL" ? undefined : STATIONS.find((station) => station.id === stationId);

  const reviewsByStation = useMemo(
    () => REVIEWS.filter((review) => (stationId === "ALL" ? true : review.stationId === stationId)),
    [stationId],
  );

  const filtered: Review[] = reviewsByStation.filter((review) => state[review.id] === tab);

  const counts = {
    PENDING: reviewsByStation.filter((review) => state[review.id] === "PENDING").length,
    APPROVED: reviewsByStation.filter((review) => state[review.id] === "APPROVED").length,
    REJECTED: reviewsByStation.filter((review) => state[review.id] === "REJECTED").length,
  };

  const average = reviewsByStation.length
    ? reviewsByStation.reduce((sum, review) => sum + review.rating, 0) / reviewsByStation.length
    : 0;
  const chargeAverage = reviewsByStation.length
    ? reviewsByStation.reduce((sum, review) => sum + review.chargeQuality, 0) /
      reviewsByStation.length
    : 0;
  const infraAverage = reviewsByStation.length
    ? reviewsByStation.reduce((sum, review) => sum + review.infrastructure, 0) /
      reviewsByStation.length
    : 0;

  const setDecision = (id: string, decision: Decision) =>
    setState((prev) => ({ ...prev, [id]: decision }));

  const tabs: { key: Decision; label: string }[] = [
    { key: "PENDING", label: "Pendentes" },
    { key: "APPROVED", label: "Aprovadas" },
    { key: "REJECTED", label: "Rejeitadas" },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Avaliacoes</h1>
          <p className="text-sm text-muted-foreground">
            Visualizacao das avaliacoes dos motoristas por ponto de recarga.
          </p>
        </div>
        <label className="min-w-64 text-sm font-medium">
          Ponto
          <select
            value={stationId}
            onChange={(event) => setStationId(event.target.value)}
            className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
          >
            <option value="ALL">Toda a rede</option>
            {STATIONS.map((station) => (
              <option key={station.id} value={station.id}>
                {station.name}
              </option>
            ))}
          </select>
        </label>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPI label="Nota media" value={average ? average.toFixed(1) : "-"} />
        <KPI label="Qualidade da carga" value={chargeAverage ? chargeAverage.toFixed(1) : "-"} />
        <KPI label="Infraestrutura" value={infraAverage ? infraAverage.toFixed(1) : "-"} />
        <KPI label="Comentarios" value={reviewsByStation.length.toString()} />
      </section>

      {selectedStation && (
        <section className="rounded-xl border border-border/70 bg-card p-5 shadow-[var(--shadow-card)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-primary">
                {selectedStation.powerKw} kW - {selectedStation.connectors.join(", ")}
              </div>
              <h2 className="mt-1 text-lg font-semibold">{selectedStation.name}</h2>
              <p className="text-sm text-muted-foreground">{selectedStation.address}</p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Star className="h-3.5 w-3.5 fill-primary" />
              {selectedStation.rating.toFixed(1)}
            </span>
          </div>
        </section>
      )}

      <div className="flex gap-1 overflow-x-auto border-b border-border/60">
        {tabs.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setTab(item.key)}
            className={`relative px-4 py-2 text-sm font-medium transition ${
              tab === item.key ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {item.label}
            <span className="ml-2 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
              {counts[item.key]}
            </span>
            {tab === item.key && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 bg-primary" />
            )}
          </button>
        ))}
      </div>

      <div className="grid gap-4">
        {filtered.map((review) => {
          const station = STATIONS.find((item) => item.id === review.stationId);

          return (
            <article
              key={review.id}
              className="rounded-xl border border-border/70 bg-card p-5 shadow-[var(--shadow-card)]"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">
                    {station?.name}
                  </div>
                  <div className="mt-1 flex items-center gap-2 font-semibold">
                    {review.userName}
                    <span className="flex items-center gap-0.5 text-sm text-primary">
                      {Array.from({ length: review.rating }).map((_, index) => (
                        <Star key={index} className="h-3.5 w-3.5 fill-primary" />
                      ))}
                    </span>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(review.date).toLocaleDateString("pt-BR")}
                </span>
              </div>
              <p className="mt-3 text-sm">{review.comment}</p>
              <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                <span>Carga: {review.chargeQuality}/5</span>
                <span>Infra: {review.infrastructure}/5</span>
                <span className="inline-flex items-center gap-1">
                  <MessageSquare className="h-3.5 w-3.5" />
                  {state[review.id]}
                </span>
              </div>
              {tab === "PENDING" && (
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setDecision(review.id, "APPROVED")}
                    className="inline-flex h-9 items-center gap-1 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground hover:bg-primary-deep"
                  >
                    <Check className="h-3.5 w-3.5" /> Aprovar
                  </button>
                  <button
                    type="button"
                    onClick={() => setDecision(review.id, "REJECTED")}
                    className="inline-flex h-9 items-center gap-1 rounded-lg border border-border bg-background px-3 text-xs font-semibold hover:bg-accent"
                  >
                    <X className="h-3.5 w-3.5" /> Rejeitar
                  </button>
                </div>
              )}
              {tab !== "PENDING" && (
                <button
                  type="button"
                  onClick={() => setDecision(review.id, "PENDING")}
                  className="mt-4 text-xs font-medium text-primary hover:underline"
                >
                  Voltar para pendentes
                </button>
              )}
            </article>
          );
        })}
        {filtered.length === 0 && (
          <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            Sem avaliacoes nesta categoria.
          </div>
        )}
      </div>
    </div>
  );
}

function KPI({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/70 bg-card p-5 shadow-[var(--shadow-card)]">
      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 text-3xl font-semibold text-primary">{value}</div>
    </div>
  );
}
