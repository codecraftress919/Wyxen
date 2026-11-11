import type {
  NavigationType,
  Person,
  PublishWebsiteInput,
  Site,
  VisitHistoryPage,
  WebsiteSearchResult,
} from "../types";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api"
).replace(/\/$/, "");

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, init);
  } catch {
    throw new ApiError(
      "Could not connect to the backend. Check that it is running.",
      0,
    );
  }

  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMessage =
      typeof payload === "object" && payload !== null && "message" in payload
        ? payload.message
        : undefined;
    const message = Array.isArray(errorMessage)
      ? errorMessage.join(", ")
      : typeof errorMessage === "string"
        ? errorMessage
        : response.status === 404
          ? "Website not found."
          : "The request could not be completed.";
    throw new ApiError(message, response.status);
  }

  if (typeof payload !== "object" || payload === null || !("data" in payload)) {
    throw new ApiError(
      "The backend returned an unexpected response.",
      response.status,
    );
  }

  if ("nextCursor" in payload) {
    return payload as T;
  }

  return payload.data as T;
}

export function fetchPeople(): Promise<Person[]> {
  return request<Person[]>("/people");
}

export function fetchSite(address: string): Promise<Site> {
  return request<Site>(`/sites/${encodeURIComponent(address)}`);
}

export function publishWebsite(input: PublishWebsiteInput): Promise<Site> {
  return request<Site>("/sites", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export function createVisit(
  personId: string,
  address: string,
  navigationType: NavigationType,
): Promise<unknown> {
  return request("/visits", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ personId, address, navigationType }),
  });
}

export function fetchVisitHistory(
  personId: string,
  cursor?: string,
): Promise<VisitHistoryPage> {
  const query = new URLSearchParams({ personId, limit: "20" });
  if (cursor) query.set("cursor", cursor);
  return request<VisitHistoryPage>(`/visits?${query.toString()}`);
}

export function searchWebsites(
  query: string,
  limit = 20,
): Promise<WebsiteSearchResult[]> {
  const params = new URLSearchParams({ q: query, limit: String(limit) });
  return request<WebsiteSearchResult[]>(`/search?${params.toString()}`);
}
