import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import type { FormEvent } from "react";
import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { createReview as createReviewApi } from "@/lib/apiClient";
import {
  AMENITY_LABELS,
  getReviewsByStation,
  getStation,
  googleDirectionsUrl,
  googleMapsUrl,
  type Review,
  type Station,
} from "@/lib/mockData";
import {
  ArrowLeft,
  BatteryCharging,
  Clock,
  ExternalLink,
  MapPin,
  Navigation,
  Plug,
  Star,
  Zap,
} from "lucide-react";

export const Route = createFileRoute("/stations/$id")({
  loader: ({ params }) => {
    const station = getStation(params.id);
    if (!station) throw notFound();
    return { station, reviews: getReviewsByStation(params.id) };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.station.name ?? "Ponto de recarga"} - Flui` },
      {
        name: "description",
        content: loaderData?.station.address ?? "Ficha de ponto de recarga Flui",
      },
      { property: "og:image", content: loaderData?.station.cover ?? "" },
    ],
  }),
  notFoundComponent: () => (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <h1 className="text-3xl font-semibold">Ponto nao encontrado</h1>
        <Link to="/map" className="mt-4 inline-block text-primary">
          Voltar ao mapa
        </Link>
      </div>
    </div>
  ),
  component: StationDetail,
});

const statusLabel: Record<Station["status"], string> = {
  DISPONIVEL: "Disponivel",
  OCUPADO: "Ocupado",
  MANUTENCAO: "Em manutencao",
};

function StationDetail() {
  const data = Route.useLoaderData() as { station: Station; reviews: Review[] };
  const { station } = data;
  const [reviews, setReviews] = useState<Review[]>(data.reviews);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewStatus, setReviewStatus] = useState<string | null>(null);

  const avgCharge = reviews.length
    ? reviews.reduce((sum, review) => sum + review.chargeQuality, 0) / reviews.length
    : 0;
  const avgInfra = reviews.length
    ? reviews.reduce((sum, review) => sum + review.infrastructure, 0) / reviews.length
    : 0;
  const totalChargers = station.chargers.reduce((sum, charger) => sum + charger.count, 0);
  const availableChargers = station.chargers.reduce((sum, charger) => sum + charger.available, 0);

  const submitReview = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setReviewStatus("Enviando avaliacao...");

    try {
      const review = await createReviewApi(station.id, {
        rating,
        chargeQuality: rating,
        infrastructure: Math.max(1, rating - 1),
        comment: comment || "Experiencia registrada pelo app Flui.",
      });
      setReviews((prev) => [review, ...prev]);
      setComment("");
      setReviewStatus("Avaliacao enviada para a API.");
    } catch (error) {
      setReviewStatus(error instanceof Error ? error.message : "Nao foi possivel enviar.");
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <section className="relative h-[44vh] min-h-[340px] w-full overflow-hidden">
          <img src={station.cover} alt={station.name} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          <div className="absolute inset-x-0 bottom-0">
            <div className="mx-auto max-w-7xl px-4 pb-8 sm:px-6">
              <Link
                to="/map"
                className="inline-flex items-center gap-1 text-sm font-medium text-primary"
              >
                <ArrowLeft className="h-4 w-4" /> Voltar ao mapa
              </Link>
              <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                    <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                      {"*".repeat(station.fluiStars)} Flui
                    </span>
                    <span className="text-muted-foreground">{station.operator}</span>
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
                  <span className="text-2xl font-semibold">{station.rating.toFixed(1)}</span>
                  <span className="text-xs text-muted-foreground">
                    ({station.reviewsCount} avaliacoes)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-8">
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Metric icon={Zap} label="Potencia maxima" value={`${station.powerKw} kW`} />
              <Metric
                icon={Plug}
                label="Carregadores"
                value={`${availableChargers}/${totalChargers} livres`}
              />
              <Metric icon={Clock} label="Funcionamento" value={station.hours} />
              <Metric
                icon={Star}
                label="Preco por kWh"
                value={`R$ ${station.pricePerKwh.toFixed(2)}`}
              />
            </section>

            <section>
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold">Carregadores e conectores</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Dados simulados de disponibilidade por tipo de plugue.
                  </p>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  {statusLabel[station.status]}
                </span>
              </div>
              <div className="mt-4 overflow-hidden rounded-xl border border-border/70 bg-card shadow-[var(--shadow-card)]">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                        <th className="px-4 py-3 font-semibold">Grupo</th>
                        <th className="px-4 py-3 font-semibold">Conector</th>
                        <th className="px-4 py-3 font-semibold">Potencia</th>
                        <th className="px-4 py-3 font-semibold">Livres</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {station.chargers.map((charger) => (
                        <tr key={charger.id}>
                          <td className="px-4 py-3 font-medium">{charger.label}</td>
                          <td className="px-4 py-3">
                            <span className="rounded bg-secondary px-2 py-1 text-xs font-semibold">
                              {charger.connector}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-primary">{charger.powerKw} kW</td>
                          <td className="px-4 py-3">
                            {charger.available}/{charger.count}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold">Comodidades no local</h2>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {station.amenities.map((amenity) => (
                  <div
                    key={amenity}
                    className="flex items-center gap-2 rounded-lg border border-border/60 bg-card px-3 py-2 text-sm"
                  >
                    <span className="h-2 w-2 rounded-full bg-primary" />
                    {AMENITY_LABELS[amenity] ?? amenity}
                  </div>
                ))}
              </div>
            </section>

            <section>
              <div className="flex flex-wrap items-end justify-between gap-3">
                <h2 className="text-xl font-semibold">Avaliacoes</h2>
                <span className="text-sm text-muted-foreground">
                  {reviews.length} comentarios deste ponto
                </span>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <ScoreBar label="Qualidade da carga" value={avgCharge} />
                <ScoreBar label="Infraestrutura" value={avgInfra} />
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <form
                  onSubmit={submitReview}
                  className="rounded-xl border border-primary/30 bg-primary/5 p-5 shadow-[var(--shadow-card)]"
                >
                  <div className="text-sm font-semibold">Avaliar este ponto</div>
                  <label className="mt-3 block text-sm font-medium">
                    Nota
                    <select
                      value={rating}
                      onChange={(event) => setRating(Number(event.target.value))}
                      className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                    >
                      {[5, 4, 3, 2, 1].map((value) => (
                        <option key={value} value={value}>
                          {value} estrelas
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="mt-3 block text-sm font-medium">
                    Comentario
                    <textarea
                      value={comment}
                      onChange={(event) => setComment(event.target.value)}
                      className="mt-1 min-h-24 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                      placeholder="Como foi sua recarga?"
                    />
                  </label>
                  <button
                    type="submit"
                    className="mt-3 inline-flex h-10 w-full items-center justify-center rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground hover:bg-primary-deep"
                  >
                    Enviar avaliacao
                  </button>
                  {reviewStatus && (
                    <p className="mt-2 text-xs text-muted-foreground">{reviewStatus}</p>
                  )}
                </form>
                {reviews.map((review) => (
                  <article
                    key={review.id}
                    className="rounded-xl border border-border/70 bg-card p-5 shadow-[var(--shadow-card)]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-semibold">{review.userName}</div>
                      <div className="flex items-center gap-1 text-sm text-primary">
                        {Array.from({ length: review.rating }).map((_, index) => (
                          <Star key={index} className="h-4 w-4 fill-primary text-primary" />
                        ))}
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-foreground">{review.comment}</p>
                    <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span>Carga: {review.chargeQuality}/5</span>
                      <span>Infra: {review.infrastructure}/5</span>
                      <span>{new Date(review.date).toLocaleDateString("pt-BR")}</span>
                    </div>
                  </article>
                ))}
                {reviews.length === 0 && (
                  <p className="text-sm text-muted-foreground">Seja o primeiro a avaliar.</p>
                )}
              </div>
            </section>
          </div>

          <aside className="space-y-4">
            <section className="rounded-xl border border-border/70 bg-card p-6 shadow-[var(--shadow-card)]">
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
                {statusLabel[station.status]}
              </div>
              <div className="mt-4 grid gap-2">
                <a
                  href={googleDirectionsUrl(station)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-primary-foreground shadow-[var(--shadow-elegant)] hover:bg-primary-deep"
                >
                  <Navigation className="h-4 w-4" />
                  Iniciar navegacao
                </a>
                <a
                  href={googleMapsUrl(station)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-border bg-background text-sm font-semibold hover:bg-accent"
                >
                  <ExternalLink className="h-4 w-4" />
                  Abrir no Google Maps
                </a>
              </div>
            </section>

            <section className="rounded-xl border border-border/70 bg-card p-6 shadow-[var(--shadow-card)]">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                <BatteryCharging className="h-4 w-4" />
                Operacao Flui
              </div>
              <dl className="mt-4 space-y-3 text-sm">
                <InfoRow
                  label="Sessoes 30d"
                  value={station.sessionsLast30d.toLocaleString("pt-BR")}
                />
                <InfoRow label="Operador" value={station.operator} />
                <InfoRow
                  label="Ultima leitura"
                  value={new Date(station.lastSync).toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                />
              </dl>
            </section>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof Zap; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/70 bg-card p-5 shadow-[var(--shadow-card)]">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </span>
      <div className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  const pct = Math.max(0, Math.min(100, (value / 5) * 100));

  return (
    <div className="rounded-xl border border-border/60 bg-card p-4">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="font-semibold text-primary">{value.toFixed(1)}/5</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-semibold">{value}</dd>
    </div>
  );
}
