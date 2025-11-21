<script lang="ts">
  import styles from './MenuBar.module.scss';
  import type { Snippet } from 'svelte';
  
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
  
  // Helper to get the character that should be underlined
  function getUnderlinedChar(label: string, shortcut: string): string {
    const upperLabel = label.toUpperCase();
    const upperShortcut = shortcut.toUpperCase();
    const index = upperLabel.indexOf(upperShortcut);
    return index >= 0 ? label[index] : '';
  }
  
  // Helper to get the label with underline markup
  function getLabelWithUnderline(label: string, shortcut: string): string {
    const upperLabel = label.toUpperCase();
    const upperShortcut = shortcut.toUpperCase();
    const index = upperLabel.indexOf(upperShortcut);
    
    if (index >= 0) {
      return label.slice(0, index) + `<u>${label[index]}</u>` + label.slice(index + 1);
    }
    return label;
  }
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
      {@html getLabelWithUnderline(item.label, item.shortcut)}
    </button>
  {/each}
</div>
