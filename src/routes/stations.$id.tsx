import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import {
  AMENITY_LABELS,
  getReviewsByStation,
  getStation,
  type Review,
  type Station,
} from "@/lib/mockData";
import { ArrowLeft, Clock, MapPin, Star, Zap } from "lucide-react";

export const Route = createFileRoute("/stations/$id")({
  loader: ({ params }) => {
    const station = getStation(params.id);
    if (!station) throw notFound();
    return { station, reviews: getReviewsByStation(params.id) };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.station.name ?? "Estação"} · Flui` },
      {
        name: "description",
        content: loaderData?.station.address ?? "Ficha de estação Flui",
      },
      { property: "og:image", content: loaderData?.station.cover ?? "" },
    ],
  }),
  notFoundComponent: () => (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <h1 className="text-3xl font-semibold">Estação não encontrada</h1>
        <Link to="/map" className="mt-4 inline-block text-primary">
          ← Voltar ao mapa
        </Link>
      </div>
    </div>
  ),
  component: StationDetail,
});

function StationDetail() {
  const { station, reviews } = Route.useLoaderData() as ReturnType<typeof Route.useLoaderData> & {
    station: NonNullable<ReturnType<typeof getStation>>;
    reviews: ReturnType<typeof getReviewsByStation>;
  };

  const avgCharge = reviews.length
    ? reviews.reduce((a, r) => a + r.chargeQuality, 0) / reviews.length
    : 0;
  const avgInfra = reviews.length
    ? reviews.reduce((a, r) => a + r.infrastructure, 0) / reviews.length
    : 0;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="relative h-[42vh] min-h-[320px] w-full overflow-hidden">
          <img
            src={station.cover}
            alt={station.name}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          <div className="absolute inset-x-0 bottom-0">
            <div className="mx-auto max-w-7xl px-4 pb-8 sm:px-6">
              <Link
                to="/map"
                className="inline-flex items-center gap-1 text-sm font-medium text-primary"
              >
                <ArrowLeft className="h-4 w-4" /> Voltar ao mapa
              </Link>
              <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                      {Array.from({ length: station.fluiStars }).map((_, i) => "★").join("")} Flui
                    </span>
                    <span className="text-muted-foreground">
                      Estrelas Flui · curadoria editorial
                    </span>
                  </div>
                  <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                    {station.name}
                  </h1>
                  <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" /> {station.address}
                  </p>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 shadow-[var(--shadow-card)]">
                  <Star className="h-5 w-5 fill-primary text-primary" />
                  <span className="text-2xl font-semibold">
                    {station.rating.toFixed(1)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({station.reviewsCount} avaliações)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            {/* Specs */}
            <section className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  icon: Zap,
                  label: "Potência máxima",
                  value: `${station.powerKw} kW`,
                },
                {
                  icon: Clock,
                  label: "Funcionamento",
                  value: station.hours,
                },
                {
                  icon: Star,
                  label: "Preço por kWh",
                  value: `R$ ${station.pricePerKwh.toFixed(2)}`,
                },
              ].map((it) => (
                <div
                  key={it.label}
                  className="rounded-2xl border border-border/70 bg-card p-5 shadow-[var(--shadow-card)]"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <it.icon className="h-5 w-5" />
                  </span>
                  <div className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">
                    {it.label}
                  </div>
                  <div className="text-lg font-semibold">{it.value}</div>
                </div>
              ))}
            </section>

            {/* Conectores */}
            <section>
              <h2 className="text-xl font-semibold">Conectores disponíveis</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {station.connectors.map((c) => (
                  <span
                    key={c}
                    className="rounded-lg border border-primary/30 bg-primary/5 px-3 py-1.5 text-sm font-semibold text-primary"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </section>

            {/* Comodidades */}
            <section>
              <h2 className="text-xl font-semibold">Comodidades no local</h2>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {station.amenities.map((a) => (
                  <div
                    key={a}
                    className="flex items-center gap-2 rounded-lg border border-border/60 bg-card px-3 py-2 text-sm"
                  >
                    <span className="h-2 w-2 rounded-full bg-primary" />
                    {AMENITY_LABELS[a] ?? a}
                  </div>
                ))}
              </div>
            </section>

            {/* Reviews */}
            <section>
              <div className="flex items-end justify-between">
                <h2 className="text-xl font-semibold">Avaliações</h2>
                <button className="text-sm font-semibold text-primary hover:underline">
                  + Avaliar estação
                </button>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <ScoreBar label="Qualidade da carga" value={avgCharge} />
                <ScoreBar label="Infraestrutura" value={avgInfra} />
              </div>
              <div className="mt-6 space-y-4">
                {reviews.map((r) => (
                  <article
                    key={r.id}
                    className="rounded-2xl border border-border/70 bg-card p-5 shadow-[var(--shadow-card)]"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-semibold">{r.userName}</div>
                      <div className="flex items-center gap-1 text-sm">
                        {Array.from({ length: r.rating }).map((_, i) => (
                          <Star
                            key={i}
                            className="h-4 w-4 fill-primary text-primary"
                          />
                        ))}
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-foreground">{r.comment}</p>
                    <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span>Carga: {r.chargeQuality}/5</span>
                      <span>Infra: {r.infrastructure}/5</span>
                      <span>{new Date(r.date).toLocaleDateString("pt-BR")}</span>
                    </div>
                  </article>
                ))}
                {reviews.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Seja o primeiro a avaliar.
                  </p>
                )}
              </div>
            </section>
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-[var(--shadow-card)]">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                Status agora
              </div>
              <div className="mt-1 flex items-center gap-2 text-lg font-semibold">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    station.status === "DISPONIVEL"
                      ? "bg-primary"
                      : station.status === "OCUPADO"
                        ? "bg-amber-500"
                        : "bg-muted-foreground"
                  }`}
                />
                {station.status === "DISPONIVEL"
                  ? "Disponível"
                  : station.status === "OCUPADO"
                    ? "Ocupado"
                    : "Em manutenção"}
              </div>
              <button className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-[var(--shadow-elegant)] hover:bg-primary-deep">
                Iniciar navegação
              </button>
              <button className="mt-2 inline-flex h-11 w-full items-center justify-center rounded-xl border border-border bg-background text-sm font-semibold hover:bg-accent">
                Salvar nos favoritos
              </button>
            </div>
            <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-[var(--shadow-card)]">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                Sessões últimos 30 dias
              </div>
              <div className="mt-1 text-3xl font-semibold text-primary">
                {station.sessionsLast30d}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Métrica monitorada pela equipe Flui em tempo real.
              </p>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  const pct = (value / 5) * 100;
  return (
    <div className="rounded-xl border border-border/60 bg-card p-4">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="font-semibold text-primary">
          {value.toFixed(1)}/5
        </span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
