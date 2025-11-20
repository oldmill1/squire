# Svelte 5 Animations & Transitions Guide

## Key Lessons Learned

### 1. CSS Transitions vs Svelte Transitions

**Problem**: CSS transitions don't work reliably with Svelte 5's new reactivity system.

**Solution**: Use Svelte's built-in transitions (`transition:fade`, `transition:slide`, etc.) instead of CSS transitions.

**Real Example**: See our line numbers implementation in `src/lib/components/display/Display.svelte:285-291`

```svelte
<!-- ❌ Doesn't work reliably with Svelte 5 -->
<div class="fade-transition">
  {#if show}
    <div>Content</div>
  {/if}
</div>

<!-- ✅ Works reliably with Svelte 5 -->
<!-- From: src/lib/components/display/Display.svelte -->
<div class={styles.lineNumber}>
  {#if showLineNumbers}
    <div transition:fade={{ duration: 300 }}>
      {lineNum}
    </div>
  {/if}
</div>
```

### 2. Preventing Layout Shift During Transitions

**Problem**: Conditional rendering causes layout shifts when elements appear/disappear.

**Solution**: Always render containers, conditionally render content inside.

**Real Example**: Our line number container pattern in `src/lib/components/display/Display.svelte:285-291`

```svelte
<!-- ❌ Causes layout shift -->
{#if showLineNumbers}
  <div class="line-number">{lineNum}</div>
{/if}
<div class="content">Text content</div>

<!-- ✅ No layout shift - Our working implementation -->
<!-- From: src/lib/components/display/Display.svelte -->
<div class={styles.lineNumber}>
  {#if showLineNumbers}
    <div transition:fade={{ duration: 300 }}>{lineNum}</div>
  {/if}
</div>
<div class={styles.lineContent}>
```

**CSS for stable layout**: See `src/lib/components/display/Display.module.scss:69-80`

```scss
.lineNumber {
  color: #9ea8b6;
  width: 2rem;
  text-align: right;
  user-select: none;
  padding-right: 0.5rem;
  flex-shrink: 0;
  min-height: 1.7em; /* Match line height */
  display: flex;
  align-items: center;
  justify-content: flex-end;
}
```

### 3. Dynamic Font Size Considerations

**Problem**: Fixed pixel values break when font size changes.

**Solution**: Use relative units (`em`, `rem`) for heights and spacing.

**Real Example**: Our font-relative sizing in `src/lib/components/display/Display.module.scss:53-67`

```scss
// ✅ Scales with font size
.line {
  display: flex;
  width: 100%;
  white-space: pre-wrap;
  word-wrap: break-word;
  min-height: 1.7em;  // Relative to font size
  padding: 0.1em 2rem 0.1em 0.5rem;  // All relative units
  // ...
}
```

### 4. SSR/Hydration Timing Issues

**Problem**: Animations run before client-side hydration is complete.

**Solution**: Wait for client-side initialization before triggering animations.

**Real Example**: Our PouchDB initialization pattern in `src/routes/+layout.svelte:16-47`

```svelte
<script>
  import { onMount } from 'svelte';
  import { settingsService } from '$lib/services/settingsService';
  
  onMount(async () => {
    // Wait for PouchDB to be ready by checking the global instance
    const waitForPouchDBGlobal = () => {
      return new Promise<void>((resolve) => {
        const check = () => {
          if (typeof window !== 'undefined' && (window as any).pouchDBInstance) {
            resolve();
          } else {
            setTimeout(check, 50);
          }
        };
        check();
      });
    };

    try {
      await waitForPouchDBGlobal();
      const lineNumbers = await settingsService.getSetting('lineNumbers', false);
      lineNumberVisibilityStore.set(lineNumbers);
    } catch (error) {
      lineNumberVisibilityStore.set(false);
    }
  });
</script>
```

### 5. External Library Integration

**Problem**: External libraries (like PouchDB) cause SSR conflicts.

**Solution**: Use dynamic imports and global instances.

**Real Example**: Our CDN-based PouchDB loader in `src/lib/components/PouchDBInitializer.svelte`

```svelte
<!-- From: src/lib/components/PouchDBInitializer.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';

  onMount(async () => {
    try {
      // Load PouchDB from CDN as fallback
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/pouchdb@9.0.0/dist/pouchdb.min.js';
      script.onload = () => {
        try {
          const PouchDB = (window as any).PouchDB;
          const db = new PouchDB('squire_db');
          
          db.info().then((info: any) => {
            console.log('✅ PouchDB is ready (CDN):', info);
            (window as any).pouchDBInstance = db;
          });
        } catch (error) {
          console.error('❌ Failed to initialize PouchDB from CDN:', error);
        }
      };
      
      document.head.appendChild(script);
    } catch (error) {
      console.error('❌ Failed to setup PouchDB:', error);
    }
  });
</script>
```

### 6. Settings Service Integration

**Real Example**: Our complete settings service in `src/lib/services/settingsService.ts`

```typescript
import { pouchdbService } from './pouchdbService';

export const settingsService = {
  // Get a setting by key
  async getSetting(key: string, defaultValue: any = null) {
    try {
      const setting = await pouchdbService.get(`setting:${key}`);
      return setting.value;
    } catch (error: any) {
      if (error.status === 404 || error.name === 'not_found') {
        return defaultValue;
      }
      console.error(`Error getting setting ${key}:`, error);
      return defaultValue;
    }
  },

  // Save a setting
  async setSetting(key: string, value: any) {
    // Implementation details...
  }
};
```

**Real Example**: Command integration in `src/lib/services/shortcuts/CommandParser.ts:36-49`

```typescript
if (setting === 'number') {
  showLineNumbers();
  // Save setting to PouchDB
  settingsService.setSetting('lineNumbers', true).catch(error => {
    console.error('Failed to save lineNumbers setting:', error);
  });
  return { success: true, message: 'Line numbers enabled' };
} else if (setting === 'nonumber') {
  hideLineNumbers();
  // Save setting to PouchDB
  settingsService.setSetting('lineNumbers', false).catch(error => {
    console.error('Failed to save lineNumbers setting:', error);
  });
  return { success: true, message: 'Line numbers disabled' };
}
```

## Best Practices Summary

1. **Prefer Svelte transitions over CSS transitions** ✅ *See Display.svelte:287*
2. **Always reserve space to prevent layout shifts** ✅ *See Display.module.scss:69-80*
3. **Use relative units for dynamic font sizes** ✅ *See Display.module.scss:53-67*
4. **Handle SSR timing with proper initialization** ✅ *See +layout.svelte:16-47*
5. **Use global instances for external libraries** ✅ *See PouchDBInitializer.svelte*
6. **Keep transition logic simple and stable** ✅ *See Display.svelte:285-291*

## Common Pitfalls to Avoid

- ❌ Mixing CSS transitions with Svelte 5 reactivity
- ❌ Conditional rendering without reserved space
- ❌ Fixed pixel values in dynamic font environments
- ❌ Ignoring SSR/hydration timing
- ❌ Complex transition logic that conflicts with reactivity

## Quick Reference

| Issue | Solution | Real Example |
|-------|----------|--------------|
| CSS transitions not working | Use `transition:fade` | Display.svelte:287 |
| Layout shifts | Reserve space with containers | Display.module.scss:69-80 |
| Font size breaks layout | Use `em` units | Display.module.scss:53-67 |
| SSR conflicts | Dynamic imports + global instances | PouchDBInitializer.svelte |
| Timing issues | Wait for client initialization | +layout.svelte:16-47 |
| Reactivity conflicts | Simple, stable state patterns | Display.svelte:285-291 |

## File References

- **Main Component**: `src/lib/components/display/Display.svelte`
- **Styles**: `src/lib/components/display/Display.module.scss`
- **Settings Service**: `src/lib/services/settingsService.ts`
- **PouchDB Service**: `src/lib/services/pouchdbService.ts`
- **Initialization**: `src/lib/components/PouchDBInitializer.svelte`
- **Layout Integration**: `src/routes/+layout.svelte`
- **Command Handling**: `src/lib/services/shortcuts/CommandParser.ts`
