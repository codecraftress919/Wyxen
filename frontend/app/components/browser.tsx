"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import {
  ApiError,
  createVisit,
  fetchPeople,
  fetchSite,
  fetchVisitHistory,
  searchWebsites,
} from "../lib/api";
import type {
  NavigationType,
  Person,
  Site,
  VisitHistoryItem,
  WebsiteSearchState,
} from "../types";
import { BrowserToolbar } from "./browser-toolbar";
import { BrowsingHistoryPanel } from "./browsing-history-panel";
import { WebsiteSearchPanel } from "./website-search-panel";
import { WebsiteViewer } from "./website-viewer";

export type ViewState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "not-found"; address: string }
  | { status: "ready"; site: Site };

type CompletedViewState = Exclude<
  ViewState,
  { status: "idle" | "loading" }
>;

export interface NavigationEntry {
  id: number;
  address: string;
  view: CompletedViewState;
  visitError?: string;
  searchSnapshot?: WebsiteSearchState;
}

const ADDRESS_PATTERN =
  /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i;

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

function getSiteView(site: Site): CompletedViewState {
  return { status: "ready", site };
}

export function Browser() {
  const [address, setAddress] = useState("");
  const [people, setPeople] = useState<Person[]>([]);
  const [selectedPersonId, setSelectedPersonId] = useState("");
  const [peopleError, setPeopleError] = useState("");
  const [entries, setEntries] = useState<NavigationEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isNavigating, setIsNavigating] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [historyOpen, setHistoryOpen] = useState(true);
  const [browsingHistory, setBrowsingHistory] = useState<VisitHistoryItem[]>([]);
  const [historyCursor, setHistoryCursor] = useState<string | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyLoadingMore, setHistoryLoadingMore] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const [historyRefreshVersion, setHistoryRefreshVersion] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [searchState, setSearchState] = useState<WebsiteSearchState>({
    query: "",
    results: [],
    error: "",
    hasSearched: false,
  });
  const [searchLoading, setSearchLoading] = useState(false);
  const navigationRequestId = useRef(0);
  const historyRequestId = useRef(0);
  const searchRequestId = useRef(0);
  const nextEntryId = useRef(0);
  const selectedPersonRef = useRef("");

  useEffect(() => {
    let active = true;

    fetchPeople()
      .then((availablePeople) => {
        if (active) setPeople(availablePeople);
      })
      .catch((error: unknown) => {
        if (active) {
          setPeopleError(getErrorMessage(error, "Could not load people."));
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const requestId = ++historyRequestId.current;
    if (!selectedPersonId) return;

    fetchVisitHistory(selectedPersonId)
      .then((page) => {
        if (requestId === historyRequestId.current) {
          setBrowsingHistory(page.data);
          setHistoryCursor(page.nextCursor);
        }
      })
      .catch((error: unknown) => {
        if (requestId === historyRequestId.current) {
          setHistoryError(
            getErrorMessage(error, "Could not load browsing history."),
          );
        }
      })
      .finally(() => {
        if (requestId === historyRequestId.current) {
          setHistoryLoading(false);
        }
      });

    return () => {
      if (requestId === historyRequestId.current) {
        historyRequestId.current += 1;
      }
    };
  }, [selectedPersonId, historyRefreshVersion]);

  async function navigate(
    event?: FormEvent<HTMLFormElement>,
    addressToVisit = address,
    navigationType: NavigationType = "typed",
    searchSnapshot = searchState,
  ) {
    event?.preventDefault();
    const normalizedAddress = addressToVisit
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .replace(/\/$/, "");

    if (!normalizedAddress || !ADDRESS_PATTERN.test(normalizedAddress)) {
      navigationRequestId.current += 1;
      setIsNavigating(false);
      setValidationError(
        "Enter a valid address, for example tidepool.zz.",
      );
      return;
    }

    const personId = selectedPersonId;
    if (!personId) {
      navigationRequestId.current += 1;
      setIsNavigating(false);
      setValidationError("Select a person before opening a website.");
      return;
    }

    const requestId = ++navigationRequestId.current;
    setValidationError("");
    setAddress(normalizedAddress);
    setIsNavigating(true);

    const siteRequest: Promise<CompletedViewState> = fetchSite(normalizedAddress)
      .then((site) => getSiteView(site))
      .catch((error: unknown) => {
        if (error instanceof ApiError && error.status === 404) {
          return { status: "not-found", address: normalizedAddress };
        }
        return {
          status: "error",
          message: getErrorMessage(error, "The website could not be loaded."),
        };
      });

    const visitRequest = createVisit(
      personId,
      normalizedAddress,
      navigationType,
    )
      .then(() => "")
      .catch((error: unknown) =>
        getErrorMessage(error, "Could not save this visit."),
      )
      .then((visitError) => {
        if (!visitError && selectedPersonRef.current === personId) {
          setHistoryError("");
          setHistoryLoading(true);
          setHistoryLoadingMore(false);
          setHistoryRefreshVersion((version) => version + 1);
        }
        return visitError;
      });

    const [view, visitError] = await Promise.all([siteRequest, visitRequest]);
    if (requestId !== navigationRequestId.current) return;

    const entry: NavigationEntry = {
      id: ++nextEntryId.current,
      address: normalizedAddress,
      view,
      searchSnapshot,
      ...(visitError ? { visitError } : {}),
    };
    const nextEntries = [
      ...entries.slice(0, currentIndex + 1),
      entry,
    ];
    setEntries(nextEntries);
    setCurrentIndex(nextEntries.length - 1);
    setIsNavigating(false);
  }

  function selectPerson(personId: string) {
    navigationRequestId.current += 1;
    selectedPersonRef.current = personId;
    setSelectedPersonId(personId);
    setEntries([]);
    setCurrentIndex(-1);
    setAddress("");
    setIsNavigating(false);
    setValidationError("");
    setBrowsingHistory([]);
    setHistoryCursor(null);
    setHistoryError("");
    setHistoryLoadingMore(false);
    setHistoryLoading(Boolean(personId));
  }

  async function search(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    const query = searchInput.trim();
    const requestId = ++searchRequestId.current;
    if (!query) {
      setSearchState({
        query: "",
        results: [],
        error: "Enter keywords to search websites.",
        hasSearched: true,
      });
      setSearchLoading(false);
      return;
    }

    setSearchInput(query);
    setSearchState({ query, results: [], error: "", hasSearched: true });
    setSearchLoading(true);
    const originEntryId = entries[currentIndex]?.id;

    try {
      const results = await searchWebsites(query);
      if (requestId !== searchRequestId.current) return;
      const nextState: WebsiteSearchState = {
        query,
        results,
        error: "",
        hasSearched: true,
      };
      setSearchState(nextState);
      if (originEntryId !== undefined) {
        setEntries((current) =>
          current.map((entry) =>
            entry.id === originEntryId
              ? { ...entry, searchSnapshot: nextState }
              : entry,
          ),
        );
      }
    } catch (error) {
      if (requestId !== searchRequestId.current) return;
      const nextState: WebsiteSearchState = {
        query,
        results: [],
        error: getErrorMessage(error, "Could not search websites."),
        hasSearched: true,
      };
      setSearchState(nextState);
      if (originEntryId !== undefined) {
        setEntries((current) =>
          current.map((entry) =>
            entry.id === originEntryId
              ? { ...entry, searchSnapshot: nextState }
              : entry,
          ),
        );
      }
    } finally {
      if (requestId === searchRequestId.current) setSearchLoading(false);
    }
  }

  function restoreSearchSnapshot(index: number) {
    searchRequestId.current += 1;
    setSearchLoading(false);
    const snapshot = entries[index]?.searchSnapshot ?? {
      query: "",
      results: [],
      error: "",
      hasSearched: false,
    };
    setSearchState(snapshot);
    setSearchInput(snapshot.query);
  }

  function goBack() {
    if (currentIndex <= 0) return;
    navigationRequestId.current += 1;
    const nextIndex = currentIndex - 1;
    setCurrentIndex(nextIndex);
    setAddress(entries[nextIndex].address);
    setIsNavigating(false);
    setValidationError("");
    restoreSearchSnapshot(nextIndex);
  }

  function goForward() {
    if (currentIndex >= entries.length - 1) return;
    navigationRequestId.current += 1;
    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);
    setAddress(entries[nextIndex].address);
    setIsNavigating(false);
    setValidationError("");
    restoreSearchSnapshot(nextIndex);
  }

  async function loadMoreHistory() {
    if (!selectedPersonId || !historyCursor || historyLoadingMore) return;

    const personId = selectedPersonId;
    const cursor = historyCursor;
    const requestId = ++historyRequestId.current;
    setHistoryLoadingMore(true);
    setHistoryError("");

    try {
      const page = await fetchVisitHistory(personId, cursor);
      if (
        requestId === historyRequestId.current &&
        selectedPersonRef.current === personId
      ) {
        setBrowsingHistory((current) => [...current, ...page.data]);
        setHistoryCursor(page.nextCursor);
      }
    } catch (error) {
      if (requestId === historyRequestId.current) {
        setHistoryError(
          getErrorMessage(error, "Could not load more browsing history."),
        );
      }
    } finally {
      if (requestId === historyRequestId.current) {
        setHistoryLoadingMore(false);
      }
    }
  }

  const currentEntry = entries[currentIndex];
  const view: ViewState = validationError
    ? { status: "error", message: validationError }
    : isNavigating
      ? { status: "loading" }
      : currentEntry?.view ?? { status: "idle" };

  return (
    <main className="browser-shell">
      <BrowserToolbar
        address={address}
        people={people}
        peopleError={peopleError}
        selectedPersonId={selectedPersonId}
        canGoBack={currentIndex > 0}
        canGoForward={currentIndex < entries.length - 1}
        historyOpen={historyOpen}
        onAddressChange={(value) => {
          setAddress(value);
          setValidationError("");
        }}
        onPersonChange={selectPerson}
        onNavigate={(event) => {
          void navigate(event);
        }}
        onBack={goBack}
        onForward={goForward}
        onToggleHistory={() => setHistoryOpen((open) => !open)}
      />
      <div className="browser-content">
        <WebsiteViewer
          address={address}
          view={view}
          entries={entries}
          currentIndex={currentIndex}
          visitError={validationError ? undefined : currentEntry?.visitError}
        />
        <WebsiteSearchPanel
          query={searchInput}
          searchState={searchState}
          loading={searchLoading}
          onQueryChange={setSearchInput}
          onSearch={(event) => {
            void search(event);
          }}
          onSelect={(result) => {
            void navigate(
              undefined,
              result.address,
              "search",
              searchState,
            );
          }}
        />
        {historyOpen && (
          <BrowsingHistoryPanel
            entries={browsingHistory}
            selectedPersonId={selectedPersonId}
            loading={historyLoading}
            loadingMore={historyLoadingMore}
            error={historyError}
            hasMore={Boolean(historyCursor)}
            onSelect={(historyEntry) => {
              void navigate(undefined, historyEntry, "history");
            }}
            onLoadMore={() => {
              void loadMoreHistory();
            }}
          />
        )}
      </div>
    </main>
  );
}
