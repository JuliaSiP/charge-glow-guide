import { createFileRoute } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { REVIEWS, STATIONS } from "@/lib/mockData";
import { Activity, Star, TrendingUp, Zap } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const totalSessions = STATIONS.reduce((a, s) => a + s.sessionsLast30d, 0);
  const avgRating =
    STATIONS.reduce((a, s) => a + s.rating, 0) / STATIONS.length;
  const operational = STATIONS.filter((s) => s.status !== "MANUTENCAO").length;

  const topStations = [...STATIONS]
    .sort((a, b) => b.sessionsLast30d - a.sessionsLast30d)
    .slice(0, 5)
    .map((s) => ({ name: s.name.replace("Flui ", ""), sessoes: s.sessionsLast30d }));

  const trend = Array.from({ length: 14 }, (_, i) => ({
    dia: `D${i + 1}`,
    sessoes: 120 + Math.round(Math.sin(i / 2) * 35) + i * 6,
  }));

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Visão geral da rede Flui · últimos 30 dias
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPI icon={Zap} label="Estações ativas" value={`${operational}/${STATIONS.length}`} />
        <KPI icon={Activity} label="Sessões (30d)" value={totalSessions.toLocaleString("pt-BR")} />
        <KPI icon={Star} label="Nota média" value={avgRating.toFixed(2)} />
        <KPI icon={TrendingUp} label="Avaliações" value={REVIEWS.length.toString()} />
      </section>

      <section className="grid gap-6 lg:grid-cols-5">
        <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-[var(--shadow-card)] lg:col-span-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Sessões por dia
          </h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 70)" />
                <XAxis dataKey="dia" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="sessoes"
                  stroke="#ED7E1D"
                  strokeWidth={3}
                  dot={{ fill: "#ED7E1D", r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-[var(--shadow-card)] lg:col-span-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Top estações
          </h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topStations} layout="vertical" margin={{ left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 70)" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={110}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip />
                <Bar dataKey="sessoes" fill="#ED7E1D" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border/70 bg-card p-6 shadow-[var(--shadow-card)]">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Avaliações recentes
        </h2>
        <ul className="mt-4 divide-y divide-border/60">
          {REVIEWS.slice(0, 4).map((r) => {
            const station = STATIONS.find((s) => s.id === r.stationId);
            return (
              <li key={r.id} className="flex items-start gap-4 py-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {r.userName.charAt(0)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">{r.userName}</span>
                    <span className="text-xs text-muted-foreground">
                      {station?.name}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-sm text-muted-foreground">
                    {r.comment}
                  </p>
                </div>
                <span className="flex items-center gap-1 text-sm font-semibold text-primary">
                  <Star className="h-3.5 w-3.5 fill-primary" /> {r.rating}
                </span>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

function KPI({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Zap;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <div className="mt-3 text-3xl font-semibold">{value}</div>
    </div>
  );
}
