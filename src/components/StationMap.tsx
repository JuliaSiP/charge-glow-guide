import { useEffect, useMemo, useRef, useState } from "react";
import { ExternalLink, MapPin } from "lucide-react";
import { googleMapsUrl, type Station } from "@/lib/mockData";

interface Props {
  stations: Station[];
  selectedId?: string;
  onSelect?: (id: string) => void;
  height?: string;
}

type GoogleLatLng = { lat: number; lng: number };
type GoogleMap = {
  fitBounds: (bounds: GoogleBounds) => void;
  panTo: (position: GoogleLatLng) => void;
  setZoom: (zoom: number) => void;
};
type GoogleMarker = {
  addListener: (eventName: string, handler: () => void) => void;
  setMap: (map: GoogleMap | null) => void;
  setIcon: (icon: Record<string, unknown>) => void;
};
type GoogleInfoWindow = {
  open: (options: { anchor: GoogleMarker; map: GoogleMap }) => void;
};
type GoogleBounds = {
  extend: (position: GoogleLatLng) => void;
};
type GoogleMapsApi = {
  maps: {
    Map: new (node: HTMLElement, options: Record<string, unknown>) => GoogleMap;
    Marker: new (options: Record<string, unknown>) => GoogleMarker;
    InfoWindow: new (options: { content: string }) => GoogleInfoWindow;
    LatLngBounds: new () => GoogleBounds;
  };
};

declare global {
  interface Window {
    google?: GoogleMapsApi;
    initFluiGoogleMaps?: () => void;
  }
}

const DEFAULT_CENTER = { lat: -23.5765, lng: -46.6738 };

const statusColor: Record<Station["status"], string> = {
  DISPONIVEL: "#ED7E1D",
  OCUPADO: "#B45309",
  MANUTENCAO: "#6B7280",
};

const statusLabel: Record<Station["status"], string> = {
  DISPONIVEL: "Disponivel",
  OCUPADO: "Ocupado",
  MANUTENCAO: "Manutencao",
};

const googleMapsPromise = { current: null as Promise<GoogleMapsApi> | null };

function loadGoogleMaps() {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

  if (window.google) return Promise.resolve(window.google);
  if (!apiKey) return Promise.reject(new Error("missing-google-maps-key"));
  if (googleMapsPromise.current) return googleMapsPromise.current;

  googleMapsPromise.current = new Promise((resolve, reject) => {
    window.initFluiGoogleMaps = () => {
      if (window.google) resolve(window.google);
      else reject(new Error("google-maps-unavailable"));
    };

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initFluiGoogleMaps`;
    script.async = true;
    script.defer = true;
    script.onerror = () => reject(new Error("google-maps-script-error"));
    document.head.appendChild(script);
  });

  return googleMapsPromise.current;
}

export function StationMap({ stations, selectedId, onSelect, height = "100%" }: Props) {
  const mapNode = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<GoogleMap | null>(null);
  const markersRef = useRef<GoogleMarker[]>([]);
  const [useGoogleMap, setUseGoogleMap] = useState(
    Boolean(import.meta.env.VITE_GOOGLE_MAPS_API_KEY),
  );
  const [isGoogleReady, setIsGoogleReady] = useState(false);

  useEffect(() => {
    if (!useGoogleMap) return;

    let cancelled = false;

    loadGoogleMaps()
      .then((google) => {
        if (cancelled || !mapNode.current) return;

        const map = new google.maps.Map(mapNode.current, {
          center: DEFAULT_CENTER,
          zoom: 12,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          clickableIcons: false,
          styles: [
            {
              featureType: "poi.business",
              stylers: [{ visibility: "off" }],
            },
            {
              featureType: "transit",
              stylers: [{ saturation: -45 }],
            },
          ],
        });

        mapRef.current = map;
        setIsGoogleReady(true);
      })
      .catch(() => {
        setIsGoogleReady(false);
        setUseGoogleMap(false);
      });

    return () => {
      cancelled = true;
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];
    };
  }, [useGoogleMap]);

  useEffect(() => {
    if (!isGoogleReady || !mapRef.current || !window.google) return;

    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    const google = window.google;
    const bounds = new google.maps.LatLngBounds();

    stations.forEach((station) => {
      const isActive = station.id === selectedId;
      const marker = new google.maps.Marker({
        position: { lat: station.lat, lng: station.lng },
        map: mapRef.current,
        title: station.name,
        icon: {
          path: "M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7Z",
          fillColor: statusColor[station.status],
          fillOpacity: 1,
          strokeColor: "#FFFFFF",
          strokeWeight: isActive ? 4 : 2,
          scale: isActive ? 1.55 : 1.25,
        },
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="max-width:220px;font-family:Inter,system-ui,sans-serif">
            <strong>${station.name}</strong>
            <div style="margin-top:4px;color:#6b7280;font-size:12px">${station.address}</div>
            <div style="margin-top:8px;font-size:12px">${station.powerKw} kW - ${station.connectors.join(", ")}</div>
          </div>
        `,
      });

      marker.addListener("click", () => {
        onSelect?.(station.id);
        infoWindow.open({ anchor: marker, map: mapRef.current! });
      });

      bounds.extend({ lat: station.lat, lng: station.lng });
      markersRef.current.push(marker);
    });

    if (stations.length > 1) mapRef.current.fitBounds(bounds);
    if (stations.length === 1) {
      mapRef.current.panTo({ lat: stations[0].lat, lng: stations[0].lng });
      mapRef.current.setZoom(15);
    }
  }, [isGoogleReady, onSelect, selectedId, stations]);

  const selectedStation = useMemo(
    () => stations.find((station) => station.id === selectedId),
    [selectedId, stations],
  );

  if (useGoogleMap) {
    return (
      <div style={{ height }} className="relative w-full overflow-hidden rounded-xl">
        <div ref={mapNode} className="h-full w-full" />
        {!isGoogleReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted text-sm text-muted-foreground">
            Carregando Google Maps
          </div>
        )}
        <MapAttribution selectedStation={selectedStation} />
      </div>
    );
  }

  return (
    <FallbackGoogleMap
      stations={stations}
      selectedId={selectedId}
      selectedStation={selectedStation}
      onSelect={onSelect}
      height={height}
    />
  );
}

function FallbackGoogleMap({
  stations,
  selectedId,
  selectedStation,
  onSelect,
  height,
}: Props & { selectedStation?: Station }) {
  const bounds = useMemo(() => {
    const lats = stations.map((station) => station.lat);
    const lngs = stations.map((station) => station.lng);

    return {
      minLat: Math.min(...lats, DEFAULT_CENTER.lat - 0.04),
      maxLat: Math.max(...lats, DEFAULT_CENTER.lat + 0.04),
      minLng: Math.min(...lngs, DEFAULT_CENTER.lng - 0.04),
      maxLng: Math.max(...lngs, DEFAULT_CENTER.lng + 0.04),
    };
  }, [stations]);

  const positionFor = (station: Station) => {
    const x = ((station.lng - bounds.minLng) / (bounds.maxLng - bounds.minLng || 1)) * 82 + 9;
    const y = (1 - (station.lat - bounds.minLat) / (bounds.maxLat - bounds.minLat || 1)) * 76 + 12;

    return { left: `${x}%`, top: `${y}%` };
  };

  return (
    <div
      style={{ height }}
      className="relative w-full overflow-hidden rounded-xl border border-border/70 bg-[#edf2ef]"
    >
      <iframe
        title="Google Maps Sao Paulo"
        src="https://www.google.com/maps?q=Sao%20Paulo%20pontos%20de%20recarga&z=12&output=embed"
        className="absolute inset-0 h-full w-full opacity-80"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,.42)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,.42)_1px,transparent_1px)] bg-[size:72px_72px] mix-blend-screen" />
      {stations.map((station) => {
        const active = station.id === selectedId;

        return (
          <button
            key={station.id}
            type="button"
            onClick={() => onSelect?.(station.id)}
            aria-label={`Selecionar ${station.name}`}
            className="absolute z-10 -translate-x-1/2 -translate-y-full transition hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary/60"
            style={positionFor(station)}
          >
            <span
              className={`flex items-center justify-center rounded-full border-2 border-white text-white shadow-lg ${
                active ? "h-10 w-10" : "h-8 w-8"
              }`}
              style={{ backgroundColor: statusColor[station.status] }}
            >
              <MapPin className={active ? "h-5 w-5" : "h-4 w-4"} />
            </span>
          </button>
        );
      })}
      {selectedStation && (
        <div className="absolute bottom-3 left-3 right-3 z-20 rounded-xl border border-border/70 bg-card/95 p-3 shadow-[var(--shadow-elegant)] backdrop-blur sm:left-auto sm:max-w-xs">
          <div className="text-xs font-semibold text-primary">
            {statusLabel[selectedStation.status]} - {selectedStation.powerKw} kW
          </div>
          <div className="mt-1 text-sm font-semibold">{selectedStation.name}</div>
          <div className="text-xs text-muted-foreground">
            {selectedStation.connectors.join(", ")}
          </div>
        </div>
      )}
      <MapAttribution selectedStation={selectedStation} />
    </div>
  );
}

function MapAttribution({ selectedStation }: { selectedStation?: Station }) {
  const href = selectedStation
    ? googleMapsUrl(selectedStation)
    : "https://www.google.com/maps/search/?api=1&query=charging+stations+Sao+Paulo";

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="absolute right-3 top-3 z-30 inline-flex items-center gap-1 rounded-full border border-border/70 bg-card/95 px-3 py-1 text-xs font-semibold text-foreground shadow-sm backdrop-blur hover:bg-accent"
    >
      Google Maps <ExternalLink className="h-3 w-3" />
    </a>
  );
}
