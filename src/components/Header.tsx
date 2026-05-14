import { Link, useLocation } from "@tanstack/react-router";
import { Zap } from "lucide-react";

export function Header() {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith("/admin");

  const links = isAdmin
    ? [
        { to: "/admin", label: "Dashboard" },
        { to: "/admin/stations", label: "Pontos" },
        { to: "/admin/reviews", label: "Avaliacoes" },
      ]
    : [
        { to: "/", label: "Inicio" },
        { to: "/map", label: "Mapa" },
        { to: "/guide", label: "Guia Flui" },
      ];

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link to="/" className="flex min-w-0 items-center gap-2">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-[var(--shadow-elegant)]">
            <Zap className="h-5 w-5" strokeWidth={2.5} />
          </span>
          <span className="text-lg font-semibold tracking-tight">
            Flui<span className="text-primary">.</span>
          </span>
          {isAdmin && (
            <span className="ml-1 rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent-foreground">
              Admin
            </span>
          )}
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              activeOptions={{ exact: link.to === "/" || link.to === "/admin" }}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              activeProps={{
                className: "rounded-md px-3 py-2 text-sm font-semibold text-primary bg-accent",
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          {isAdmin ? (
            <Link
              to="/"
              className="inline-flex h-9 items-center rounded-md border border-input bg-background px-3 text-sm font-medium hover:bg-accent"
            >
              Sair
            </Link>
          ) : (
            <Link
              to="/admin"
              className="hidden h-9 items-center rounded-md border border-input bg-background px-3 text-sm font-medium hover:bg-accent sm:inline-flex"
            >
              Equipe Flui
            </Link>
          )}
          {!isAdmin && (
            <Link
              to="/map"
              className="hidden h-9 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-elegant)] transition hover:bg-primary-deep sm:inline-flex"
            >
              Mapa
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
