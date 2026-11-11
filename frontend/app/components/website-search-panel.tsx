"use client";

import type { FormEvent } from "react";
import type { WebsiteSearchResult, WebsiteSearchState } from "../types";

interface WebsiteSearchPanelProps {
  query: string;
  searchState: WebsiteSearchState;
  loading: boolean;
  onQueryChange: (query: string) => void;
  onSearch: (event: FormEvent<HTMLFormElement>) => void;
  onSelect: (result: WebsiteSearchResult) => void;
}

export function WebsiteSearchPanel({
  query,
  searchState,
  loading,
  onQueryChange,
  onSearch,
  onSelect,
}: WebsiteSearchPanelProps) {
  return (
    <aside className="website-search-panel" aria-label="Website search">
      <form className="website-search-form" onSubmit={onSearch}>
        <label htmlFor="website-search-input">Search the small web</label>
        <div className="website-search-field">
          <input
            id="website-search-input"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search websites..."
            maxLength={200}
            autoComplete="off"
          />
          <button type="submit" disabled={loading}>
            Search
          </button>
        </div>
      </form>

      {loading && (
        <p className="search-message" role="status">
          Searching websites...
        </p>
      )}
      {!loading && searchState.error && (
        <p className="search-message search-error" role="alert">
          {searchState.error}
        </p>
      )}
      {!loading &&
        !searchState.error &&
        searchState.hasSearched &&
        searchState.results.length === 0 && (
          <p className="search-message">
            No websites found for “{searchState.query}”.
          </p>
        )}

      {searchState.results.length > 0 && (
        <ul className="search-results">
          {searchState.results.map((result) => (
            <li key={result.address}>
              <button
                type="button"
                className="search-result"
                onClick={() => onSelect(result)}
              >
                <span className="search-result-title">{result.title}</span>
                <span className="search-result-address">{result.address}</span>
                {result.author?.name && (
                  <span className="search-result-author">
                    By {result.author.name}
                  </span>
                )}
                <span className="search-result-excerpt">{result.excerpt}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
