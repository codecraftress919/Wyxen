export interface Person {
  _id: string;
  name: string;
  createdAt?: string;
}

export interface SiteAuthor {
  _id: string;
  name: string;
}

export interface Site {
  _id: string;
  address: string;
  title: string;
  html: string;
  contentText?: string;
  authorId: SiteAuthor | string;
  createdAt?: string;
  updatedAt?: string;
}

export type NavigationType = "typed" | "link" | "search" | "history";

export interface VisitHistoryItem {
  _id: string;
  address: string;
  status: "success" | "not_found";
  navigationType: NavigationType;
  visitedAt: string;
  site: Pick<Site, "_id" | "address" | "title"> | null;
}

export interface VisitHistoryPage {
  data: VisitHistoryItem[];
  nextCursor: string | null;
}

export interface WebsiteSearchResult {
  address: string;
  title: string;
  excerpt: string;
  author?: SiteAuthor;
}

export interface WebsiteSearchState {
  query: string;
  results: WebsiteSearchResult[];
  error: string;
  hasSearched: boolean;
}

export interface PublishWebsiteInput {
  address: string;
  title: string;
  html: string;
  authorId: string;
}
