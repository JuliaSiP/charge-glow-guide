import {
  AMENITIES,
  STATIONS as SEEDED_STATIONS,
  REVIEWS as SEEDED_REVIEWS,
  type Charger,
  type ConnectorType,
  type Review,
  type Station,
  type StationStatus,
} from "./mockData";

export type { Charger, ConnectorType, Review, Station, StationStatus } from "./mockData";

export type UserRole = "DRIVER" | "ADMIN";

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  vehicle?: {
    model: string;
    plate: string;
    connector: ConnectorType;
    batteryKwh: number;
  };
  favoriteStationIds: string[];
  createdAt: string;
}

export interface ChargingSession {
  id: string;
  userId: string;
  stationId: string;
  chargerId: string;
  startedAt: string;
  finishedAt: string;
  kwh: number;
  cost: number;
  status: "COMPLETED" | "INTERRUPTED";
}

export interface StationFilters {
  query?: string;
  connectors?: ConnectorType[];
  minPower?: number;
  amenities?: string[];
  available?: boolean;
}

export type StationInput = Pick<
  Station,
  | "name"
  | "address"
  | "lat"
  | "lng"
  | "powerKw"
  | "connectors"
  | "chargers"
  | "status"
  | "hours"
  | "amenities"
  | "pricePerKwh"
  | "operator"
  | "fluiStars"
> &
  Partial<Pick<Station, "cover" | "rating" | "reviewsCount" | "sessionsLast30d">>;

export interface NetworkReport {
  generatedAt: string;
  totals: {
    stations: number;
    operationalStations: number;
    chargers: number;
    availableChargers: number;
    sessionsLast30d: number;
    revenueLast30d: number;
    averageRating: number;
    reviews: number;
  };
  topStations: Array<{
    stationId: string;
    name: string;
    sessions: number;
    revenue: number;
  }>;
  availabilityByStation: Array<{
    stationId: string;
    name: string;
    status: StationStatus;
    chargers: number;
    available: number;
  }>;
  sessionsByDay: Array<{ dia: string; sessoes: number }>;
  reviewsByStation: Array<{
    stationId: string;
    name: string;
    average: number;
    count: number;
  }>;
}

export const DATABASE_SCHEMA = {
  users: ["id", "name", "email", "password", "role", "vehicle", "favoriteStationIds"],
  stations: [
    "id",
    "name",
    "address",
    "lat",
    "lng",
    "powerKw",
    "status",
    "hours",
    "amenities",
    "pricePerKwh",
    "operator",
  ],
  chargers: ["id", "stationId", "label", "connector", "powerKw", "count", "available"],
  reviews: ["id", "stationId", "userId", "rating", "chargeQuality", "infrastructure", "comment"],
  chargingHistory: ["id", "userId", "stationId", "chargerId", "startedAt", "finishedAt", "kwh", "cost"],
} as const;

const DEMO_USERS: User[] = [
  {
    id: "usr-driver-001",
    name: "Ana Oliveira",
    email: "motorista@flui.app",
    password: "flui123",
    role: "DRIVER",
    phone: "+55 11 98888-0101",
    vehicle: {
      model: "Volvo EX30",
      plate: "FLU1E23",
      connector: "CCS2",
      batteryKwh: 69,
    },
    favoriteStationIds: ["st-001", "st-004", "st-006"],
    createdAt: "2026-02-18T10:20:00-03:00",
  },
  {
    id: "usr-admin-001",
    name: "Equipe Flui Operacoes",
    email: "admin@flui.com.br",
    password: "admin123",
    role: "ADMIN",
    favoriteStationIds: [],
    createdAt: "2026-01-08T09:00:00-03:00",
  },
];

let stationTable: Station[] = SEEDED_STATIONS.map(cloneStation);
let reviewTable: Review[] = SEEDED_REVIEWS.map((review, index) => ({
  ...review,
  id: review.id || `rv-${index + 1}`,
}));

const chargingHistoryTable: ChargingSession[] = [
  {
    id: "hist-001",
    userId: "usr-driver-001",
    stationId: "st-001",
    chargerId: "st-001-c1",
    startedAt: "2026-05-10T18:10:00-03:00",
    finishedAt: "2026-05-10T18:42:00-03:00",
    kwh: 38.4,
    cost: 72.58,
    status: "COMPLETED",
  },
  {
    id: "hist-002",
    userId: "usr-driver-001",
    stationId: "st-004",
    chargerId: "st-004-c1",
    startedAt: "2026-05-06T12:05:00-03:00",
    finishedAt: "2026-05-06T12:31:00-03:00",
    kwh: 31.8,
    cost: 63.28,
    status: "COMPLETED",
  },
  {
    id: "hist-003",
    userId: "usr-driver-001",
    stationId: "st-006",
    chargerId: "st-006-c1",
    startedAt: "2026-04-28T06:22:00-03:00",
    finishedAt: "2026-04-28T06:54:00-03:00",
    kwh: 35.1,
    cost: 64.94,
    status: "COMPLETED",
  },
  {
    id: "hist-004",
    userId: "usr-driver-001",
    stationId: "st-002",
    chargerId: "st-002-c3",
    startedAt: "2026-04-19T16:40:00-03:00",
    finishedAt: "2026-04-19T17:22:00-03:00",
    kwh: 18.2,
    cost: 32.58,
    status: "INTERRUPTED",
  },
];

export function listUsers() {
  return DEMO_USERS.map(withoutPassword);
}

export function authenticateUser(email: string, password: string) {
  const user = DEMO_USERS.find(
    (item) => item.email.toLowerCase() === email.toLowerCase() && item.password === password,
  );

  return user ? withoutPassword(user) : undefined;
}

export function getUserById(id: string) {
  const user = DEMO_USERS.find((item) => item.id === id);
  return user ? withoutPassword(user) : undefined;
}

export function listStations(filters: StationFilters = {}) {
  const query = filters.query?.trim().toLowerCase();
  const connectorFilters = filters.connectors ?? [];
  const amenityFilters = filters.amenities ?? [];

  return stationTable.filter((station) => {
    const searchable =
      `${station.name} ${station.address} ${station.connectors.join(" ")}`.toLowerCase();

    if (query && !searchable.includes(query)) return false;
    if (
      connectorFilters.length &&
      !connectorFilters.some((connector) => station.connectors.includes(connector))
    )
      return false;
    if (
      amenityFilters.length &&
      !amenityFilters.every((amenity) => station.amenities.includes(amenity))
    )
      return false;
    if (filters.minPower && station.powerKw < filters.minPower) return false;
    if (filters.available && station.status !== "DISPONIVEL") return false;
    return true;
  });
}

export function getStation(id: string) {
  return stationTable.find((station) => station.id === id);
}

export function createStation(input: StationInput) {
  const station: Station = {
    ...input,
    id: nextStationId(),
    cover:
      input.cover ??
      "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=900&q=70",
    rating: input.rating ?? 4.5,
    reviewsCount: input.reviewsCount ?? 0,
    sessionsLast30d: input.sessionsLast30d ?? 0,
    lastSync: new Date().toISOString(),
  };

  stationTable = [station, ...stationTable];
  return station;
}

export function updateStation(id: string, patch: Partial<StationInput>) {
  let updated: Station | undefined;

  stationTable = stationTable.map((station) => {
    if (station.id !== id) return station;
    updated = {
      ...station,
      ...patch,
      id: station.id,
      cover: patch.cover ?? station.cover,
      lastSync: new Date().toISOString(),
    };
    return updated;
  });

  return updated;
}

export function listReviews(stationId?: string) {
  return reviewTable.filter((review) => (stationId ? review.stationId === stationId : true));
}

export function createReview(
  stationId: string,
  input: Pick<Review, "rating" | "chargeQuality" | "infrastructure" | "comment"> & {
    userId: string;
  },
) {
  const user = DEMO_USERS.find((item) => item.id === input.userId);
  const station = getStation(stationId);
  if (!user || !station) return undefined;

  const review: Review = {
    id: `rv-${Date.now()}`,
    stationId,
    userName: user.name,
    rating: input.rating,
    chargeQuality: input.chargeQuality,
    infrastructure: input.infrastructure,
    comment: input.comment.trim(),
    date: new Date().toISOString().slice(0, 10),
  };

  reviewTable = [review, ...reviewTable];
  const previousCount = station.reviewsCount;
  const nextCount = previousCount + 1;
  station.rating = Number(((station.rating * previousCount + review.rating) / nextCount).toFixed(2));
  station.reviewsCount = nextCount;
  station.lastSync = new Date().toISOString();
  return review;
}

export function listChargingHistory(filters: { userId?: string; stationId?: string } = {}) {
  return chargingHistoryTable.filter((session) => {
    if (filters.userId && session.userId !== filters.userId) return false;
    if (filters.stationId && session.stationId !== filters.stationId) return false;
    return true;
  });
}

export function getDriverProfile(userId: string) {
  const user = DEMO_USERS.find((item) => item.id === userId && item.role === "DRIVER");
  if (!user) return undefined;

  const history = listChargingHistory({ userId });
  const favorites = stationTable.filter((station) => user.favoriteStationIds.includes(station.id));

  return {
    user: withoutPassword(user),
    favorites,
    history,
    totals: {
      sessions: history.length,
      kwh: round(history.reduce((sum, session) => sum + session.kwh, 0)),
      cost: round(history.reduce((sum, session) => sum + session.cost, 0)),
    },
  };
}

export function getNetworkReport(): NetworkReport {
  const chargers = stationTable.flatMap((station) => station.chargers);
  const sessionsLast30d = stationTable.reduce((sum, station) => sum + station.sessionsLast30d, 0);
  const revenueLast30d = stationTable.reduce(
    (sum, station) => sum + station.sessionsLast30d * station.pricePerKwh * 28,
    0,
  );
  const averageRating =
    stationTable.reduce((sum, station) => sum + station.rating, 0) / stationTable.length;

  return {
    generatedAt: new Date().toISOString(),
    totals: {
      stations: stationTable.length,
      operationalStations: stationTable.filter((station) => station.status !== "MANUTENCAO").length,
      chargers: chargers.reduce((sum, charger) => sum + charger.count, 0),
      availableChargers: chargers.reduce((sum, charger) => sum + charger.available, 0),
      sessionsLast30d,
      revenueLast30d: round(revenueLast30d),
      averageRating: round(averageRating),
      reviews: reviewTable.length,
    },
    topStations: [...stationTable]
      .sort((a, b) => b.sessionsLast30d - a.sessionsLast30d)
      .slice(0, 5)
      .map((station) => ({
        stationId: station.id,
        name: station.name,
        sessions: station.sessionsLast30d,
        revenue: round(station.sessionsLast30d * station.pricePerKwh * 28),
      })),
    availabilityByStation: stationTable.map((station) => {
      const stationChargers = station.chargers.reduce((sum, charger) => sum + charger.count, 0);
      const available = station.chargers.reduce((sum, charger) => sum + charger.available, 0);

      return {
        stationId: station.id,
        name: station.name,
        status: station.status,
        chargers: stationChargers,
        available,
      };
    }),
    sessionsByDay: Array.from({ length: 14 }, (_, index) => ({
      dia: `D${index + 1}`,
      sessoes: 120 + Math.round(Math.sin(index / 2) * 35) + index * 6,
    })),
    reviewsByStation: stationTable.map((station) => {
      const stationReviews = listReviews(station.id);
      const average = stationReviews.length
        ? stationReviews.reduce((sum, review) => sum + review.rating, 0) / stationReviews.length
        : station.rating;

      return {
        stationId: station.id,
        name: station.name,
        average: round(average),
        count: stationReviews.length,
      };
    }),
  };
}

export function getAmenitiesCatalog() {
  return AMENITIES;
}

function nextStationId() {
  const max = stationTable.reduce((currentMax, row) => {
    const numeric = Number(row.id.replace(/\D/g, ""));
    return Number.isFinite(numeric) ? Math.max(currentMax, numeric) : currentMax;
  }, 0);

  return `st-${String(max + 1).padStart(3, "0")}`;
}

function cloneStation(station: Station): Station {
  return {
    ...station,
    connectors: [...station.connectors],
    chargers: station.chargers.map((charger) => ({ ...charger })),
    amenities: [...station.amenities],
  };
}

function withoutPassword(user: User) {
  const { password: _password, ...safeUser } = user;
  return safeUser;
}

function round(value: number) {
  return Number(value.toFixed(2));
}

export function makeChargersFromConnectors(
  stationId: string,
  connectors: ConnectorType[],
  powerKw: number,
): Charger[] {
  return connectors.map((connector, index) => ({
    id: `${stationId}-c${index + 1}`,
    label: index === 0 ? "Principal" : "Complementar",
    connector,
    powerKw: connector === "Tipo 2" ? Math.min(powerKw, 22) : powerKw,
    count: index === 0 ? 2 : 1,
    available: index === 0 ? 1 : 1,
  }));
}
