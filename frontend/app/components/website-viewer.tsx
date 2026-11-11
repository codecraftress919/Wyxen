"use client";

import type { ViewState } from "./browser";

export function WebsiteViewer({
  address,
  view,
}: {
  address: string;
  view: ViewState;
}) {
  return (
    <section className="website-panel" aria-label="Website viewer">
      {view.status === "idle" && (
        <div className="viewer-state">
          <div className="state-mark" aria-hidden="true">ww</div>
          <h1>Ready to browse</h1>
          <p>Enter an address above to open a website.</p>
        </div>
      )}

      {view.status === "loading" && (
        <div className="viewer-state" role="status">
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

      {view.status === "ready" && (
        <>
          <div className="site-heading">
            <div>
              <span>{view.site.address}</span>
              <h1>{view.site.title}</h1>
            </div>
          </div>
          {view.site.html.trim() ? (
            <iframe
              className="site-frame"
              title={view.site.title}
              srcDoc={view.site.html}
              sandbox=""
            />
          ) : (
            <div className="viewer-state">
              <div className="state-mark" aria-hidden="true">ww</div>
              <h1>No website content</h1>
              <p>This website does not have any HTML content yet.</p>
            </div>
          )}
        </>
      )}
    </section>
  );
}
