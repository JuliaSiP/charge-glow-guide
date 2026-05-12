import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { StationCard } from "@/components/StationCard";
import { STATIONS } from "@/lib/mockData";
import { Award, MapPin, ShieldCheck, Sparkles, Zap } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Flui — O guia Michelin dos eletropostos" },
      {
        name: "description",
        content:
          "Flui é a plataforma de curadoria de pontos de recarga elétrica. Encontre estações premium com qualidade garantida, comodidades e potência real.",
      },
      { property: "og:title", content: "Flui — Charge Platform" },
      {
        property: "og:description",
        content:
          "Curadoria estilo Michelin para a mobilidade elétrica. Encontre, avalie e recarregue com confiança.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  const top = STATIONS.filter((s) => s.fluiStars >= 2).slice(0, 3);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            className="absolute inset-0 -z-10"
            style={{ background: "var(--gradient-warm)" }}
          />
          <div className="absolute -right-32 -top-32 -z-10 h-96 w-96 rounded-full bg-primary/15 blur-3xl" />
          <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 md:grid-cols-2 md:py-28 md:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
                <Sparkles className="h-3.5 w-3.5" /> Charge Platform Challenge · FIAP × Google 2026
              </span>
              <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl md:text-6xl">
                O guia <span className="text-primary">Michelin</span> dos
                eletropostos.
              </h1>
              <p className="mt-5 max-w-xl text-lg text-muted-foreground">
                Flui é uma curadoria viva de pontos de recarga premium. Cada
                estação é avaliada por qualidade da carga, infraestrutura e
                experiência — para você dirigir elétrico com a mesma exigência
                de quem escolhe um bom restaurante.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/map"
                  className="inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-elegant)] transition hover:bg-primary-deep"
                >
                  <MapPin className="h-4 w-4" /> Explorar o mapa
                </Link>
                <Link
                  to="/guide"
                  className="inline-flex h-12 items-center gap-2 rounded-xl border border-border bg-background px-6 text-sm font-semibold hover:bg-accent"
                >
                  Conhecer o Guia Flui
                </Link>
              </div>
              <dl className="mt-10 grid max-w-md grid-cols-3 gap-6">
                {[
                  ["+1.2K", "estações curadas"],
                  ["98%", "uptime médio"],
                  ["4.7", "nota Flui"],
                ].map(([k, v]) => (
                  <div key={v}>
                    <dt className="text-2xl font-semibold text-primary">{k}</dt>
                    <dd className="text-xs uppercase tracking-wide text-muted-foreground">
                      {v}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 -z-10 rounded-3xl bg-primary/10 blur-2xl" />
              <div className="overflow-hidden rounded-3xl border border-border/70 bg-card shadow-[var(--shadow-elegant)]">
                <img
                  src="https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=1200&q=70"
                  alt="Veículo elétrico carregando em estação Flui"
                  className="h-[420px] w-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 hidden rounded-2xl border border-border/70 bg-card p-4 shadow-[var(--shadow-card)] sm:block">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                    <Zap className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">
                      Potência média
                    </div>
                    <div className="text-lg font-semibold">122 kW</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Selos */}
        <section className="border-y border-border/60 bg-card">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 md:grid-cols-3">
            {[
              {
                icon: Award,
                title: "Curadoria estilo Michelin",
                desc: "Estações recebem 1, 2 ou 3 estrelas Flui após auditoria presencial e dados de carga.",
              },
              {
                icon: ShieldCheck,
                title: "Qualidade garantida",
                desc: "Monitoramos potência real entregue, conectores funcionais e tempo médio de espera.",
              },
              {
                icon: Sparkles,
                title: "Experiência premium",
                desc: "Lounges, café e Wi-Fi: porque recarregar bem é tão importante quanto rodar bem.",
              },
            ].map((f) => (
              <div key={f.title} className="flex gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <f.icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-semibold">{f.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Top estações */}
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight">
                Estações em destaque
              </h2>
              <p className="mt-2 text-muted-foreground">
                Selecionadas pelo time editorial Flui esta semana.
              </p>
            </div>
            <Link
              to="/map"
              className="hidden text-sm font-semibold text-primary hover:underline sm:inline"
            >
              Ver todas no mapa →
            </Link>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {top.map((s) => (
              <StationCard key={s.id} station={s} />
            ))}
          </div>
        </section>

        {/* CTA Admin */}
        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
          <div className="overflow-hidden rounded-3xl border border-border/70 bg-card p-10 shadow-[var(--shadow-card)] md:p-14">
            <div className="grid gap-8 md:grid-cols-2 md:items-center">
              <div>
                <h3 className="text-3xl font-semibold tracking-tight">
                  Operação em tempo real
                </h3>
                <p className="mt-3 text-muted-foreground">
                  A equipe Flui acompanha o status de cada carregador, modera
                  avaliações e mantém a qualidade da rede em um único painel.
                </p>
              </div>
              <div className="flex md:justify-end">
                <Link
                  to="/admin"
                  className="inline-flex h-12 items-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-elegant)] hover:bg-primary-deep"
                >
                  Acessar painel Flui →
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
