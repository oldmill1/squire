// Get the database instance from the global window object
function getDB() {
	if (typeof window !== 'undefined' && (window as any).pouchDBInstance) {
		return (window as any).pouchDBInstance;
	}
	throw new Error('PouchDB not initialized. Make sure PouchDBInitializer component has mounted.');
}

// Basic database operations
export const pouchdbService = {
	// Get the database instance
	async getDB() {
		return getDB();
	},

	// Create or update a document
	async upsert(doc: any) {
		const db = getDB();
		try {
			const response = await db.put(doc);
			return response;
		} catch (error) {
			console.error('Error upserting document:', error);
			throw error;
		}
	},

	// Get a document by ID
	async get(id: string) {
		const db = getDB();
		try {
			const doc = await db.get(id);
			return doc;
		} catch (error) {
			console.error('Error getting document:', error);
			throw error;
		}
	},

	// Delete a document by ID
	async delete(id: string, rev: string) {
		const db = getDB();
		try {
			const response = await db.remove(id, rev);
			return response;
		} catch (error) {
			console.error('Error deleting document:', error);
			throw error;
		}
	},

	// List all documents
	async allDocs() {
		const db = getDB();
		try {
			const response = await db.allDocs({ include_docs: true });
			return response.rows.map((row: any) => row.doc);
		} catch (error) {
			console.error('Error getting all documents:', error);
			throw error;
		}
	},

	// Listen to database changes
	async changes() {
		const db = getDB();
		return db.changes({
			live: true,
			include_docs: true
		});
	}
};

export default pouchdbService;
