import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/guide")({
  head: () => ({
    meta: [
      { title: "Guia Flui - Curadoria de eletropostos" },
      {
        name: "description",
        content: "Entenda como a Flui classifica pontos de recarga em 1, 2 ou 3 estrelas.",
      },
    ],
  }),
  component: Guide,
});

const TIERS = [
  {
    stars: 1,
    title: "Ponto recomendado",
    desc: "Atende ao padrao minimo Flui de potencia declarada, conectores funcionais e seguranca no acesso.",
  },
  {
    stars: 2,
    title: "Vale o desvio",
    desc: "Carregamento confiavel com comodidade extra, como cafe, banheiro limpo ou Wi-Fi.",
  },
  {
    stars: 3,
    title: "Vale a viagem",
    desc: "Experiencia premium completa com lounge, suporte, ultra rapida e estrutura do entorno.",
  },
];

function Guide() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
            Metodologia Flui
          </span>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Como classificamos cada ponto
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            A pontuacao combina auditoria operacional, dados simulados de carga e avaliacoes dos
            motoristas.
          </p>
        </section>

        <section className="mx-auto grid max-w-6xl gap-6 px-4 pb-20 sm:px-6 md:grid-cols-3">
          {TIERS.map((tier) => (
            <article
              key={tier.stars}
              className="rounded-xl border border-border/70 bg-card p-8 shadow-[var(--shadow-card)]"
            >
              <div className="text-3xl text-primary">{"*".repeat(tier.stars)}</div>
              <h2 className="mt-3 text-xl font-semibold">{tier.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{tier.desc}</p>
            </article>
          ))}
        </section>

        <section className="border-t border-border/60 bg-card">
          <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
            <h2 className="text-3xl font-semibold tracking-tight">Criterios avaliados</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {[
                ["Qualidade da carga", "Potencia real entregue, estabilidade e tempo medio."],
                ["Infraestrutura", "Iluminacao, cobertura, sinalizacao e seguranca do acesso."],
                ["Experiencia", "Atendimento, comodidades e conforto durante a recarga."],
                ["Confiabilidade", "Uptime, conectores funcionais e suporte operacional."],
              ].map(([title, description]) => (
                <div key={title} className="border-l-4 border-primary pl-4">
                  <h3 className="font-semibold">{title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                </div>
              ))}
            </div>
            <div className="mt-10">
              <Link
                to="/map"
                className="inline-flex h-12 items-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-elegant)] hover:bg-primary-deep"
              >
                Ver pontos no mapa
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
