"use client";

import { FormEvent, useEffect, useState } from "react";
import { ApiError, fetchPeople, fetchSite } from "../lib/api";
import type { Person, Site } from "../types";
import { BrowserToolbar } from "./browser-toolbar";
import { WebsiteViewer } from "./website-viewer";

export type ViewState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "not-found"; address: string }
  | { status: "ready"; site: Site };

const ADDRESS_PATTERN =
  /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i;

export function Browser() {
  const [address, setAddress] = useState("");
  const [people, setPeople] = useState<Person[]>([]);
  const [selectedPersonId, setSelectedPersonId] = useState("");
  const [peopleError, setPeopleError] = useState("");
  const [view, setView] = useState<ViewState>({ status: "idle" });

  useEffect(() => {
    let active = true;

    fetchPeople()
      .then((availablePeople) => {
        if (active) setPeople(availablePeople);
      })
      .catch((error: unknown) => {
        if (active) {
          setPeopleError(
            error instanceof Error ? error.message : "Could not load people.",
          );
        }
      });

    return () => {
      active = false;
    };
  }, []);

  async function navigate(event?: FormEvent) {
    event?.preventDefault();
    const normalizedAddress = address
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .replace(/\/$/, "");

    if (!normalizedAddress || !ADDRESS_PATTERN.test(normalizedAddress)) {
      setView({
        status: "error",
        message: "Enter a valid address, for example tidepool.zz.",
      });
      return;
    }

    setAddress(normalizedAddress);
    setView({ status: "loading" });

    try {
      const site = await fetchSite(normalizedAddress);
      setView({ status: "ready", site });
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        setView({ status: "not-found", address: normalizedAddress });
      } else {
        setView({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "The website could not be loaded.",
        });
      }
    }
  }

  return (
    <main className="browser-shell">
      <BrowserToolbar
        address={address}
        people={people}
        peopleError={peopleError}
        selectedPersonId={selectedPersonId}
        onAddressChange={setAddress}
        onPersonChange={setSelectedPersonId}
        onNavigate={navigate}
      />
      <WebsiteViewer address={address} view={view} />
    </main>
  );
}
