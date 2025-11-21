import type { Document, DocumentMeta, DocumentList } from '../types/document';
import { pouchdbService } from './pouchdbService';

export const documentService = {
  // Get all documents (metadata only)
  async getDocumentList(): Promise<DocumentMeta[]> {
    try {
      const allDocs = await pouchdbService.allDocs();
      const documents = allDocs
        .filter((doc: any) => doc.type === 'document')
        .map((doc: any) => ({
          _id: doc._id,
          type: doc.type,
          title: doc.title,
          updatedAt: new Date(doc.updatedAt),
          lineCount: doc.lines?.length || 0,
          createdAt: new Date(doc.createdAt)
        }));
      
      return documents;
    } catch (error) {
      console.error('Error loading document list:', error);
      return [];
    }
  },

  // Get full document by ID
  async loadDocument(id: string): Promise<Document | null> {
    try {
      const doc = await pouchdbService.get(id);
      if (doc.type !== 'document') return null;
      
      return {
        _id: doc._id,
        type: doc.type,
        title: doc.title,
        createdAt: new Date(doc.createdAt),
        updatedAt: new Date(doc.updatedAt),
        lineCount: doc.lines?.length || 0,
        lines: doc.lines || [],
        cursorPosition: doc.cursorPosition
      };
    } catch (error: any) {
      if (error.status === 404 || error.name === 'not_found') {
        return null;
      }
      console.error('Error loading document:', error);
      return null;
    }
  },

  // Save document (creates or updates)
  async saveDocument(doc: Document): Promise<void> {
    try {
      const pouchDoc = {
        _id: doc._id,
        type: doc.type,
        title: doc.title,
        createdAt: doc.createdAt.toISOString(),
        updatedAt: new Date().toISOString(),
        lines: doc.lines,
        cursorPosition: doc.cursorPosition
      };

      // Try to get existing document first to get _rev
      try {
        const existing = await pouchdbService.get(doc._id);
        (pouchDoc as any)._rev = existing._rev;
      } catch (error: any) {
        // Document doesn't exist yet (404 not_found is expected)
        if (error.status !== 404 && error.name !== 'not_found') {
          console.error('Error checking existing document:', error);
        }
      }

      await pouchdbService.upsert(pouchDoc);
    } catch (error) {
      console.error('Error saving document:', error);
      throw error;
    }
  },

  // Create new document
  async createNewDocument(): Promise<Document> {
    const now = new Date();
    const id = this.generateDocumentId(now);
    
    const doc: Document = {
      _id: `doc:${id}`,
      type: 'document',
      title: 'Untitled Document',
      createdAt: now,
      updatedAt: now,
      lineCount: 0,
      lines: []
    };
    
    await this.saveDocument(doc);
    return doc;
  },

  // Delete document
  async deleteDocument(id: string): Promise<void> {
    try {
      const doc = await pouchdbService.get(id);
      await pouchdbService.delete(id, doc._rev);
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  },

  // Helper to generate unique document IDs (without doc: prefix)
  generateDocumentId(date: Date = new Date()): string {
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
    const timeStr = date.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
    const random = Math.random().toString(36).substr(2, 6); // 6 chars
    return `${dateStr}-${timeStr}-${random}`;
  }
};

export default documentService;
