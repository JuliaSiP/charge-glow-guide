export type ConnectorType = "Tipo 2" | "CCS2" | "CHAdeMO" | "GB/T";
export type StationStatus = "DISPONIVEL" | "OCUPADO" | "MANUTENCAO";

export interface Amenity {
  key: string;
  label: string;
}

export interface Review {
  id: string;
  stationId: string;
  userName: string;
  rating: number;
  chargeQuality: number;
  infrastructure: number;
  comment: string;
  date: string;
}

export interface Station {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  powerKw: number;
  connectors: ConnectorType[];
  status: StationStatus;
  hours: string;
  amenities: string[];
  rating: number;
  reviewsCount: number;
  fluiStars: 1 | 2 | 3; // Conceito Michelin
  cover: string;
  pricePerKwh: number;
  sessionsLast30d: number;
}

const cover = (seed: string) =>
  `https://images.unsplash.com/${seed}?auto=format&fit=crop&w=900&q=70`;

export const STATIONS: Station[] = [
  {
    id: "st-001",
    name: "Flui Station — Av. Paulista",
    address: "Av. Paulista, 1578 — Bela Vista, São Paulo",
    lat: -23.5614,
    lng: -46.6558,
    powerKw: 150,
    connectors: ["CCS2", "Tipo 2"],
    status: "DISPONIVEL",
    hours: "24h",
    amenities: ["wifi", "cafe", "banheiro", "lounge"],
    rating: 4.8,
    reviewsCount: 214,
    fluiStars: 3,
    cover: cover("photo-1593941707882-a5bba14938c7"),
    pricePerKwh: 1.89,
    sessionsLast30d: 482,
  },
  {
    id: "st-002",
    name: "Flui Hub — Shopping Iguatemi",
    address: "Av. Brigadeiro Faria Lima, 2232 — Jardim Paulistano",
    lat: -23.5762,
    lng: -46.6896,
    powerKw: 120,
    connectors: ["CCS2", "Tipo 2", "CHAdeMO"],
    status: "OCUPADO",
    hours: "08h — 22h",
    amenities: ["wifi", "cafe", "banheiro", "compras"],
    rating: 4.6,
    reviewsCount: 168,
    fluiStars: 2,
    cover: cover("photo-1611288875785-f725a25f1c81"),
    pricePerKwh: 1.79,
    sessionsLast30d: 391,
  },
  {
    id: "st-003",
    name: "Flui Express — Posto Ibirapuera",
    address: "Av. República do Líbano, 1551 — Ibirapuera",
    lat: -23.5876,
    lng: -46.6573,
    powerKw: 60,
    connectors: ["Tipo 2"],
    status: "DISPONIVEL",
    hours: "06h — 23h",
    amenities: ["banheiro", "cafe"],
    rating: 4.2,
    reviewsCount: 92,
    fluiStars: 1,
    cover: cover("photo-1633505650400-7ff7d7b2bf45"),
    pricePerKwh: 1.69,
    sessionsLast30d: 220,
  },
  {
    id: "st-004",
    name: "Flui Premium — JK Iguatemi",
    address: "Av. Pres. Juscelino Kubitschek, 2041 — Vila Olímpia",
    lat: -23.5955,
    lng: -46.6857,
    powerKw: 180,
    connectors: ["CCS2", "Tipo 2"],
    status: "DISPONIVEL",
    hours: "24h",
    amenities: ["wifi", "cafe", "lounge", "valet", "banheiro"],
    rating: 4.9,
    reviewsCount: 305,
    fluiStars: 3,
    cover: cover("photo-1558981806-ec527fa84c39"),
    pricePerKwh: 1.99,
    sessionsLast30d: 540,
  },
  {
    id: "st-005",
    name: "Flui Station — Vila Madalena",
    address: "R. Harmonia, 456 — Vila Madalena",
    lat: -23.5546,
    lng: -46.6896,
    powerKw: 50,
    connectors: ["Tipo 2", "GB/T"],
    status: "MANUTENCAO",
    hours: "07h — 22h",
    amenities: ["cafe", "banheiro"],
    rating: 4.0,
    reviewsCount: 47,
    fluiStars: 1,
    cover: cover("photo-1581092918056-0c4c3acd3789"),
    pricePerKwh: 1.59,
    sessionsLast30d: 88,
  },
  {
    id: "st-006",
    name: "Flui Hub — Aeroporto Congonhas",
    address: "Av. Washington Luís, s/n — Campo Belo",
    lat: -23.6273,
    lng: -46.6566,
    powerKw: 150,
    connectors: ["CCS2", "Tipo 2", "CHAdeMO"],
    status: "DISPONIVEL",
    hours: "24h",
    amenities: ["wifi", "cafe", "banheiro", "lounge"],
    rating: 4.7,
    reviewsCount: 189,
    fluiStars: 2,
    cover: cover("photo-1617886322168-72b886573c5f"),
    pricePerKwh: 1.85,
    sessionsLast30d: 410,
  },
];

export const AMENITY_LABELS: Record<string, string> = {
  wifi: "Wi-Fi",
  cafe: "Café",
  banheiro: "Banheiro",
  lounge: "Lounge",
  compras: "Compras",
  valet: "Valet",
};

export const REVIEWS: Review[] = [
  {
    id: "r1",
    stationId: "st-001",
    userName: "Marina A.",
    rating: 5,
    chargeQuality: 5,
    infrastructure: 5,
    comment: "Atendimento impecável e carga em 25 minutos. O lounge faz toda diferença.",
    date: "2026-04-22",
  },
  {
    id: "r2",
    stationId: "st-001",
    userName: "Rafael C.",
    rating: 4,
    chargeQuality: 5,
    infrastructure: 4,
    comment: "Potência entregue acima do anunciado. Café podia ter mais opções.",
    date: "2026-04-18",
  },
  {
    id: "r3",
    stationId: "st-004",
    userName: "Júlia P.",
    rating: 5,
    chargeQuality: 5,
    infrastructure: 5,
    comment: "Padrão Flui Premium. Valet e lounge tornam a experiência única.",
    date: "2026-05-02",
  },
  {
    id: "r4",
    stationId: "st-002",
    userName: "Diego L.",
    rating: 4,
    chargeQuality: 4,
    infrastructure: 5,
    comment: "Localização imbatível, mas costuma estar ocupado nos finais de semana.",
    date: "2026-04-30",
  },
  {
    id: "r5",
    stationId: "st-003",
    userName: "Beatriz M.",
    rating: 4,
    chargeQuality: 4,
    infrastructure: 3,
    comment: "Bom para parada rápida. Sinal de Wi-Fi precário.",
    date: "2026-04-12",
  },
  {
    id: "r6",
    stationId: "st-006",
    userName: "Paulo R.",
    rating: 5,
    chargeQuality: 5,
    infrastructure: 4,
    comment: "Salvou minha viagem antes do voo. Recarga rápida e confiável.",
    date: "2026-05-08",
  },
];

export const getStation = (id: string) => STATIONS.find((s) => s.id === id);
export const getReviewsByStation = (id: string) =>
  REVIEWS.filter((r) => r.stationId === id);
