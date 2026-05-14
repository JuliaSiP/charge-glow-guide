export type ConnectorType = "Tipo 2" | "CCS2" | "CHAdeMO" | "GB/T";
export type StationStatus = "DISPONIVEL" | "OCUPADO" | "MANUTENCAO";

export interface Amenity {
  key: string;
  label: string;
}

export interface Charger {
  id: string;
  label: string;
  connector: ConnectorType;
  powerKw: number;
  count: number;
  available: number;
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
  chargers: Charger[];
  status: StationStatus;
  hours: string;
  amenities: string[];
  rating: number;
  reviewsCount: number;
  fluiStars: 1 | 2 | 3;
  cover: string;
  pricePerKwh: number;
  sessionsLast30d: number;
  operator: string;
  lastSync: string;
}

const EV_COVER =
  "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=900&q=70";

const cover = (_seed: string) => EV_COVER;

export const CONNECTOR_OPTIONS: ConnectorType[] = ["Tipo 2", "CCS2", "CHAdeMO", "GB/T"];

export const AMENITIES: Amenity[] = [
  { key: "wifi", label: "Wi-Fi" },
  { key: "cafe", label: "Cafe" },
  { key: "banheiro", label: "Banheiro" },
  { key: "lounge", label: "Lounge" },
  { key: "compras", label: "Compras" },
  { key: "valet", label: "Valet" },
  { key: "seguranca", label: "Seguranca 24h" },
  { key: "restaurante", label: "Restaurante" },
];

export const AMENITY_LABELS: Record<string, string> = Object.fromEntries(
  AMENITIES.map((amenity) => [amenity.key, amenity.label]),
);

export const STATIONS: Station[] = [
  {
    id: "st-001",
    name: "Flui Station - Av. Paulista",
    address: "Av. Paulista, 1578 - Bela Vista, Sao Paulo",
    lat: -23.5614,
    lng: -46.6558,
    powerKw: 150,
    connectors: ["CCS2", "Tipo 2"],
    chargers: [
      {
        id: "st-001-c1",
        label: "Ultra rapido A",
        connector: "CCS2",
        powerKw: 150,
        count: 2,
        available: 1,
      },
      {
        id: "st-001-c2",
        label: "AC conveniencia",
        connector: "Tipo 2",
        powerKw: 22,
        count: 2,
        available: 2,
      },
    ],
    status: "DISPONIVEL",
    hours: "24h",
    amenities: ["wifi", "cafe", "banheiro", "lounge", "seguranca"],
    rating: 4.8,
    reviewsCount: 214,
    fluiStars: 3,
    cover: cover("photo-1593941707882-a5bba14938c7"),
    pricePerKwh: 1.89,
    sessionsLast30d: 482,
    operator: "Flui Energia",
    lastSync: "2026-05-14T08:45:00-03:00",
  },
  {
    id: "st-002",
    name: "Flui Hub - Shopping Iguatemi",
    address: "Av. Brigadeiro Faria Lima, 2232 - Jardim Paulistano",
    lat: -23.5762,
    lng: -46.6896,
    powerKw: 120,
    connectors: ["CCS2", "Tipo 2", "CHAdeMO"],
    chargers: [
      {
        id: "st-002-c1",
        label: "DC shopping",
        connector: "CCS2",
        powerKw: 120,
        count: 2,
        available: 0,
      },
      {
        id: "st-002-c2",
        label: "Importados",
        connector: "CHAdeMO",
        powerKw: 80,
        count: 1,
        available: 1,
      },
      {
        id: "st-002-c3",
        label: "AC garagem",
        connector: "Tipo 2",
        powerKw: 22,
        count: 4,
        available: 2,
      },
    ],
    status: "OCUPADO",
    hours: "08h - 22h",
    amenities: ["wifi", "cafe", "banheiro", "compras", "seguranca"],
    rating: 4.6,
    reviewsCount: 168,
    fluiStars: 2,
    cover: cover("photo-1611288875785-f725a25f1c81"),
    pricePerKwh: 1.79,
    sessionsLast30d: 391,
    operator: "Flui Shopping",
    lastSync: "2026-05-14T08:38:00-03:00",
  },
  {
    id: "st-003",
    name: "Flui Express - Posto Ibirapuera",
    address: "Av. Republica do Libano, 1551 - Ibirapuera",
    lat: -23.5876,
    lng: -46.6573,
    powerKw: 60,
    connectors: ["Tipo 2"],
    chargers: [
      {
        id: "st-003-c1",
        label: "Rapido urbano",
        connector: "Tipo 2",
        powerKw: 60,
        count: 2,
        available: 2,
      },
    ],
    status: "DISPONIVEL",
    hours: "06h - 23h",
    amenities: ["banheiro", "cafe"],
    rating: 4.2,
    reviewsCount: 92,
    fluiStars: 1,
    cover: cover("photo-1633505650400-7ff7d7b2bf45"),
    pricePerKwh: 1.69,
    sessionsLast30d: 220,
    operator: "Flui Express",
    lastSync: "2026-05-14T08:30:00-03:00",
  },
  {
    id: "st-004",
    name: "Flui Premium - JK Iguatemi",
    address: "Av. Pres. Juscelino Kubitschek, 2041 - Vila Olimpia",
    lat: -23.5955,
    lng: -46.6857,
    powerKw: 180,
    connectors: ["CCS2", "Tipo 2"],
    chargers: [
      {
        id: "st-004-c1",
        label: "Ultra rapido premium",
        connector: "CCS2",
        powerKw: 180,
        count: 4,
        available: 3,
      },
      {
        id: "st-004-c2",
        label: "AC valet",
        connector: "Tipo 2",
        powerKw: 22,
        count: 4,
        available: 4,
      },
    ],
    status: "DISPONIVEL",
    hours: "24h",
    amenities: ["wifi", "cafe", "lounge", "valet", "banheiro", "restaurante"],
    rating: 4.9,
    reviewsCount: 305,
    fluiStars: 3,
    cover: cover("photo-1558981806-ec527fa84c39"),
    pricePerKwh: 1.99,
    sessionsLast30d: 540,
    operator: "Flui Premium",
    lastSync: "2026-05-14T08:42:00-03:00",
  },
  {
    id: "st-005",
    name: "Flui Station - Vila Madalena",
    address: "R. Harmonia, 456 - Vila Madalena",
    lat: -23.5546,
    lng: -46.6896,
    powerKw: 50,
    connectors: ["Tipo 2", "GB/T"],
    chargers: [
      {
        id: "st-005-c1",
        label: "AC bairro",
        connector: "Tipo 2",
        powerKw: 22,
        count: 2,
        available: 0,
      },
      {
        id: "st-005-c2",
        label: "Compatibilidade GB/T",
        connector: "GB/T",
        powerKw: 50,
        count: 1,
        available: 0,
      },
    ],
    status: "MANUTENCAO",
    hours: "07h - 22h",
    amenities: ["cafe", "banheiro"],
    rating: 4.0,
    reviewsCount: 47,
    fluiStars: 1,
    cover: cover("photo-1581092918056-0c4c3acd3789"),
    pricePerKwh: 1.59,
    sessionsLast30d: 88,
    operator: "Flui Energia",
    lastSync: "2026-05-14T07:55:00-03:00",
  },
  {
    id: "st-006",
    name: "Flui Hub - Aeroporto Congonhas",
    address: "Av. Washington Luis, s/n - Campo Belo",
    lat: -23.6273,
    lng: -46.6566,
    powerKw: 150,
    connectors: ["CCS2", "Tipo 2", "CHAdeMO"],
    chargers: [
      {
        id: "st-006-c1",
        label: "DC embarque",
        connector: "CCS2",
        powerKw: 150,
        count: 3,
        available: 2,
      },
      {
        id: "st-006-c2",
        label: "CHAdeMO viagem",
        connector: "CHAdeMO",
        powerKw: 80,
        count: 1,
        available: 1,
      },
      {
        id: "st-006-c3",
        label: "AC estacionamento",
        connector: "Tipo 2",
        powerKw: 22,
        count: 3,
        available: 2,
      },
    ],
    status: "DISPONIVEL",
    hours: "24h",
    amenities: ["wifi", "cafe", "banheiro", "lounge", "seguranca"],
    rating: 4.7,
    reviewsCount: 189,
    fluiStars: 2,
    cover: cover("photo-1617886322168-72b886573c5f"),
    pricePerKwh: 1.85,
    sessionsLast30d: 410,
    operator: "Flui Aeroportos",
    lastSync: "2026-05-14T08:47:00-03:00",
  },
];

export const REVIEWS: Review[] = [
  {
    id: "r1",
    stationId: "st-001",
    userName: "Marina A.",
    rating: 5,
    chargeQuality: 5,
    infrastructure: 5,
    comment: "Atendimento impecavel e carga em 25 minutos. O lounge faz toda diferenca.",
    date: "2026-04-22",
  },
  {
    id: "r2",
    stationId: "st-001",
    userName: "Rafael C.",
    rating: 4,
    chargeQuality: 5,
    infrastructure: 4,
    comment: "Potencia entregue acima do anunciado. Cafe podia ter mais opcoes.",
    date: "2026-04-18",
  },
  {
    id: "r3",
    stationId: "st-004",
    userName: "Julia P.",
    rating: 5,
    chargeQuality: 5,
    infrastructure: 5,
    comment: "Padrao Flui Premium. Valet e lounge tornam a experiencia unica.",
    date: "2026-05-02",
  },
  {
    id: "r4",
    stationId: "st-002",
    userName: "Diego L.",
    rating: 4,
    chargeQuality: 4,
    infrastructure: 5,
    comment: "Localizacao imbativel, mas costuma estar ocupado nos finais de semana.",
    date: "2026-04-30",
  },
  {
    id: "r5",
    stationId: "st-003",
    userName: "Beatriz M.",
    rating: 4,
    chargeQuality: 4,
    infrastructure: 3,
    comment: "Bom para parada rapida. Sinal de Wi-Fi precario.",
    date: "2026-04-12",
  },
  {
    id: "r6",
    stationId: "st-006",
    userName: "Paulo R.",
    rating: 5,
    chargeQuality: 5,
    infrastructure: 4,
    comment: "Salvou minha viagem antes do voo. Recarga rapida e confiavel.",
    date: "2026-05-08",
  },
  {
    id: "r7",
    stationId: "st-004",
    userName: "Livia T.",
    rating: 5,
    chargeQuality: 5,
    infrastructure: 5,
    comment: "Carregadores livres, equipe atenta e otima sinalizacao no estacionamento.",
    date: "2026-05-09",
  },
  {
    id: "r8",
    stationId: "st-002",
    userName: "Caio N.",
    rating: 4,
    chargeQuality: 4,
    infrastructure: 4,
    comment: "A integracao com o shopping ajuda muito, mas a fila cresce no almoco.",
    date: "2026-05-06",
  },
];

export const getStation = (id: string) => STATIONS.find((s) => s.id === id);
export const getReviewsByStation = (id: string) => REVIEWS.filter((r) => r.stationId === id);

export const googleMapsUrl = (station: Station) =>
  `https://www.google.com/maps/search/?api=1&query=${station.lat},${station.lng}`;

export const googleDirectionsUrl = (station: Station) =>
  `https://www.google.com/maps/dir/?api=1&destination=${station.lat},${station.lng}`;
