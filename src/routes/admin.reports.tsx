import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
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
import { getReports } from "@/lib/apiClient";
import type { NetworkReport } from "@/lib/database";
import { Activity, BatteryCharging, Plug, Star, Wallet } from "lucide-react";

export const Route = createFileRoute("/admin/reports")({
  component: AdminReports,
});

function AdminReports() {
  const [report, setReport] = useState<NetworkReport | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    getReports()
      .then((data) => {
        setReport(data);
        setApiError(null);
      })
      .catch((error: Error) => setApiError(error.message));
  }, []);

  const topStations =
    report?.topStations.map((station) => ({
      name: station.name.replace("Flui ", ""),
      sessoes: station.sessions,
      receita: station.revenue,
    })) ?? [];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Relatorios</h1>
        <p className="text-sm text-muted-foreground">
          Indicadores operacionais, receita simulada e disponibilidade gerados pela API.
        </p>
      </header>
      {apiError && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          API indisponivel: {apiError}.
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <KPI
          icon={Activity}
          label="Sessoes 30d"
          value={report ? report.totals.sessionsLast30d.toLocaleString("pt-BR") : "-"}
        />
        <KPI
          icon={Wallet}
          label="Receita"
          value={report ? `R$ ${report.totals.revenueLast30d.toLocaleString("pt-BR")}` : "-"}
        />
        <KPI icon={Plug} label="Carregadores" value={String(report?.totals.chargers ?? "-")} />
        <KPI
          icon={BatteryCharging}
          label="Disponiveis"
          value={String(report?.totals.availableChargers ?? "-")}
        />
        <KPI
          icon={Star}
          label="Nota media"
          value={report ? report.totals.averageRating.toFixed(2) : "-"}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <ChartBox title="Sessoes por dia">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={report?.sessionsByDay ?? []}>
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
        </ChartBox>

        <ChartBox title="Receita por ponto">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topStations} layout="vertical" margin={{ left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 70)" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="receita" fill="#ED7E1D" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartBox>
      </section>

      <section className="rounded-xl border border-border/70 bg-card shadow-[var(--shadow-card)]">
        <div className="border-b border-border/60 p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Disponibilidade por ponto
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 font-semibold">Ponto</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Livres</th>
                <th className="px-4 py-3 font-semibold">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {report?.availabilityByStation.map((station) => (
                <tr key={station.stationId}>
                  <td className="min-w-[260px] px-4 py-3 font-medium">{station.name}</td>
                  <td className="px-4 py-3">{station.status}</td>
                  <td className="px-4 py-3 text-primary">{station.available}</td>
                  <td className="px-4 py-3">{station.chargers}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function KPI({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border/70 bg-card p-5 shadow-[var(--shadow-card)]">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </span>
      <div className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );
}

function ChartBox({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-border/70 bg-card p-6 shadow-[var(--shadow-card)]">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h2>
      <div className="mt-4 h-72">{children}</div>
    </div>
  );
}
