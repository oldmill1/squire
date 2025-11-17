# Svelte 5 Component Writing Guide

## Core Principles

**This project uses Svelte 5 exclusively. Never use Svelte 4 syntax.**

---

## Component Structure

### Basic Template

```svelte
<script lang="ts">
  import styles from './ComponentName.module.scss';
  import type { Snippet } from 'svelte';
  
  interface Props {
    // Define all props here
    requiredProp: string;
    optionalProp?: number;
    snippetProp?: Snippet;
  }
  
  let { requiredProp, optionalProp = 42, snippetProp }: Props = $props();
</script>

<div class={styles.container}>
  <!-- Component markup -->
</div>
```

---

## Props (`$props()`)

### Standard Props

```svelte
<script lang="ts">
  interface Props {
    title: string;                    // Required
    count?: number;                   // Optional
    variant?: 'primary' | 'secondary'; // Union type with optional
  }
  
  // Destructure with defaults
  let { title, count = 0, variant = 'primary' }: Props = $props();
</script>
```

### Snippet Props (Replacing Slots)

**Never use `<slot>` - use snippets instead:**

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';
  
  interface Props {
    children?: Snippet;        // Default content (was unnamed slot)
    header?: Snippet;          // Named snippet (was named slot)
    footer?: Snippet<[number]>; // Snippet with parameters
  }
  
  let { children, header, footer }: Props = $props();
</script>

<div>
  {#if header}
    {@render header()}
  {/if}
  
  {#if children}
    {@render children()}
  {/if}
  
  {#if footer}
    {@render footer(42)}
  {/if}
</div>
```

**Usage:**
```svelte
<MyComponent>
  {#snippet header()}
    <h1>Header Content</h1>
  {/snippet}
  
  {#snippet children()}
    <p>Main content</p>
  {/snippet}
  
  {#snippet footer(count)}
    <p>Count: {count}</p>
  {/snippet}
</MyComponent>
```

---

## State Management

### Reactive State (`$state()`)

```svelte
<script lang="ts">
  let count = $state(0);
  let user = $state({ name: 'John', age: 30 });
  
  function increment() {
    count++; // Reactivity just works
  }
  
  function updateUser() {
    user.age++; // Nested reactivity works
  }
</script>
```

### Derived State (`$derived()`)

```svelte
<script lang="ts">
  let count = $state(0);
  
  // Automatically recomputes when count changes
  let doubled = $derived(count * 2);
  let isEven = $derived(count % 2 === 0);
</script>

<p>Count: {count}</p>
<p>Doubled: {doubled}</p>
<p>Is even: {isEven}</p>
```

### Side Effects (`$effect()`)

```svelte
<script lang="ts">
  let count = $state(0);
  
  // Runs when count changes
  $effect(() => {
    console.log('Count changed:', count);
    
    // Cleanup function (optional)
    return () => {
      console.log('Cleaning up');
    };
  });
</script>
```

**Pre-effect (runs before DOM updates):**
```svelte
<script lang="ts">
  import { untrack } from 'svelte';
  
  let value = $state(0);
  
  $effect.pre(() => {
    // Runs before DOM updates
    console.log('Before update:', value);
  });
</script>
```

---

## Events

### Event Handlers (No more `on:click`)

```svelte
<script lang="ts">
  interface Props {
    onclick?: (event: MouseEvent) => void;
    onsubmit?: (data: FormData) => void;
  }
  
  let { onclick, onsubmit }: Props = $props();
  
  function handleClick(event: MouseEvent) {
    onclick?.(event);
  }
</script>

<button onclick={handleClick}>
  Click me
</button>
```

**Usage:**
```svelte
<MyButton onclick={(e) => console.log('Clicked!', e)} />
```

---

## Component Patterns

### Component with Children

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';
  
  interface Props {
    title: string;
    children?: Snippet;
  }
  
  let { title, children }: Props = $props();
</script>

<div>
  <h2>{title}</h2>
  {#if children}
    <div class="content">
      {@render children()}
    </div>
  {/if}
</div>
```

### Component with Multiple Named Snippets

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';
  
  interface Props {
    heading?: Snippet;
    body?: Snippet;
    footer?: Snippet;
  }
  
  let { heading, body, footer }: Props = $props();
</script>

<article>
  {#if heading}
    <header>{@render heading()}</header>
  {/if}
  
  {#if body}
    <main>{@render body()}</main>
  {/if}
  
  {#if footer}
    <footer>{@render footer()}</footer>
  {/if}
</article>
```

### Dynamic Component Rendering

```svelte
<script lang="ts">
  import type { Component } from 'svelte';
  
  interface Props {
    component: Component;
    componentProps?: Record<string, any>;
  }
  
  let { component, componentProps = {} }: Props = $props();
</script>

<svelte:component this={component} {...componentProps} />
```

---

## Conditional Rendering & Loops

### Standard Patterns (Unchanged)

```svelte
{#if condition}
  <p>True</p>
{:else if otherCondition}
  <p>Other</p>
{:else}
  <p>False</p>
{/if}

{#each items as item, index (item.id)}
  <div>{item.name}</div>
{/each}

{#await promise}
  <p>Loading...</p>
{:then data}
  <p>Data: {data}</p>
{:catch error}
  <p>Error: {error.message}</p>
{/await}
```

---

## TypeScript Integration

### Component Props Type Safety

```svelte
<script lang="ts">
  interface NavItem {
    label: string;
    href: string;
    active?: boolean;
  }
  
  interface Props {
    items: NavItem[];
    layout?: 'horizontal' | 'vertical';
  }
  
  let { items, layout = 'horizontal' }: Props = $props();
</script>
```

### Snippet Type Parameters

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';
  
  interface Props {
    // Snippet with no parameters
    header?: Snippet;
    
    // Snippet with typed parameters
    item?: Snippet<[{ id: number; name: string }]>;
  }
  
  let { header, item }: Props = $props();
</script>

{#if item}
  {@render item({ id: 1, name: 'Test' })}
{/if}
```

---

## SCSS Module Integration

```svelte
<script lang="ts">
  import styles from './Component.module.scss';
  
  interface Props {
    variant?: 'primary' | 'secondary';
  }
  
  let { variant = 'primary' }: Props = $props();
</script>

<div class="{styles.container} {styles[variant]}">
  Content
</div>
```

---

## Common Mistakes to Avoid

### ❌ Don't Use Svelte 4 Syntax

```svelte
<!-- WRONG - Svelte 4 -->
<script>
  export let prop;
  let state = 0;
  $: doubled = state * 2;
</script>

<slot />
<slot name="header" />
<button on:click={handler}>Click</button>
```

### ✅ Use Svelte 5 Syntax

```svelte
<!-- CORRECT - Svelte 5 -->
<script lang="ts">
  interface Props {
    prop: string;
  }
  
  let { prop }: Props = $props();
  let state = $state(0);
  let doubled = $derived(state * 2);
</script>

{@render children?.()}

<button onclick={handler}>Click</button>
```

---

## Component Checklist

- [ ] Uses `$props()` for all props
- [ ] Has TypeScript `interface Props`
- [ ] Uses `$state()` for local state
- [ ] Uses `$derived()` for computed values
- [ ] Uses `$effect()` for side effects
- [ ] Uses snippets instead of slots
- [ ] Uses `onclick` instead of `on:click`
- [ ] Imports SCSS modules with `import styles from './Component.module.scss'`
- [ ] No Svelte 4 syntax anywhere