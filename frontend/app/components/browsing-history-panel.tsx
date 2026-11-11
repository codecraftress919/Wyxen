"use client";

import type { VisitHistoryItem } from "../types";

interface BrowsingHistoryPanelProps {
  entries: VisitHistoryItem[];
  selectedPersonId: string;
  loading: boolean;
  loadingMore: boolean;
  error: string;
  hasMore: boolean;
  onSelect: (address: string) => void;
  onLoadMore: () => void;
}

function formatVisitedAt(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Unknown time"
    : date.toLocaleString();
}

export function BrowsingHistoryPanel({
  entries,
  selectedPersonId,
  loading,
  loadingMore,
  error,
  hasMore,
  onSelect,
  onLoadMore,
}: BrowsingHistoryPanelProps) {
  return (
    <aside className="browsing-history" aria-label="Browsing history">
      <div className="history-panel-heading">
        <h2>Browsing history</h2>
        {entries.length > 0 && (
          <span className="history-count">{entries.length}</span>
        )}
      </div>

      {error && (
        <p className="history-message history-error" role="alert">
          {error}
        </p>
      )}

      {!selectedPersonId ? (
        <p className="history-message">Select a person to see their history.</p>
      ) : loading && entries.length === 0 ? (
        <p className="history-message" role="status">
          Loading history...
        </p>
      ) : entries.length === 0 ? (
        <p className="history-message">No browsing history yet.</p>
      ) : (
        <ul className="history-list">
          {entries.map((entry) => (
            <li key={entry._id}>
              <button
                type="button"
                className="history-entry"
                onClick={() => onSelect(entry.address)}
              >
                <span className="history-address">{entry.address}</span>
                <span className="history-entry-meta">
                  <span>{formatVisitedAt(entry.visitedAt)}</span>
                  <span
                    className={
                      entry.status === "success"
                        ? "history-status"
                        : "history-status history-status-missing"
                    }
                  >
                    {entry.status === "success" ? "Opened" : "Not found"}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {hasMore && (
        <button
          type="button"
          className="history-load-more"
          disabled={loadingMore}
          onClick={onLoadMore}
        >
          {loadingMore ? "Loading..." : "Load more"}
        </button>
      )}
    </aside>
  );
}
