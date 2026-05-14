import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Header } from "@/components/Header";
import { login } from "@/lib/apiClient";
import { ShieldCheck, Smartphone, Zap } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [{ title: "Entrar - Flui" }],
  }),
  component: LoginPage,
});

const DEMO_ACCOUNTS = [
  {
    role: "DRIVER" as const,
    title: "Motorista",
    email: "motorista@flui.app",
    password: "flui123",
    description: "Acessa mapa, perfil, historico e envio de avaliacoes.",
    icon: Smartphone,
    redirect: "/map",
  },
  {
    role: "ADMIN" as const,
    title: "Equipe Flui",
    email: "admin@flui.com.br",
    password: "admin123",
    description: "Acessa painel, disponibilidade, avaliacoes e relatorios.",
    icon: ShieldCheck,
    redirect: "/admin",
  },
];

function LoginPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<string | null>(null);

  const enter = async (account: (typeof DEMO_ACCOUNTS)[number]) => {
    setStatus(`Entrando como ${account.title}...`);

    try {
      const session = await login(account.email, account.password);
      window.localStorage.setItem("flui-demo-token", session.token);
      window.localStorage.setItem("flui-demo-role", session.user.role);
      setStatus(`Sessao ${account.title} ativa.`);
      await navigate({ to: account.redirect });
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Nao foi possivel autenticar.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl flex-col justify-center px-4 py-10 sm:px-6">
        <div className="mb-8 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
            <Zap className="h-3.5 w-3.5" /> Autenticacao diferenciada
          </div>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">Entrar na Flui</h1>
          <p className="mt-2 text-muted-foreground">
            Selecione um perfil demo para receber um token REST e acessar os fluxos de motorista ou
            administrador.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {DEMO_ACCOUNTS.map((account) => (
            <button
              key={account.role}
              type="button"
              onClick={() => enter(account)}
              className="group rounded-xl border border-border/70 bg-card p-6 text-left shadow-[var(--shadow-card)] transition hover:border-primary/50"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <account.icon className="h-5 w-5" />
              </span>
              <h2 className="mt-5 text-2xl font-semibold">{account.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{account.description}</p>
              <div className="mt-5 rounded-lg bg-background p-3 text-xs text-muted-foreground">
                <div>
                  <span className="font-semibold text-foreground">Email:</span> {account.email}
                </div>
                <div>
                  <span className="font-semibold text-foreground">Senha:</span> {account.password}
                </div>
              </div>
              <span className="mt-5 inline-flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground group-hover:bg-primary-deep">
                Entrar como {account.title}
              </span>
            </button>
          ))}
        </div>
        {status && <p className="mt-5 text-sm text-muted-foreground">{status}</p>}
      </main>
    </div>
  );
}
