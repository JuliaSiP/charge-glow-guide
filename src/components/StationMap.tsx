import { useEffect, useState } from "react";
import type { Station } from "@/lib/mockData";

interface Props {
  stations: Station[];
  selectedId?: string;
  onSelect?: (id: string) => void;
  height?: string;
}

export function StationMap({ stations, selectedId, onSelect, height = "100%" }: Props) {
  const [mounted, setMounted] = useState(false);
  const [Comp, setComp] = useState<null | {
    MapContainer: any;
    TileLayer: any;
    CircleMarker: any;
    Tooltip: any;
    Popup: any;
  }>(null);

  useEffect(() => {
    setMounted(true);
    import("react-leaflet").then((m) => {
      setComp({
        MapContainer: m.MapContainer,
        TileLayer: m.TileLayer,
        CircleMarker: m.CircleMarker,
        Tooltip: m.Tooltip,
        Popup: m.Popup,
      });
    });
  }, []);

  if (!mounted || !Comp) {
    return (
      <div
        style={{ height }}
        className="flex w-full items-center justify-center rounded-xl bg-muted text-sm text-muted-foreground"
      >
        Carregando mapa…
      </div>
    );
  }

  const { MapContainer, TileLayer, CircleMarker, Tooltip, Popup } = Comp;

  const center: [number, number] = [-23.5765, -46.6738];

  const colorFor = (s: Station) => {
    if (s.status === "DISPONIVEL") return "#ED7E1D";
    if (s.status === "OCUPADO") return "#a16207";
    return "#9ca3af";
  };

  return (
    <div style={{ height }} className="w-full overflow-hidden rounded-xl">
      <MapContainer
        center={center}
        zoom={12}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {stations.map((s) => {
          const active = s.id === selectedId;
          return (
            <CircleMarker
              key={s.id}
              center={[s.lat, s.lng]}
              radius={active ? 14 : 10}
              pathOptions={{
                color: colorFor(s),
                fillColor: colorFor(s),
                fillOpacity: active ? 0.9 : 0.7,
                weight: active ? 4 : 2,
              }}
              eventHandlers={{ click: () => onSelect?.(s.id) }}
            >
              <Tooltip direction="top" offset={[0, -8]}>
                <strong>{s.name}</strong> — {s.powerKw} kW
              </Tooltip>
              <Popup>
                <div className="text-sm">
                  <div className="font-semibold">{s.name}</div>
                  <div className="text-xs opacity-70">{s.address}</div>
                  <div className="mt-1">
                    {s.powerKw} kW · {s.connectors.join(", ")}
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
