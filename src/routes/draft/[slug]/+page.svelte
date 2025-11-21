<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { documentService } from '$lib/services/documentService';
  import type { Document } from '$lib/types/document';

  let document = $state<Document | null>(null);
  let loading = $state(true);
  let error = $state<string | null>(null);

  async function waitForPouchDB() {
    // Wait for PouchDB to be initialized
    while (typeof window !== 'undefined' && !(window as any).pouchDBInstance) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  onMount(async () => {
    const slug = $page.params.slug;
    const docId = `doc:${slug}`;
    
    try {
      // Wait for PouchDB to be ready
      await waitForPouchDB();
      
      document = await documentService.loadDocument(docId);
      if (!document) {
        error = 'Document not found';
      }
    } catch (err) {
      console.error('Error loading document:', err);
      error = 'Failed to load document';
    } finally {
      loading = false;
    }
  });
</script>

{#if loading}
  <div style="padding: 20px;">
    <p>Loading document...</p>
  </div>
{:else if error}
  <div style="padding: 20px;">
    <p style="color: red;">{error}</p>
    <a href="/">← Back to home</a>
  </div>
{:else if document}
  <div style="padding: 20px; font-family: monospace;">
    <h1>{document.title}</h1>
    <p><strong>Document ID:</strong> {document._id}</p>
    <p><strong>Created:</strong> {document.createdAt.toLocaleString()}</p>
    <p><strong>Updated:</strong> {document.updatedAt.toLocaleString()}</p>
    <p><strong>Line count:</strong> {document.lines.length}</p>
    
    <h2>Lines:</h2>
    {#if document.lines.length === 0}
      <p><em>No lines yet (empty document)</em></p>
    {:else}
      <pre>{document.lines.join('\n')}</pre>
    {/if}
    
    <div style="margin-top: 20px;">
      <a href="/">← Back to home</a>
    </div>
  </div>
{/if}
