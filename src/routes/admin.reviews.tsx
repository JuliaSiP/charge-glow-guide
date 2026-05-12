import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { REVIEWS, STATIONS, type Review } from "@/lib/mockData";
import { Check, Star, X } from "lucide-react";

export const Route = createFileRoute("/admin/reviews")({
  component: AdminReviews,
});

type Decision = "PENDING" | "APPROVED" | "REJECTED";

function AdminReviews() {
  const [state, setState] = useState<Record<string, Decision>>(
    Object.fromEntries(REVIEWS.map((r) => [r.id, "PENDING"])),
  );
  const [tab, setTab] = useState<Decision>("PENDING");

  const set = (id: string, d: Decision) =>
    setState((prev) => ({ ...prev, [id]: d }));

  const filtered: Review[] = REVIEWS.filter((r) => state[r.id] === tab);

  const counts = {
    PENDING: REVIEWS.filter((r) => state[r.id] === "PENDING").length,
    APPROVED: REVIEWS.filter((r) => state[r.id] === "APPROVED").length,
    REJECTED: REVIEWS.filter((r) => state[r.id] === "REJECTED").length,
  };

  const tabs: { key: Decision; label: string }[] = [
    { key: "PENDING", label: "Pendentes" },
    { key: "APPROVED", label: "Aprovadas" },
    { key: "REJECTED", label: "Rejeitadas" },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Moderação</h1>
        <p className="text-sm text-muted-foreground">
          Avaliações da rede para garantir qualidade Flui
        </p>
      </header>

      <div className="flex gap-1 border-b border-border/60">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`relative px-4 py-2 text-sm font-medium transition ${
              tab === t.key
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
            <span className="ml-2 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
              {counts[t.key]}
            </span>
            {tab === t.key && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 bg-primary" />
            )}
          </button>
        ))}
      </div>

      <div className="grid gap-4">
        {filtered.map((r) => {
          const station = STATIONS.find((s) => s.id === r.stationId);
          return (
            <article
              key={r.id}
              className="rounded-2xl border border-border/70 bg-card p-5 shadow-[var(--shadow-card)]"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">
                    {station?.name}
                  </div>
                  <div className="mt-1 flex items-center gap-2 font-semibold">
                    {r.userName}
                    <span className="flex items-center gap-0.5 text-sm text-primary">
                      {Array.from({ length: r.rating }).map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-primary" />
                      ))}
                    </span>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(r.date).toLocaleDateString("pt-BR")}
                </span>
              </div>
              <p className="mt-3 text-sm">{r.comment}</p>
              <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                <span>Carga: {r.chargeQuality}/5</span>
                <span>Infra: {r.infrastructure}/5</span>
              </div>
              {tab === "PENDING" && (
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => set(r.id, "APPROVED")}
                    className="inline-flex h-9 items-center gap-1 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground hover:bg-primary-deep"
                  >
                    <Check className="h-3.5 w-3.5" /> Aprovar
                  </button>
                  <button
                    onClick={() => set(r.id, "REJECTED")}
                    className="inline-flex h-9 items-center gap-1 rounded-lg border border-border bg-background px-3 text-xs font-semibold hover:bg-accent"
                  >
                    <X className="h-3.5 w-3.5" /> Rejeitar
                  </button>
                </div>
              )}
              {tab !== "PENDING" && (
                <button
                  onClick={() => set(r.id, "PENDING")}
                  className="mt-4 text-xs font-medium text-primary hover:underline"
                >
                  Voltar para pendentes
                </button>
              )}
            </article>
          );
        })}
        {filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            Sem avaliações nesta categoria.
          </div>
        )}
      </div>
    </div>
  );
}
