# Squire (WIP)

Goal: To create keyboard-driven writing editor. Squire offers a distraction-free writing experience inspired by Vim.

## Modes

Squire operates in three distinct modes, each optimized for different tasks:

#### **Normal Mode** (Default)
The default mode when the editor starts. In normal mode, you can:
- Navigate and view your document
- Use keyboard shortcuts for various commands
- Switch to other modes using mode-specific keys

#### **Interactive Mode**
Type `i` to enter interactive mode for direct text input:
- Type characters directly into the document
- Press `Enter` to create new lines
- Use `Backspace` to delete characters
- Press `Escape` to return to normal mode

When in interactive mode, the editor has typewriter mode, something you'll find only on desktop-class editors previously.

#### **Command-Line Mode (vim inpired)**
Press `Shift+:` (or `:` on some keyboards) to enter command mode for advanced operations:
- **Line Selection**: Select lines by number
  - `:3` - Select the 3rd line
  - `:1,5` - Select lines 1 through 5
  - `:%` - Select all lines
- **Line Deletion**: Delete lines using the `d` command
  - `:3d` - Delete the 3rd line
  - `:1,5d` - Delete lines 1 through 5
  - `:%d` - Delete all lines
- **Debug Module Control**: Show or hide the debug module
  - `:dopen` or `dopen` - Show the debug module
  - `:dclose` or `dclose` - Hide the debug module
- Press `Escape` to cancel and return to normal mode
- Press `Enter` to execute the command

### Text Editing

- **Line-based editing**: Text is organized into lines, making it easy to navigate and manipulate
- **Visual line selection**: Selected lines are highlighted in the display
- **Current line indicator**: The line you're currently editing is visually distinguished
- **Smart cursor**: A blinking cursor shows your current position, with special handling for empty lines

### Auto-Save

- **Automatic saving**: All changes are automatically saved to browser localStorage
- **Save notifications**: A timestamp notification appears in the status bar when changes are saved
- **Persistent storage**: Your work is automatically restored when you reload the page

### Display Features

- **Adjustable font size**: 
  - Press `+` or `=` to increase font size
  - Press `-` or `_` to decrease font size
  - Font size range: 0.5rem to 3rem
- **Empty state**: When starting fresh, the editor displays "Squire" as a placeholder
- **Typewriter scrolling**: In interactive mode, the viewport automatically scrolls to keep your current line visible

### Status Bar

The status bar at the bottom displays:
- **Left**: Current mode (Normal/Interactive) or command input (`:command`)
- **Center**: Save notification timestamp (when available)
- **Right**: Line and word count (format: `lines(words)`)

### Keyboard Shortcuts

- `i` - Enter interactive mode (from normal mode)
- `Shift+:` or `:` - Enter command mode (from normal mode)
- `Escape` - Return to normal mode (from interactive or command mode)
- `+` or `=` - Increase font size
- `-` or `_` - Decrease font size
- `Ctrl+R` - Custom refresh action (configurable)


## Usage Tips

1. **Starting fresh**: When you first open Squire, you'll see "Squire" displayed. Press `i` to start typing.

2. **Line operations**: Use command mode (`:`) to quickly select and delete specific lines or ranges.

3. **Font adjustment**: Adjust the font size to your preference using `+` and `-` keys for comfortable reading.

4. **Auto-save**: Your work is automatically saved as you type. The save notification shows when your last change was saved.

5. **Mode switching**: Remember that `Escape` always returns you to normal mode, where you can use shortcuts and commands.

## Technical Details

- Built with **SvelteKit** and **Svelte 5**
- Uses **SCSS modules** for styling
- State management via **Svelte stores**
- Keyboard input handled through a custom keyboard service
- Data persistence via **localStorage**

## License

MIT
