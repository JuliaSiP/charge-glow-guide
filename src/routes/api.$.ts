import { createFileRoute } from "@tanstack/react-router";
import { handleApiRequest } from "@/lib/apiHandlers";

export const Route = createFileRoute("/api/$")({
  server: {
    handlers: {
      GET: ({ request, params }) => handleApiRequest(request, params._splat),
      POST: ({ request, params }) => handleApiRequest(request, params._splat),
      PATCH: ({ request, params }) => handleApiRequest(request, params._splat),
      PUT: ({ request, params }) => handleApiRequest(request, params._splat),
      DELETE: ({ request, params }) => handleApiRequest(request, params._splat),
      OPTIONS: ({ request, params }) => handleApiRequest(request, params._splat),
    },
  },
});
