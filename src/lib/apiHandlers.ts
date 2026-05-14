import { ADMIN_TOKEN, DRIVER_TOKEN, getUserFromRequest, hasRole, loginWithPassword } from "./auth";
import {
  DATABASE_SCHEMA,
  createReview,
  createStation,
  getDriverProfile,
  getNetworkReport,
  getStation,
  getAmenitiesCatalog,
  listChargingHistory,
  listReviews,
  listStations,
  listUsers,
  makeChargersFromConnectors,
  updateStation,
  type ConnectorType,
  type StationInput,
} from "./database";
import type { StationStatus } from "./mockData";

const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
};

const CONNECTOR_VALUES = new Set<ConnectorType>(["Tipo 2", "CCS2", "CHAdeMO", "GB/T"]);
const STATUS_VALUES = new Set<StationStatus>(["DISPONIVEL", "OCUPADO", "MANUTENCAO"]);

export async function handleApiRequest(request: Request, splatPath = ""): Promise<Response> {
  if (request.method === "OPTIONS") {
    return json({ ok: true });
  }

  try {
    const url = new URL(request.url);
    const segments = normalizeSegments(splatPath || url.pathname.replace(/^\/api\/?/, ""));

    if (segments.length === 0) {
      return json({
        name: "Flui Charge Glow API",
        docs: "/api/docs",
        health: "/api/health",
      });
    }

    if (request.method === "GET" && segments[0] === "health") {
      return json({ ok: true, service: "charge-glow-guide", generatedAt: new Date().toISOString() });
    }

    if (segments[0] === "docs" && request.method === "GET") {
      return json(apiDocumentation());
    }

    if (segments[0] === "auth" && segments[1] === "login" && request.method === "POST") {
      const body = await parseJsonBody(request);
      const email = stringFrom(body.email);
      const password = stringFrom(body.password);
      const session = loginWithPassword(email, password);
      if (!session) return json({ error: "Credenciais invalidas." }, 401);
      return json(session);
    }

    if (segments[0] === "me") {
      const user = getUserFromRequest(request);
      if (!user) return json({ error: "Autenticacao obrigatoria." }, 401);

      if (request.method === "GET") {
        if (user.role === "DRIVER") {
          return json(getDriverProfile(user.id));
        }
        return json({ user });
      }
    }

    if (segments[0] === "users" && request.method === "GET") {
      if (!hasRole(request, ["ADMIN"])) return json({ error: "Acesso admin obrigatorio." }, 403);
      return json({ data: listUsers() });
    }

    if (segments[0] === "stations") {
      return handleStations(request, segments);
    }

    if (segments[0] === "reviews" && request.method === "GET") {
      if (!hasRole(request, ["ADMIN"])) return json({ error: "Acesso admin obrigatorio." }, 403);
      const stationId = url.searchParams.get("stationId") ?? undefined;
      return json({ data: listReviews(stationId) });
    }

    if (segments[0] === "history" && request.method === "GET") {
      const user = getUserFromRequest(request);
      if (!user) return json({ error: "Autenticacao obrigatoria." }, 401);
      const stationId = url.searchParams.get("stationId") ?? undefined;
      const userId = user.role === "ADMIN" ? url.searchParams.get("userId") ?? undefined : user.id;
      return json({ data: listChargingHistory({ userId, stationId }) });
    }

    if (segments[0] === "reports" && request.method === "GET") {
      if (!hasRole(request, ["ADMIN"])) return json({ error: "Acesso admin obrigatorio." }, 403);
      return json(getNetworkReport());
    }

    return json({ error: "Endpoint nao encontrado." }, 404);
  } catch (error) {
    return json(
      {
        error: "Erro ao processar a requisicao.",
        detail: error instanceof Error ? error.message : String(error),
      },
      500,
    );
  }
}

async function handleStations(request: Request, segments: string[]) {
  const url = new URL(request.url);
  const stationId = segments[1];

  if (!stationId && request.method === "GET") {
    const stations = listStations({
      query: url.searchParams.get("q") ?? undefined,
      connectors: connectorParams(url),
      minPower: numberParam(url.searchParams.get("minPower")),
      amenities: listParams(url, "amenity"),
      available: booleanParam(url.searchParams.get("available")),
    });

    return json({
      data: stations,
      meta: {
        count: stations.length,
        amenities: getAmenitiesCatalog(),
      },
    });
  }

  if (!stationId && request.method === "POST") {
    if (!hasRole(request, ["ADMIN"])) return json({ error: "Acesso admin obrigatorio." }, 403);
    const body = await parseJsonBody(request);
    const input = stationInputFromBody(body);
    const station = createStation(input);
    return json(station, 201);
  }

  if (stationId && segments.length === 2 && request.method === "GET") {
    const station = getStation(stationId);
    if (!station) return json({ error: "Ponto nao encontrado." }, 404);
    return json({
      station,
      reviews: listReviews(stationId),
      history: listChargingHistory({ stationId }),
    });
  }

  if (stationId && segments.length === 2 && request.method === "PATCH") {
    if (!hasRole(request, ["ADMIN"])) return json({ error: "Acesso admin obrigatorio." }, 403);
    const body = await parseJsonBody(request);
    const patch = stationPatchFromBody(body);
    const station = updateStation(stationId, patch);
    if (!station) return json({ error: "Ponto nao encontrado." }, 404);
    return json(station);
  }

  if (stationId && segments[2] === "reviews" && request.method === "GET") {
    return json({ data: listReviews(stationId) });
  }

  if (stationId && segments[2] === "reviews" && request.method === "POST") {
    const user = hasRole(request, ["DRIVER"]);
    if (!user) return json({ error: "Acesso de motorista obrigatorio." }, 403);
    const body = await parseJsonBody(request);
    const review = createReview(stationId, {
      userId: user.id,
      rating: boundedRating(body.rating),
      chargeQuality: boundedRating(body.chargeQuality),
      infrastructure: boundedRating(body.infrastructure),
      comment: stringFrom(body.comment),
    });
    if (!review) return json({ error: "Ponto nao encontrado." }, 404);
    return json(review, 201);
  }

  return json({ error: "Endpoint de ponto nao encontrado." }, 404);
}

function stationInputFromBody(body: Record<string, unknown>): StationInput {
  const connectors = connectorList(body.connectors);
  const idSeed = `draft-${Date.now()}`;
  const powerKw = positiveNumber(body.powerKw, 120);

  return {
    name: stringFrom(body.name) || "Novo ponto Flui",
    address: stringFrom(body.address) || "Endereco a confirmar",
    lat: positiveNumber(body.lat, -23.58),
    lng: positiveNumber(body.lng, -46.67),
    powerKw,
    connectors,
    chargers: Array.isArray(body.chargers)
      ? (body.chargers as StationInput["chargers"])
      : makeChargersFromConnectors(idSeed, connectors, powerKw),
    status: statusFrom(body.status),
    hours: stringFrom(body.hours) || "24h",
    amenities: stringList(body.amenities),
    pricePerKwh: positiveNumber(body.pricePerKwh, 1.89),
    operator: stringFrom(body.operator) || "Flui Energia",
    fluiStars: fluiStarsFrom(body.fluiStars),
    sessionsLast30d: positiveNumber(body.sessionsLast30d, 0),
  };
}

function stationPatchFromBody(body: Record<string, unknown>): Partial<StationInput> {
  const patch: Partial<StationInput> = {};
  if ("name" in body) patch.name = stringFrom(body.name);
  if ("address" in body) patch.address = stringFrom(body.address);
  if ("lat" in body) patch.lat = positiveNumber(body.lat, -23.58);
  if ("lng" in body) patch.lng = positiveNumber(body.lng, -46.67);
  if ("powerKw" in body) patch.powerKw = positiveNumber(body.powerKw, 120);
  if ("connectors" in body) patch.connectors = connectorList(body.connectors);
  if ("chargers" in body && Array.isArray(body.chargers)) {
    patch.chargers = body.chargers as StationInput["chargers"];
  }
  if ("status" in body) patch.status = statusFrom(body.status);
  if ("hours" in body) patch.hours = stringFrom(body.hours);
  if ("amenities" in body) patch.amenities = stringList(body.amenities);
  if ("pricePerKwh" in body) patch.pricePerKwh = positiveNumber(body.pricePerKwh, 1.89);
  if ("operator" in body) patch.operator = stringFrom(body.operator);
  if ("fluiStars" in body) patch.fluiStars = fluiStarsFrom(body.fluiStars);
  return patch;
}

async function parseJsonBody(request: Request): Promise<Record<string, unknown>> {
  try {
    const value = await request.json();
    return value && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...JSON_HEADERS,
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET,POST,PATCH,PUT,DELETE,OPTIONS",
      "access-control-allow-headers": "content-type,authorization",
    },
  });
}

function normalizeSegments(path: string) {
  return path
    .replace(/^\/+/, "")
    .split("/")
    .map((segment) => decodeURIComponent(segment))
    .filter(Boolean);
}

function connectorParams(url: URL) {
  const values = [...url.searchParams.getAll("connector"), ...listParamCsv(url, "connectors")];
  return values.filter((value): value is ConnectorType => CONNECTOR_VALUES.has(value as ConnectorType));
}

function listParams(url: URL, key: string) {
  return [...url.searchParams.getAll(key), ...listParamCsv(url, `${key}s`)].filter(Boolean);
}

function listParamCsv(url: URL, key: string) {
  return (url.searchParams.get(key) ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

function connectorList(value: unknown): ConnectorType[] {
  const values = Array.isArray(value) ? value : [value];
  const connectors = values.filter((item): item is ConnectorType =>
    CONNECTOR_VALUES.has(String(item) as ConnectorType),
  );
  return connectors.length ? connectors : ["CCS2"];
}

function stringList(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item)).filter(Boolean);
}

function stringFrom(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function numberParam(value: string | null) {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function positiveNumber(value: unknown, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function booleanParam(value: string | null) {
  if (value == null) return false;
  return value === "true" || value === "1";
}

function statusFrom(value: unknown): StationStatus {
  return STATUS_VALUES.has(String(value) as StationStatus) ? (String(value) as StationStatus) : "DISPONIVEL";
}

function fluiStarsFrom(value: unknown): 1 | 2 | 3 {
  const parsed = Number(value);
  return parsed === 2 || parsed === 3 ? parsed : 1;
}

function boundedRating(value: unknown) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 5;
  return Math.max(1, Math.min(5, Math.round(parsed)));
}

function apiDocumentation() {
  return {
    openapi: "3.0.0",
    info: {
      title: "Flui Charge Glow API",
      version: "1.0.0",
      description: "API REST simulada para app de motoristas e painel administrativo Flui.",
    },
    auth: {
      driver: {
        email: "motorista@flui.app",
        password: "flui123",
        bearerToken: DRIVER_TOKEN,
      },
      admin: {
        email: "admin@flui.com.br",
        password: "admin123",
        bearerToken: ADMIN_TOKEN,
      },
    },
    schema: DATABASE_SCHEMA,
    endpoints: [
      "GET /api/health",
      "POST /api/auth/login",
      "GET /api/me",
      "GET /api/stations?q=&connector=&minPower=&amenity=&available=",
      "POST /api/stations",
      "GET /api/stations/:id",
      "PATCH /api/stations/:id",
      "GET /api/stations/:id/reviews",
      "POST /api/stations/:id/reviews",
      "GET /api/reviews?stationId=",
      "GET /api/history?stationId=&userId=",
      "GET /api/reports",
      "GET /api/docs",
    ],
  };
}
