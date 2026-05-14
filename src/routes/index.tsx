import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { StationCard } from "@/components/StationCard";
import { STATIONS } from "@/lib/mockData";
import { Award, MapPin, ShieldCheck, Sparkles, Zap } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Flui - Guia de pontos de recarga" },
      {
        name: "description",
        content:
          "Flui conecta motoristas a pontos de recarga eletrica com mapa, filtros, fichas detalhadas e avaliacao da experiencia.",
      },
      { property: "og:title", content: "Flui - Charge Platform" },
      {
        property: "og:description",
        content:
          "Mapa Google, curadoria Flui e painel operacional para pontos de recarga eletrica.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  const top = STATIONS.filter((station) => station.fluiStars >= 2).slice(0, 3);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <section className="relative min-h-[calc(100vh-7rem)] overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=1800&q=80"
            alt="Carro eletrico carregando em ponto Flui"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/20" />
          <div className="relative mx-auto flex min-h-[calc(100vh-7rem)] max-w-7xl items-center px-4 py-16 sm:px-6">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-background/80 px-3 py-1 text-xs font-semibold text-primary backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" /> Charge Platform Challenge
              </span>
              <h1 className="mt-5 text-5xl font-semibold leading-tight tracking-tight sm:text-6xl">
                Flui.
              </h1>
              <p className="mt-5 max-w-xl text-lg text-muted-foreground">
                Um guia vivo para motoristas eletricos encontrarem pontos de recarga confiaveis,
                comparar conectores e navegar direto pelo Google Maps.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/map"
                  className="inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-elegant)] transition hover:bg-primary-deep"
                >
                  <MapPin className="h-4 w-4" /> Explorar mapa
                </Link>
                <Link
                  to="/admin"
                  className="inline-flex h-12 items-center gap-2 rounded-xl border border-border bg-background/90 px-6 text-sm font-semibold backdrop-blur hover:bg-accent"
                >
                  <Zap className="h-4 w-4" /> Painel Flui
                </Link>
              </div>
              <dl className="mt-10 grid max-w-lg grid-cols-3 gap-5">
                {[
                  [STATIONS.length.toString(), "pontos simulados"],
                  ["Google", "mapa integrado"],
                  ["4.7", "nota media"],
                ].map(([value, label]) => (
                  <div key={label}>
                    <dt className="text-2xl font-semibold text-primary">{value}</dt>
                    <dd className="text-xs uppercase tracking-wide text-muted-foreground">
                      {label}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        <section className="border-y border-border/60 bg-card">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 md:grid-cols-3">
            {[
              {
                icon: Award,
                title: "Curadoria Flui",
                desc: "Pontos recebem 1, 2 ou 3 estrelas por qualidade da carga, infraestrutura e experiencia.",
              },
              {
                icon: ShieldCheck,
                title: "Dados operacionais",
                desc: "Potencia, conectores, status e comodidades ficam claros antes de iniciar a rota.",
              },
              {
                icon: Sparkles,
                title: "Experiencia completa",
                desc: "Mapa para motoristas e painel administrativo para a equipe manter a rede atualizada.",
              },
            ].map((feature) => (
              <div key={feature.title} className="flex gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <feature.icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight">Pontos em destaque</h2>
              <p className="mt-2 text-muted-foreground">
                Selecionados para demonstrar o fluxo mobile do motorista.
              </p>
            </div>
            <Link
              to="/map"
              className="hidden text-sm font-semibold text-primary hover:underline sm:inline"
            >
              Ver todos no mapa
            </Link>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {top.map((station) => (
              <StationCard key={station.id} station={station} />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
