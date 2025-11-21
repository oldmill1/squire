<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { documentService } from '$lib/services/documentService';
  import type { Document } from '$lib/types/document';
  import Userinput from '$lib/components/userInput/Userinput.svelte';
  import Statusbar from '$lib/components/statusBar/Statusbar.svelte';
  import Display from '$lib/components/display/Display.svelte';
  import ScrollBar from '$lib/components/scrollBar/ScrollBar.svelte';
  import { textStore } from '$lib/stores/textStore';
  import { initializeShortcuts } from '$lib/services/shortcuts';
  import { activeDocumentStore } from '$lib/stores/activeDocumentStore';

  let document = $state<Document | null>(null);
  let loading = $state(true);
  let error = $state<string | null>(null);

  async function waitForPouchDB() {
    // Wait for PouchDB to be initialized with timeout
    const maxWaitTime = 5000; // 5 seconds max wait
    const startTime = Date.now();
    
    while (typeof window !== 'undefined' && !(window as any).pouchDBInstance) {
      if (Date.now() - startTime > maxWaitTime) {
        throw new Error('PouchDB initialization timeout after 5 seconds');
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Additional wait to ensure database is fully ready
    await new Promise(resolve => setTimeout(resolve, 200));
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
      } else {
        // Set as active document
        activeDocumentStore.set(document);
        
        // Load document lines into global textStore
        textStore.set(document.lines);
        
        // Load cursor position from document if it exists
        if (document.cursorPosition) {
          const { setCursorPosition } = await import('$lib/stores/cursorStore');
          const { currentLineStore } = await import('$lib/stores/currentLineStore');
          
          setCursorPosition(document.cursorPosition.line, document.cursorPosition.col);
          currentLineStore.set(document.cursorPosition.line);
        }
        
        // Initialize shortcuts for keyboard input
        initializeShortcuts();
      }
    } catch (err) {
      console.error('Error loading document:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      if (errorMessage.includes('PouchDB initialization timeout')) {
        error = 'Database initialization failed. Please refresh the page.';
      } else {
        error = 'Failed to load document';
      }
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
  <!-- Editor components -->
  <Userinput />
  <Statusbar centerText={document.title} rightText="" />
  <Display />
  <ScrollBar 
    minValue={0} 
    maxValue={100} 
    currentValue={0} 
  />
{/if}
