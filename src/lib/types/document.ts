// Document metadata (lightweight, loaded often)
export interface DocumentMeta {
  _id: string;              // PouchDB ID with "doc:" prefix (e.g., "doc:2024-01-15-draft-1")
  type: 'document';         // PouchDB document type for querying
  title: string;            // Display name
  updatedAt: Date;          // For sorting
  lineCount: number;        // For UI display
  createdAt: Date;
}

// Full document (loaded when editing)
export interface Document extends DocumentMeta {
  lines: string[];          // The actual text content
  cursorPosition?: {        // Per-document cursor
    line: number;
    col: number;
    want_col: number;       // Preferred column when moving vertically
  };
}

// Document list for UI
export interface DocumentList {
  documents: DocumentMeta[];
  activeDocumentId?: string;
}
