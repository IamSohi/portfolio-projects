
export interface Document {
  id: string;
  title: string;
  content: string;
  ownerId: string;
  collaborators: string[];
  lastModified: Date;
  version: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
}
