import { ADMIN_TOKEN, DRIVER_TOKEN } from "./auth";
import type { NetworkReport } from "./database";
import type { ConnectorType, Review, Station } from "./mockData";

export { ADMIN_TOKEN, DRIVER_TOKEN };

export interface ApiList<T> {
  data: T[];
  meta?: Record<string, unknown>;
}

export interface StationDetailResponse {
  station: Station;
  reviews: Review[];
}

export interface DriverProfileResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: "DRIVER";
    phone?: string;
    vehicle?: {
      model: string;
      plate: string;
      connector: ConnectorType;
      batteryKwh: number;
    };
    favoriteStationIds: string[];
  };
  favorites: Station[];
  history: Array<{
    id: string;
    stationId: string;
    chargerId: string;
    startedAt: string;
    finishedAt: string;
    kwh: number;
    cost: number;
    status: "COMPLETED" | "INTERRUPTED";
  }>;
  totals: {
    sessions: number;
    kwh: number;
    cost: number;
  };
}

interface StationFilterRequest {
  query?: string;
  connectors?: ConnectorType[];
  amenities?: string[];
  minPower?: number;
  available?: boolean;
}

export function listStations(filters: StationFilterRequest = {}) {
  const params = new URLSearchParams();
  if (filters.query) params.set("q", filters.query);
  filters.connectors?.forEach((connector) => params.append("connector", connector));
  filters.amenities?.forEach((amenity) => params.append("amenity", amenity));
  if (filters.minPower) params.set("minPower", String(filters.minPower));
  if (filters.available) params.set("available", "true");

  const query = params.toString();
  return apiFetch<ApiList<Station>>(`/api/stations${query ? `?${query}` : ""}`);
}

export function getStationDetail(id: string) {
  return apiFetch<StationDetailResponse>(`/api/stations/${id}`);
}

export function createStation(input: Partial<Station>) {
  return apiFetch<Station>("/api/stations", {
    method: "POST",
    token: ADMIN_TOKEN,
    body: input,
  });
}

export function updateStation(id: string, input: Partial<Station>) {
  return apiFetch<Station>(`/api/stations/${id}`, {
    method: "PATCH",
    token: ADMIN_TOKEN,
    body: input,
  });
}

export function listReviews(stationId?: string) {
  return apiFetch<ApiList<Review>>(`/api/reviews${stationId ? `?stationId=${stationId}` : ""}`, {
    token: ADMIN_TOKEN,
  });
}

export function createReview(
  stationId: string,
  input: Pick<Review, "rating" | "chargeQuality" | "infrastructure" | "comment">,
) {
  return apiFetch<Review>(`/api/stations/${stationId}/reviews`, {
    method: "POST",
    token: DRIVER_TOKEN,
    body: input,
  });
}

export function getDriverProfile() {
  return apiFetch<DriverProfileResponse>("/api/me", { token: DRIVER_TOKEN });
}

export function getReports() {
  return apiFetch<NetworkReport>("/api/reports", { token: ADMIN_TOKEN });
}

export function login(email: string, password: string) {
  return apiFetch<{
    token: string;
    user: { id: string; name: string; email: string; role: "DRIVER" | "ADMIN" };
  }>("/api/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

async function apiFetch<T>(
  path: string,
  options: { method?: string; token?: string; body?: unknown } = {},
) {
  const response = await fetch(path, {
    method: options.method ?? "GET",
    headers: {
      ...(options.body ? { "content-type": "application/json" } : {}),
      ...(options.token ? { authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const payload = (await response.json()) as T | { error?: string };
  if (!response.ok) {
    throw new Error("error" in payload && payload.error ? payload.error : "Erro na API Flui");
  }

  return payload as T;
}
