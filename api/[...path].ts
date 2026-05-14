import { handleApiRequest } from "../src/lib/apiHandlers";

type HeaderValue = string | string[] | undefined;

interface VercelRequest {
  method?: string;
  url?: string;
  headers: Record<string, HeaderValue>;
  query: Record<string, string | string[] | undefined>;
  body?: unknown;
}

interface VercelResponse {
  status: (code: number) => VercelResponse;
  setHeader: (name: string, value: string) => void;
  send: (body: string) => void;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const host = firstHeader(req.headers.host) ?? "localhost";
  const method = req.method ?? "GET";
  const request = new Request(`https://${host}${req.url ?? "/api"}`, {
    method,
    headers: toHeaders(req.headers),
    body: requestBody(method, req.body),
  });
  const path = Array.isArray(req.query.path)
    ? req.query.path.join("/")
    : (req.query.path ?? "").toString();

  const response = await handleApiRequest(request, path);
  response.headers.forEach((value, key) => res.setHeader(key, value));
  res.status(response.status).send(await response.text());
}

function toHeaders(headers: Record<string, HeaderValue>) {
  const output = new Headers();

  Object.entries(headers).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      output.set(key, value.join(", "));
      return;
    }

    if (value) output.set(key, value);
  });

  return output;
}

function requestBody(method: string, body: unknown) {
  if (method === "GET" || method === "HEAD" || body == null) return undefined;
  if (typeof body === "string") return body;
  if (body instanceof Uint8Array) return body;
  return JSON.stringify(body);
}

function firstHeader(value: HeaderValue) {
  return Array.isArray(value) ? value[0] : value;
}
