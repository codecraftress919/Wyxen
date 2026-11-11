"use client";

import { FormEvent, useState } from "react";
import { ApiError, publishWebsite } from "../lib/api";
import type { Site } from "../types";

interface PublishWebsiteModalProps {
  authorId: string;
  authorName: string;
  onClose: () => void;
  onOpenWebsite: (address: string) => void;
}

const ADDRESS_PATTERN =
  /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i;

function getPublishError(error: unknown): string {
  if (error instanceof ApiError && error.status === 409) {
    return "That address is already in use. Choose a different website address.";
  }
  return error instanceof Error ? error.message : "Could not publish website.";
}

export function PublishWebsiteModal({
  authorId,
  authorName,
  onClose,
  onOpenWebsite,
}: PublishWebsiteModalProps) {
  const [address, setAddress] = useState("");
  const [title, setTitle] = useState("");
  const [html, setHtml] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");
  const [publishedSite, setPublishedSite] = useState<Site | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedAddress = address.trim().toLowerCase();
    const normalizedTitle = title.trim();
    const normalizedHtml = html.trim();

    if (!normalizedAddress || !normalizedTitle || !normalizedHtml) {
      setError("Address, title, and HTML content are all required.");
      return;
    }

    if (!ADDRESS_PATTERN.test(normalizedAddress)) {
      setError("Enter a valid address, for example mysite.zz.");
      return;
    }

    if (!authorId) {
      setError("Select a person before publishing a website.");
      return;
    }

    setPublishing(true);
    setError("");

    try {
      const site = await publishWebsite({
        address: normalizedAddress,
        title: normalizedTitle,
        html,
        authorId,
      });
      setAddress(site.address);
      setPublishedSite(site);
    } catch (requestError) {
      setError(getPublishError(requestError));
    } finally {
      setPublishing(false);
    }
  }

  return (
    <div
      className="publish-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !publishing) onClose();
      }}
    >
      <section
        className="publish-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="publish-title"
      >
        <div className="publish-modal-heading">
          <div>
            <p className="publish-eyebrow">SHARE WITH THE SMALL WEB</p>
            <h2 id="publish-title">Publish a website</h2>
          </div>
          <button
            type="button"
            className="publish-close"
            aria-label="Close publishing form"
            disabled={publishing}
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {publishedSite ? (
          <div className="publish-success" role="status">
            <p>
              <strong>{publishedSite.title}</strong> is now available at{" "}
              <strong>{publishedSite.address}</strong>.
            </p>
            <div className="publish-actions">
              <button
                type="button"
                className="publish-submit"
                onClick={() => onOpenWebsite(publishedSite.address)}
              >
                Open website
              </button>
              <button
                type="button"
                className="publish-secondary"
                onClick={onClose}
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form className="publish-form" onSubmit={(event) => void submit(event)}>
            <p className="publish-author">
              Publishing as <strong>{authorName}</strong>
            </p>
            <label htmlFor="publish-address">Website address</label>
            <input
              id="publish-address"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              placeholder="mysite.zz"
              autoComplete="off"
              maxLength={253}
              required
              disabled={publishing}
            />
            <label htmlFor="publish-site-title">Website title</label>
            <input
              id="publish-site-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="A title for your website"
              maxLength={300}
              required
              disabled={publishing}
            />
            <label htmlFor="publish-site-html">Custom HTML content</label>
            <textarea
              id="publish-site-html"
              value={html}
              onChange={(event) => setHtml(event.target.value)}
              placeholder="<main><h1>Hello, small web!</h1><p>Write your page here.</p></main>"
              rows={10}
              required
              disabled={publishing}
            />
            <p className="publish-security-note">
              HTML is shown in a restricted preview. Scripts and same-origin
              access are disabled.
            </p>
            {error && (
              <p className="publish-error" role="alert">
                {error}
              </p>
            )}
            <div className="publish-actions">
              <button
                type="button"
                className="publish-secondary"
                disabled={publishing}
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="publish-submit"
                disabled={publishing || !authorId}
              >
                {publishing ? "Publishing..." : "Publish Website"}
              </button>
            </div>
            {!authorId && (
              <p className="publish-error" role="status">
                Select a person in the browser toolbar to publish.
              </p>
            )}
          </form>
        )}
      </section>
    </div>
  );
}
