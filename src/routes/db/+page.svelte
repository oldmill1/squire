<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { pouchdbService } from '$lib/services/pouchdbService';
  
  let mounted = $state(false);
  let databases = $state<Array<{
    name: string;
    documentCount: number;
    id: string;
  }>>([]);
  let loading = $state(true);
  
  onMount(async () => {
    mounted = true;
    await loadDatabaseInfo();
  });
  
  async function loadDatabaseInfo() {
    let retries = 0;
    const maxRetries = 10;
    
    while (retries < maxRetries) {
      try {
        // Check if PouchDB is available on window
        if (typeof window !== 'undefined' && !(window as any).pouchDBInstance) {
          console.log('PouchDB not ready, retrying...');
          await new Promise(resolve => setTimeout(resolve, 500));
          retries++;
          continue;
        }
        
        // Get the PouchDB instance
        const db = await pouchdbService.getDB();
        
        // Get database info including document count
        const info = await db.info();
        
        databases = [{
          name: 'squire_db',
          documentCount: info.doc_count,
          id: 'squire_db'
        }];
        
        console.log('Database info loaded:', info);
        break;
      } catch (error) {
        console.error(`Failed to load database info (attempt ${retries + 1}):`, error);
        if (retries === maxRetries - 1) {
          // Show error state instead of no databases
          databases = [{
            name: 'squire_db',
            documentCount: 0,
            id: 'squire_db'
          }];
        }
        retries++;
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    loading = false;
  }
</script>

<div class="db-container">
  {#if mounted}
    <div class="table-container">
      {#if loading}
        <p>Loading database information...</p>
      {:else if databases.length > 0}
        <table class="db-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Number of Documents</th>
              <th>View Database</th>
            </tr>
          </thead>
          <tbody>
            {#each databases as db}
              <tr>
                <td>{db.name}</td>
                <td>{db.documentCount}</td>
                <td>
                  <a href="?id={db.id}" class="view-link">View</a>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      {:else}
        <p>No databases found.</p>
      {/if}
    </div>
  {/if}
</div>

<style>
  .db-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 2rem;
  }
  
  .table-container {
    width: 100%;
    max-width: 600px;
  }
  
  .db-table {
    width: 100%;
    border-collapse: collapse;
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    overflow: hidden;
  }
  
  .db-table th,
  .db-table td {
    padding: 1rem 1.5rem;
    text-align: left;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.9);
  }
  
  .db-table th {
    font-weight: 500;
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  
  .db-table tbody tr:hover {
    background: rgba(255, 255, 255, 0.03);
  }
  
  .db-table tbody tr:last-child td {
    border-bottom: none;
  }
  
  .view-link {
    color: #007AFF;
    text-decoration: none;
    font-size: 0.875rem;
    font-weight: 500;
    transition: opacity 0.2s;
  }
  
  .view-link:hover {
    opacity: 0.7;
  }
  
  p {
    color: rgba(255, 255, 255, 0.6);
    text-align: center;
  }
</style>
