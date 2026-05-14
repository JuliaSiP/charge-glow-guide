export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="text-lg font-semibold">
            Flui<span className="text-primary">.</span>
          </div>
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            Curadoria de eletropostos premium pelo Brasil para quem dirige eletrico com
            previsibilidade, conforto e potencia real.
          </p>
        </div>
        <div>
          <div className="text-sm font-semibold">Produto</div>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>Mapa</li>
            <li>Guia Flui</li>
            <li>Painel operacional</li>
          </ul>
        </div>
        <div>
          <div className="text-sm font-semibold">Charge Platform Challenge</div>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>FIAP x Google 2026</li>
            <li>Julia da Silva Pereira</li>
            <li>RM 559627</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60 py-4 text-center text-xs text-muted-foreground">
        2026 Flui - Charge Platform. Prototipo academico.
      </div>
    </footer>
  );
}
