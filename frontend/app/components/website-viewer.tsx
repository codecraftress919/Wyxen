"use client";

import type { NavigationEntry, ViewState } from "./browser";

interface WebsiteViewerProps {
  address: string;
  view: ViewState;
  entries: NavigationEntry[];
  currentIndex: number;
  visitError?: string;
}

export function WebsiteViewer({
  address,
  view,
  entries,
  currentIndex,
  visitError,
}: WebsiteViewerProps) {
  return (
    <section className="website-panel" aria-label="Website viewer">
      {visitError && view.status !== "loading" && (
        <p className="visit-error" role="alert">
          Website opened, but the visit could not be saved: {visitError}
        </p>
      )}

      {entries.map((entry, index) => {
        if (entry.view.status !== "ready") return null;

        const isCurrent =
          index === currentIndex &&
          (view.status === "ready" || view.status === "loading");
        return (
          <div
            key={entry.id}
            className={`site-document ${
              isCurrent ? "site-document-active" : "site-document-hidden"
            }`}
            aria-hidden={!isCurrent}
          >
            <div className="site-heading">
              <div>
                <span>{entry.view.site.address}</span>
                <h1>{entry.view.site.title}</h1>
              </div>
            </div>
            {entry.view.site.html.trim() ? (
              <iframe
                className="site-frame"
                title={entry.view.site.title}
                srcDoc={entry.view.site.html}
                sandbox=""
              />
            ) : (
              <div className="viewer-state">
                <div className="state-mark" aria-hidden="true">
                  ww
                </div>
                <h1>No website content</h1>
                <p>This website does not have any HTML content yet.</p>
              </div>
            )}
          </div>
        );
      })}

      {view.status === "idle" && (
        <div className="viewer-state">
          <div className="state-mark" aria-hidden="true">
            ww
          </div>
          <h1>Ready to browse</h1>
          <p>Enter an address above to open a website.</p>
        </div>
      )}

      {view.status === "loading" && (
        <div className="viewer-loading-overlay viewer-state" role="status">
          <div className="loading-spinner" aria-hidden="true" />
          <h1>Opening {address || "website"}</h1>
          <p>Loading content...</p>
        </div>
      )}

      {view.status === "not-found" && (
        <div className="viewer-state">
          <div className="status-code">404</div>
          <h1>Website not found</h1>
          <p>No website is available at {view.address}.</p>
        </div>
      )}

      {view.status === "error" && (
        <div className="viewer-state error-state" role="alert">
          <div className="status-code">!</div>
          <h1>Unable to load website</h1>
          <p>{view.message}</p>
        </div>
      )}
    </section>
  );
}
