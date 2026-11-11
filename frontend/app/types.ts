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
