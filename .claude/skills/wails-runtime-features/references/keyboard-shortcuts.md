---
title: Keyboard Shortcuts
description: Register global keyboard shortcuts for quick access to functionality
sidebar:
  order: 1
---

import { Tabs, TabItem } from "@astrojs/starlight/components";

Wails provides a powerful key binding system that allows you to register keyboard shortcuts that work across all windows in your application **while the app is focused**. This enables users to quickly access functionality without navigating through menus.

> **注意（beta.9）**：`app.KeyBinding` 是**应用级**快捷键——只在应用获得焦点时触发。若需要**系统级全局快捷键**（应用未聚焦也能触发），请使用 `app.GlobalShortcut`（见文末「Global Shortcuts（系统级）」）。

## Accessing the Key Binding Manager

The key binding manager is accessed through the `KeyBindings` property on your application instance:

```go
app := application.New(application.Options{
    Name: "Keyboard Shortcuts Demo",
})

// Access the key binding manager
keyBindings := app.KeyBinding
```

## Adding Key Bindings

### Basic Key Binding

Register a simple keyboard shortcut:

```go
app.KeyBinding.Add("Ctrl+S", func(window application.Window) {
    // Handle save action
    app.Logger.Info("Save shortcut triggered")
    // Perform save operation...
})
```

### Multiple Key Bindings

Register multiple shortcuts for common operations:

```go
// File operations
app.KeyBinding.Add("Ctrl+N", func(window application.Window) {
    // New file
    window.EmitEvent("file:new", nil)
})

app.KeyBinding.Add("Ctrl+O", func(window application.Window) {
    // Open file
    dialog := app.Dialog.OpenFile()
    if file, err := dialog.PromptForSingleSelection(); err == nil {
        window.EmitEvent("file:open", file)
    }
})

app.KeyBinding.Add("Ctrl+S", func(window application.Window) {
    // Save file
    window.EmitEvent("file:save", nil)
})

// Edit operations
app.KeyBinding.Add("Ctrl+Z", func(window application.Window) {
    // Undo
    window.EmitEvent("edit:undo", nil)
})

app.KeyBinding.Add("Ctrl+Y", func(window application.Window) {
    // Redo (Windows/Linux)
    window.EmitEvent("edit:redo", nil)
})

app.KeyBinding.Add("Cmd+Shift+Z", func(window application.Window) {
    // Redo (macOS)
    window.EmitEvent("edit:redo", nil)
})
```

## Key Binding Accelerators

### Accelerator Format

Key bindings use a standard accelerator format with modifiers and keys:

```go
// Modifier keys
"Ctrl+S"        // Control + S
"Cmd+S"         // Command + S (macOS)
"Alt+F4"        // Alt + F4
"Shift+Ctrl+Z"  // Shift + Control + Z

// Function keys
"F1"            // F1 key
"Ctrl+F5"       // Control + F5

// Special keys
"Escape"        // Escape key
"Enter"         // Enter key
"Space"         // Spacebar
"Tab"           // Tab key
"Backspace"     // Backspace key
"Delete"        // Delete key

// Arrow keys
"Up"            // Up arrow
"Down"          // Down arrow
"Left"          // Left arrow
"Right"         // Right arrow
```

### Platform-Specific Accelerators

Handle platform differences for common shortcuts:

```go
import "runtime"

// Cross-platform save shortcut
if runtime.GOOS == "darwin" {
    app.KeyBinding.Add("Cmd+S", saveHandler)
} else {
    app.KeyBinding.Add("Ctrl+S", saveHandler)
}

// Or register both
app.KeyBinding.Add("Ctrl+S", saveHandler)
app.KeyBinding.Add("Cmd+S", saveHandler)
```

## Managing Key Bindings

### Removing Key Bindings

Remove key bindings when they're no longer needed:

```go
// Remove a specific key binding
app.KeyBinding.Remove("Ctrl+S")

// Example: Temporary key binding for a modal
app.KeyBinding.Add("Escape", func(window application.Window) {
    // Close modal
    window.EmitEvent("modal:close", nil)
    // Remove this temporary binding
    app.KeyBinding.Remove("Escape")
})
```

### Getting All Key Bindings

Retrieve all registered key bindings:

```go
allBindings := app.KeyBinding.GetAll()
for _, binding := range allBindings {
    app.Logger.Info("Key binding", "accelerator", binding.Accelerator)
}
```

## Advanced Usage

### Context-Aware Key Bindings

Make key bindings context-aware by checking application state:

```go
app.KeyBinding.Add("Ctrl+S", func(window application.Window) {
    // Check current application state
    if isEditMode() {
        // Save document
        saveDocument()
    } else if isInSettings() {
        // Save settings
        saveSettings()
    } else {
        app.Logger.Info("Save not available in current context")
    }
})
```

### Window-Specific Actions

Key bindings receive the active window, allowing window-specific behavior:

```go
app.KeyBinding.Add("F11", func(window application.Window) {
    // Toggle fullscreen for the active window
    window.ToggleFullscreen()
})

app.KeyBinding.Add("Ctrl+W", func(window application.Window) {
    // Close the active window
    window.Close()
})
```

### Dynamic Key Binding Management

Dynamically add and remove key bindings based on application state:

```go
func enableEditMode() {
    // Add edit-specific key bindings
    app.KeyBinding.Add("Ctrl+B", func(window application.Window) {
        window.EmitEvent("format:bold", nil)
    })
    
    app.KeyBinding.Add("Ctrl+I", func(window application.Window) {
        window.EmitEvent("format:italic", nil)
    })
    
    app.KeyBinding.Add("Ctrl+U", func(window application.Window) {
        window.EmitEvent("format:underline", nil)
    })
}

func disableEditMode() {
    // Remove edit-specific key bindings
    app.KeyBinding.Remove("Ctrl+B")
    app.KeyBinding.Remove("Ctrl+I")
    app.KeyBinding.Remove("Ctrl+U")
}
```

## Platform Considerations

<Tabs>
  <TabItem label="macOS" icon="fa-brands:apple">
    
    On macOS:
    
    - Use `Cmd` instead of `Ctrl` for standard shortcuts
    - `Cmd+Q` is typically reserved for quitting the application
    - `Cmd+H` hides the application
    - `Cmd+M` minimizes windows
    - Consider standard macOS keyboard shortcuts
    
    Common macOS patterns:
    ```go
    app.KeyBinding.Add("Cmd+N", newFileHandler)      // New
    app.KeyBinding.Add("Cmd+O", openFileHandler)     // Open
    app.KeyBinding.Add("Cmd+S", saveFileHandler)     // Save
    app.KeyBinding.Add("Cmd+Z", undoHandler)         // Undo
    app.KeyBinding.Add("Cmd+Shift+Z", redoHandler)   // Redo
    app.KeyBinding.Add("Cmd+C", copyHandler)         // Copy
    app.KeyBinding.Add("Cmd+V", pasteHandler)        // Paste
    ```
    
  </TabItem>
  
  <TabItem label="Windows" icon="fa-brands:windows">
    
    On Windows:
    
    - Use `Ctrl` for standard shortcuts
    - `Alt+F4` closes applications
    - `F1` typically opens help
    - Consider Windows keyboard conventions
    
    Common Windows patterns:
    ```go
    app.KeyBinding.Add("Ctrl+N", newFileHandler)     // New
    app.KeyBinding.Add("Ctrl+O", openFileHandler)    // Open
    app.KeyBinding.Add("Ctrl+S", saveFileHandler)    // Save
    app.KeyBinding.Add("Ctrl+Z", undoHandler)        // Undo
    app.KeyBinding.Add("Ctrl+Y", redoHandler)        // Redo
    app.KeyBinding.Add("Ctrl+C", copyHandler)        // Copy
    app.KeyBinding.Add("Ctrl+V", pasteHandler)       // Paste
    app.KeyBinding.Add("F1", helpHandler)            // Help
    ```
    
  </TabItem>
  
  <TabItem label="Linux" icon="fa-brands:linux">
    
    On Linux:
    
    - Generally follows Windows conventions with `Ctrl`
    - May vary by desktop environment
    - Consider GNOME/KDE standard shortcuts
    - Some desktop environments reserve certain shortcuts
    
    Common Linux patterns:
    ```go
    app.KeyBinding.Add("Ctrl+N", newFileHandler)     // New
    app.KeyBinding.Add("Ctrl+O", openFileHandler)    // Open
    app.KeyBinding.Add("Ctrl+S", saveFileHandler)    // Save
    app.KeyBinding.Add("Ctrl+Z", undoHandler)        // Undo
    app.KeyBinding.Add("Ctrl+Shift+Z", redoHandler)  // Redo
    app.KeyBinding.Add("Ctrl+C", copyHandler)        // Copy
    app.KeyBinding.Add("Ctrl+V", pasteHandler)       // Paste
    ```
    
  </TabItem>
</Tabs>

## Best Practices

1. **Use Standard Shortcuts**: Follow platform conventions for common operations:
   ```go
   // Cross-platform save
   if runtime.GOOS == "darwin" {
       app.KeyBinding.Add("Cmd+S", saveHandler)
   } else {
       app.KeyBinding.Add("Ctrl+S", saveHandler)
   }
   ```

2. **Provide Visual Feedback**: Let users know when shortcuts are triggered:
   ```go
   app.KeyBinding.Add("Ctrl+S", func(window application.Window) {
       saveDocument()
       // Show brief notification
       window.EmitEvent("notification:show", "Document saved")
   })
   ```

3. **Handle Conflicts**: Be careful not to override important system shortcuts:
   ```go
   // Avoid overriding system shortcuts like:
   // Ctrl+Alt+Del (Windows)
   // Cmd+Space (macOS Spotlight)
   // Alt+Tab (Window switching)
   ```

4. **Document Shortcuts**: Provide help or documentation for available shortcuts:
   ```go
   app.KeyBinding.Add("F1", func(window application.Window) {
       // Show help dialog with available shortcuts
       showKeyboardShortcutsHelp()
   })
   ```

5. **Clean Up**: Remove temporary key bindings when they're no longer needed:
   ```go
   func enterEditMode() {
       app.KeyBinding.Add("Escape", exitEditModeHandler)
   }
   
   func exitEditModeHandler(window application.Window) {
       exitEditMode()
       app.KeyBinding.Remove("Escape") // Clean up temporary binding
   }
   ```

## Complete Example

Here's a complete example of a text editor with keyboard shortcuts:

```go
package main

import (
    "runtime"
    "github.com/wailsapp/wails/v3/pkg/application"
)

func main() {
    app := application.New(application.Options{
        Name: "Text Editor with Shortcuts",
    })

    // File operations
    if runtime.GOOS == "darwin" {
        app.KeyBinding.Add("Cmd+N", func(window application.Window) {
            window.EmitEvent("file:new", nil)
        })
        app.KeyBinding.Add("Cmd+O", func(window application.Window) {
            openFile(app, window)
        })
        app.KeyBinding.Add("Cmd+S", func(window application.Window) {
            window.EmitEvent("file:save", nil)
        })
    } else {
        app.KeyBinding.Add("Ctrl+N", func(window application.Window) {
            window.EmitEvent("file:new", nil)
        })
        app.KeyBinding.Add("Ctrl+O", func(window application.Window) {
            openFile(app, window)
        })
        app.KeyBinding.Add("Ctrl+S", func(window application.Window) {
            window.EmitEvent("file:save", nil)
        })
    }

    // View operations
    app.KeyBinding.Add("F11", func(window application.Window) {
        window.ToggleFullscreen()
    })

    app.KeyBinding.Add("F1", func(window application.Window) {
        showKeyboardShortcuts(window)
    })

    // Create main window
    window := app.Window.New()
    window.SetTitle("Text Editor")

    err := app.Run()
    if err != nil {
        panic(err)
    }
}

func openFile(app *application.App, window application.Window) {
    dialog := app.Dialog.OpenFile()
    dialog.AddFilter("Text Files", "*.txt;*.md")
    
    if file, err := dialog.PromptForSingleSelection(); err == nil {
        window.EmitEvent("file:open", file)
    }
}

func showKeyboardShortcuts(window application.Window) {
    shortcuts := `
Keyboard Shortcuts:
- Ctrl/Cmd+N: New file
- Ctrl/Cmd+O: Open file
- Ctrl/Cmd+S: Save file
- F11: Toggle fullscreen
- F1: Show this help
`
    window.EmitEvent("help:show", shortcuts)
}
```

:::tip[Pro Tip]
Test your key bindings on all target platforms to ensure they work correctly and don't conflict with system shortcuts.
:::

:::danger[Warning]
Be careful not to override critical system shortcuts. Some key combinations are reserved by the operating system and cannot be captured by applications.
:::

## Global Shortcuts（系统级）— beta.9 新增

`app.KeyBinding` 只在应用聚焦时触发。若要注册**系统级全局快捷键**（应用未聚焦、甚至在后台时也能触发），使用 `app.GlobalShortcut`。各平台原生实现、无第三方依赖：macOS 用 Carbon Hot Keys，Windows 用 `RegisterHotKey`，X11 用 `XGrabKey`，Wayland 走 XDG Desktop Portal 的 global shortcuts 接口。

```go
app := application.New(application.Options{Name: "Global Shortcut Demo"})

// 注册：accelerator 字符串 + 无参回调
err := app.GlobalShortcut.Register("Ctrl+Alt+K", func() {
    app.Logger.Info("全局快捷键触发（应用未聚焦也生效）")
})
if err != nil {
    app.Logger.Error("注册失败", "error", err)
}
```

完整 API（`app.GlobalShortcut *GlobalShortcutManager`）：

| 方法 | 签名 | 说明 |
|------|------|------|
| `Register` | `Register(accelerator string, callback func()) error` | 注册一个系统级快捷键 |
| `Unregister` | `Unregister(accelerator string) error` | 注销指定快捷键 |
| `UnregisterAll` | `UnregisterAll() error` | 注销全部（应用退出时会自动调用） |
| `IsRegistered` | `IsRegistered(accelerator string) bool` | 查询是否已注册 |
| `GetAll` | `GetAll() []string` | 列出当前已注册的全部 accelerator |

对比一句话记忆：**`KeyBinding` = 应用内（聚焦时跨窗口）；`GlobalShortcut` = 操作系统级（不聚焦也触发）。**
