"use client";

import { FormEvent, ReactNode } from "react";
import type { Person } from "../types";

interface BrowserToolbarProps {
  address: string;
  people: Person[];
  peopleError: string;
  selectedPersonId: string;
  canGoBack: boolean;
  canGoForward: boolean;
  historyOpen: boolean;
  onAddressChange: (address: string) => void;
  onPersonChange: (personId: string) => void;
  onNavigate: (event?: FormEvent<HTMLFormElement>) => void;
  onBack: () => void;
  onForward: () => void;
  onToggleHistory: () => void;
}

function IconButton({
  label,
  children,
  disabled = false,
  onClick,
}: {
  label: string;
  children: ReactNode;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      className="icon-button"
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function BrowserToolbar({
  address,
  people,
  peopleError,
  selectedPersonId,
  canGoBack,
  canGoForward,
  historyOpen,
  onAddressChange,
  onPersonChange,
  onNavigate,
  onBack,
  onForward,
  onToggleHistory,
}: BrowserToolbarProps) {
  return (
    <header className="browser-toolbar" aria-label="Browser controls">
      <div className="navigation-row">
        <div className="history-controls">
          <IconButton label="Back" disabled={!canGoBack} onClick={onBack}>
            <span aria-hidden="true">&#8592;</span>
          </IconButton>
          <IconButton
            label="Forward"
            disabled={!canGoForward}
            onClick={onForward}
          >
            <span aria-hidden="true">&#8594;</span>
          </IconButton>
        </div>

        <form
          className="address-form"
          onSubmit={(event) => onNavigate(event)}
        >
          <label className="sr-only" htmlFor="site-address">
            Website address
          </label>
          <div className="address-field">
            <span className="address-prefix" aria-hidden="true">
              www
            </span>
            <input
              id="site-address"
              value={address}
              onChange={(event) => onAddressChange(event.target.value)}
              placeholder="tidepool.zz"
              autoComplete="off"
              spellCheck={false}
            />
          </div>
          <button type="submit" className="go-button">
            Go
          </button>
        </form>
        <button
          type="button"
          className="history-toggle"
          aria-expanded={historyOpen}
          onClick={onToggleHistory}
        >
          History
        </button>
      </div>

      <div className="person-row">
        <label htmlFor="person">Viewing as</label>
        <div className="person-select-wrap">
          <select
            id="person"
            value={selectedPersonId}
            onChange={(event) => onPersonChange(event.target.value)}
            disabled={people.length === 0}
          >
            <option value="">
              {people.length
                ? "Select a person"
                : peopleError
                  ? "People unavailable"
                  : "Loading or no people"}
            </option>
            {people.map((person) => (
              <option key={person._id} value={person._id}>
                {person.name}
              </option>
            ))}
          </select>
        </div>
        {peopleError && <span className="people-error">{peopleError}</span>}
      </div>
    </header>
  );
}
