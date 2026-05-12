import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { BarChart3, MessageSquare, Zap } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Painel Flui · Admin" }],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  const { pathname } = useLocation();
  const items = [
    { to: "/admin", label: "Dashboard", icon: BarChart3, exact: true },
    { to: "/admin/stations", label: "Estações", icon: Zap, exact: false },
    { to: "/admin/reviews", label: "Moderação", icon: MessageSquare, exact: false },
  ];
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-6 px-4 py-8 sm:px-6">
        <aside className="hidden w-56 shrink-0 lg:block">
          <nav className="sticky top-24 flex flex-col gap-1">
            {items.map((it) => {
              const active = it.exact
                ? pathname === it.to
                : pathname.startsWith(it.to);
              return (
                <Link
                  key={it.to}
                  to={it.to}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  <it.icon className="h-4 w-4" /> {it.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
