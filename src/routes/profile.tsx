import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { getDriverProfile, type DriverProfileResponse } from "@/lib/apiClient";
import { STATIONS } from "@/lib/mockData";
import { BatteryCharging, Car, Clock, Heart, Plug, Star } from "lucide-react";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Perfil do motorista - Flui" },
      {
        name: "description",
        content: "Perfil do motorista Flui com veiculo, favoritos e historico de recarga.",
      },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const [profile, setProfile] = useState<DriverProfileResponse | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    getDriverProfile()
      .then((data) => {
        setProfile(data);
        setApiError(null);
      })
      .catch((error: Error) => setApiError(error.message));
  }, []);

  const user = profile?.user;
  const vehicle = user?.vehicle;
  const favorites = profile?.favorites ?? STATIONS.slice(0, 3);
  const history = profile?.history ?? [];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="mx-auto grid w-full max-w-7xl flex-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="space-y-4">
          <section className="rounded-xl border border-border/70 bg-card p-6 shadow-[var(--shadow-card)]">
            <div className="flex items-center gap-4">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-xl font-semibold text-primary-foreground">
                {(user?.name ?? "A").charAt(0)}
              </span>
              <div>
                <h1 className="text-2xl font-semibold">{user?.name ?? "Motorista Flui"}</h1>
                <p className="text-sm text-muted-foreground">
                  {user?.email ?? "motorista@flui.app"}
                </p>
              </div>
            </div>
            <div className="mt-5 grid gap-3 text-sm">
              <Info icon={Car} label="Veiculo" value={vehicle?.model ?? "Volvo EX30"} />
              <Info icon={Plug} label="Conector" value={vehicle?.connector ?? "CCS2"} />
              <Info icon={BatteryCharging} label="Bateria" value={`${vehicle?.batteryKwh ?? 69} kWh`} />
            </div>
            <Link
              to="/login"
              className="mt-5 inline-flex h-10 w-full items-center justify-center rounded-lg border border-border bg-background text-sm font-semibold hover:bg-accent"
            >
              Trocar perfil
            </Link>
          </section>

          <section className="rounded-xl border border-border/70 bg-card p-5 shadow-[var(--shadow-card)]">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Resumo
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              <MiniMetric label="Sessoes" value={String(profile?.totals.sessions ?? history.length)} />
              <MiniMetric label="kWh" value={(profile?.totals.kwh ?? 0).toFixed(1)} />
              <MiniMetric label="R$" value={(profile?.totals.cost ?? 0).toFixed(0)} />
            </div>
          </section>
        </aside>

        <div className="space-y-6">
          <header>
            <h2 className="text-3xl font-semibold tracking-tight">Minha jornada eletrica</h2>
            <p className="text-sm text-muted-foreground">
              Historico, favoritos e preferencias sincronizados pela API de motorista.
            </p>
          </header>
          {apiError && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              API indisponivel: {apiError}. Exibindo favoritos locais.
            </div>
          )}

          <section>
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              <Heart className="h-4 w-4" /> Favoritos
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {favorites.map((station) => (
                <Link
                  key={station.id}
                  to="/stations/$id"
                  params={{ id: station.id }}
                  className="rounded-xl border border-border/70 bg-card p-4 shadow-[var(--shadow-card)] transition hover:border-primary/40"
                >
                  <div className="text-xs font-semibold uppercase tracking-wide text-primary">
                    {station.powerKw} kW
                  </div>
                  <div className="mt-1 font-semibold">{station.name}</div>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{station.address}</p>
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{station.connectors.join(", ")}</span>
                    <span className="inline-flex items-center gap-1 text-primary">
                      <Star className="h-3.5 w-3.5 fill-primary" /> {station.rating.toFixed(1)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-border/70 bg-card shadow-[var(--shadow-card)]">
            <div className="border-b border-border/60 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                <Clock className="h-4 w-4" /> Historico de recargas
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-4 py-3 font-semibold">Ponto</th>
                    <th className="px-4 py-3 font-semibold">Data</th>
                    <th className="px-4 py-3 font-semibold">Energia</th>
                    <th className="px-4 py-3 font-semibold">Custo</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {history.map((session) => {
                    const station = STATIONS.find((item) => item.id === session.stationId);

                    return (
                      <tr key={session.id}>
                        <td className="min-w-[240px] px-4 py-3 font-medium">
                          {station?.name ?? session.stationId}
                        </td>
                        <td className="px-4 py-3">
                          {new Date(session.startedAt).toLocaleDateString("pt-BR")}
                        </td>
                        <td className="px-4 py-3">{session.kwh.toFixed(1)} kWh</td>
                        <td className="px-4 py-3">R$ {session.cost.toFixed(2)}</td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                            {session.status === "COMPLETED" ? "Concluida" : "Interrompida"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {history.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                        Historico carregado quando a API estiver disponivel.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Info({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Car;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-background px-3 py-2">
      <span className="inline-flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4" /> {label}
      </span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-primary/10 p-3">
      <div className="text-lg font-semibold text-primary">{value}</div>
      <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
    </div>
  );
}
