import { Link } from "@tanstack/react-router";
import { Star, Zap, MapPin } from "lucide-react";
import type { Station } from "@/lib/mockData";

const statusStyles: Record<Station["status"], string> = {
  DISPONIVEL: "bg-primary/10 text-primary",
  OCUPADO: "bg-amber-100 text-amber-700",
  MANUTENCAO: "bg-muted text-muted-foreground",
};

const statusLabel: Record<Station["status"], string> = {
  DISPONIVEL: "Disponível",
  OCUPADO: "Ocupado",
  MANUTENCAO: "Manutenção",
};

export function StationCard({ station }: { station: Station }) {
  return (
    <Link
      to="/stations/$id"
      params={{ id: station.id }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-elegant)]"
    >
      <div className="relative h-44 w-full overflow-hidden bg-muted">
        <img
          src={station.cover}
          alt={station.name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-background/90 px-2 py-1 text-xs font-semibold backdrop-blur">
          {Array.from({ length: station.fluiStars }).map((_, i) => (
            <span key={i} className="text-primary">★</span>
          ))}
          <span className="text-muted-foreground">Flui</span>
        </div>
        <span
          className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[station.status]}`}
        >
          {statusLabel[station.status]}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <h3 className="text-base font-semibold leading-tight">{station.name}</h3>
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" /> {station.address}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {station.connectors.map((c) => (
            <span
              key={c}
              className="rounded-md bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground"
            >
              {c}
            </span>
          ))}
        </div>
        <div className="mt-auto flex items-center justify-between border-t border-border/60 pt-3 text-sm">
          <span className="flex items-center gap-1 font-semibold text-primary">
            <Zap className="h-4 w-4" /> {station.powerKw} kW
          </span>
          <span className="flex items-center gap-1 font-medium">
            <Star className="h-4 w-4 fill-primary text-primary" />
            {station.rating.toFixed(1)}
            <span className="text-xs text-muted-foreground">
              ({station.reviewsCount})
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}
