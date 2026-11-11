import type { Person, Site } from "../types";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api"
).replace(/\/$/, "");

interface ApiEnvelope<T> {
  data: T;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`);
  } catch {
    throw new ApiError(
      "Could not connect to the backend. Check that it is running.",
      0,
    );
  }

  const payload = (await response.json().catch(() => null)) as
    | ApiEnvelope<T>
    | { message?: string | string[] }
    | null;

  if (!response.ok) {
    const message =
      payload && "message" in payload
        ? Array.isArray(payload.message)
          ? payload.message.join(", ")
          : payload.message
        : response.status === 404
          ? "Website not found."
          : "The request could not be completed.";
    throw new ApiError(
      message ?? "The request could not be completed.",
      response.status,
    );
  }

  if (!payload || !("data" in payload)) {
    throw new ApiError(
      "The backend returned an unexpected response.",
      response.status,
    );
  }

  return payload.data;
}

export function fetchPeople(): Promise<Person[]> {
  return request<Person[]>("/people");
}

export function fetchSite(address: string): Promise<Site> {
  return request<Site>(`/sites/${encodeURIComponent(address)}`);
}
