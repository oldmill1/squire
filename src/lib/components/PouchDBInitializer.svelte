<script lang="ts">
	import { onMount } from 'svelte';
	import { loadCursorPositionAfterDBReady } from '$lib/stores/textStore';

	onMount(async () => {
		try {
			// Load PouchDB from CDN as fallback
			const script = document.createElement('script');
			script.src = 'https://cdn.jsdelivr.net/npm/pouchdb@9.0.0/dist/pouchdb.min.js';
			script.onload = () => {
				try {
					// @ts-ignore - PouchDB will be available globally
					const PouchDB = (window as any).PouchDB;
					
					if (!PouchDB || typeof PouchDB !== 'function') {
						throw new Error('PouchDB not found on window object');
					}
					
					// Create database
					const db = new PouchDB('squire_db');
					
					// Check if ready
					db.info().then((info: any) => {
						console.log('✅ PouchDB is ready (CDN):', {
							name: info.db_name,
							doc_count: info.doc_count,
							update_seq: info.update_seq
						});
						
						// Make db globally available for the service
						(window as any).pouchDBInstance = db;
						
						// Now that PouchDB is ready, load cursor position
						loadCursorPositionAfterDBReady().catch(error => {
							console.error('Failed to load cursor position after DB init:', error);
						});
					}).catch((error: any) => {
						console.error('❌ PouchDB failed to initialize:', error);
					});
				} catch (error) {
					console.error('❌ Failed to initialize PouchDB from CDN:', error);
				}
			};
			
			script.onerror = () => {
				console.error('❌ Failed to load PouchDB from CDN');
			};
			
			document.head.appendChild(script);
		} catch (error) {
			console.error('❌ Failed to setup PouchDB:', error);
		}
	});
</script>
