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
  
  // Default items if none provided
  const defaultItems: MenuItem[] = [
    {
      label: 'New',
      shortcut: 'N',
      action: async () => {
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
      }
    }
  ];
  
  const menuItems = $derived(items.length > 0 ? items : defaultItems);
</script>

<div class={styles.menubar}>
  {#each menuItems as item}
    <button 
      type="button" 
      class={styles.menuItem} 
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
