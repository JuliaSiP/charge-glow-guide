import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/guide")({
  head: () => ({
    meta: [
      { title: "Guia Flui · Curadoria de eletropostos" },
      {
        name: "description",
        content:
          "Entenda como Flui audita e classifica estações de recarga em 1, 2 ou 3 estrelas, no estilo Michelin.",
      },
    ],
  }),
  component: Guide,
});

const TIERS = [
  {
    stars: 1,
    title: "Estação recomendada",
    desc: "Atende ao padrão mínimo Flui de potência declarada, conectores funcionais e segurança no acesso.",
  },
  {
    stars: 2,
    title: "Vale o desvio",
    desc: "Carregamento confiável + comodidade extra (café, banheiro limpo, Wi-Fi). Ideal para a rotina.",
  },
  {
    stars: 3,
    title: "Vale a viagem",
    desc: "Experiência premium completa: lounge, atendimento, ultra-rápida e gastronomia no entorno.",
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
            Como classificamos cada estação
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Inspirados no Guia Michelin, atribuímos de 1 a 3 estrelas Flui
            depois de auditoria presencial, dados de carga reais e curadoria do
            time editorial.
          </p>
        </section>

        <section className="mx-auto grid max-w-6xl gap-6 px-4 pb-20 sm:px-6 md:grid-cols-3">
          {TIERS.map((t) => (
            <article
              key={t.stars}
              className="rounded-3xl border border-border/70 bg-card p-8 shadow-[var(--shadow-card)]"
            >
              <div className="text-3xl text-primary">
                {Array.from({ length: t.stars }).map((_, i) => "★").join("")}
              </div>
              <h2 className="mt-3 text-xl font-semibold">{t.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{t.desc}</p>
            </article>
          ))}
        </section>

        <section className="border-t border-border/60 bg-card">
          <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
            <h2 className="text-3xl font-semibold tracking-tight">
              Critérios avaliados
            </h2>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {[
                ["Qualidade da carga", "Potência real entregue × declarada, estabilidade e tempo médio."],
                ["Infraestrutura", "Iluminação, cobertura, sinalização e segurança do acesso."],
                ["Experiência", "Atendimento, comodidades e ambiência do entorno."],
                ["Confiabilidade", "Uptime, conectores funcionais e suporte 24/7."],
              ].map(([t, d]) => (
                <div key={t} className="border-l-4 border-primary pl-4">
                  <h3 className="font-semibold">{t}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{d}</p>
                </div>
              ))}
            </div>
            <div className="mt-10">
              <Link
                to="/map"
                className="inline-flex h-12 items-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-elegant)] hover:bg-primary-deep"
              >
                Ver estações no mapa →
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
