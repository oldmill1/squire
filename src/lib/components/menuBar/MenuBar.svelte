<script lang="ts">
  import styles from './MenuBar.module.scss';
  
  interface MenuItem {
    label: string;
    shortcut: string;
    action: () => void;
  }
  
  interface Props {
    items?: MenuItem[];
  }
  
  let { items = [] }: Props = $props();
  
  let confirmTimeout = $state<number | null>(null);
  let isConfirming = $state(false);
  
  const defaultItems: MenuItem[] = [
    {
      label: 'New',
      shortcut: 'N',
      action: async () => {
        if (isConfirming) {
          // User confirmed, proceed with creating new document
          isConfirming = false;
          if (confirmTimeout) {
            clearTimeout(confirmTimeout);
            confirmTimeout = null;
          }
          
          try {
            // Clear the current textStore first to prevent carrying over content
            const { deleteAllLines } = await import('$lib/stores/textStore');
            deleteAllLines();
            
            const { documentService } = await import('$lib/services/documentService');
            const { goto } = await import('$app/navigation');
            const newDoc = await documentService.createNewDocument();
            const slug = newDoc._id.replace('doc:', '');
            goto(`/draft/${slug}`);
          } catch (error) {
            console.error('Failed to create new document:', error);
          }
        } else {
          // First click, show confirmation
          isConfirming = true;
          
          // Auto-clear confirmation after 3 seconds
          confirmTimeout = window.setTimeout(() => {
            isConfirming = false;
            confirmTimeout = null;
          }, 3000);
        }
      }
    }
  ];
  
  const menuItems = $derived(
    items.length > 0 ? items : defaultItems.map(item => ({
      ...item,
      label: item.shortcut === 'N' && isConfirming ? 'Confirm?' : item.label
    }))
  );
</script>

<div class={styles.menubar}>
  {#each menuItems as item}
    <button 
      type="button" 
      class={`${styles.menuItem} ${isConfirming ? styles.confirming : ''}`} 
      onclick={(e) => {
        item.action();
        (e.currentTarget as HTMLButtonElement).blur();
      }}
      onkeydown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          item.action();
          (e.currentTarget as HTMLButtonElement).blur();
        }
      }}
      aria-label={`${item.label} (${item.shortcut})`}
    >
      {item.label}
    </button>
  {/each}
</div>
