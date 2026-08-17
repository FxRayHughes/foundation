---
title: Notifications
description: Display native system notifications with action buttons and text input
sidebar:
  order: 1
---

import { Tabs, TabItem } from "@astrojs/starlight/components";

## Introduction

Wails provides a comprehensive cross-platform notification system for desktop applications. This service allows you to display native system notifications, with support for interactive elements like action buttons and text input fields.

## Basic Usage

### Creating the Service

First, initialize the notifications service:

```go
import "github.com/wailsapp/wails/v3/pkg/application"
import "github.com/wailsapp/wails/v3/pkg/services/notifications"

// Create a new notification service
notifier := notifications.New()

//Register the service with the application
app := application.New(application.Options{
    Services: []application.Service{
        application.NewService(notifier),
    },
})
```

## Notification Authorization

Notifications on macOS require user authorization. Request and check authorization:

```go
authorized, err := notifier.CheckNotificationAuthorization()
if err != nil {
    // Handle authorization error
}
if authorized {
    // Send notifications
} else {
    // Request authorization
    authorized, err = notifier.RequestNotificationAuthorization()
}
```
On Windows and Linux this always returns `true`.

## Notification Types

### Basic Notifications

Send a basic notification with a unique id, title, optional subtitle (macOS and Linux), and body text to users:

```go
notifier.SendNotification(notifications.NotificationOptions{
    ID: "unique-id",
    Title: "New Calendar Invite",
    Subtitle: "From: Jane Doe", // Optional
    Body: "Tap to view the event",
})

```

### Interactive Notifications
Send a notification with action buttons and text inputs. These notifications require a notification category to be resgistered first:

```go
// Define a unique category id
categoryID := "unique-category-id"

// Define a category with actions
category := notifications.NotificationCategory{
    ID: categoryID,
    Actions: []notifications.NotificationAction{
        {
            ID:    "OPEN", 
            Title: "Open",
        },
        {
            ID:          "ARCHIVE", 
            Title:       "Archive", 
            Destructive: true,  /* macOS-specific */
        },
    },
    HasReplyField:    true,
    ReplyPlaceholder: "message...",
    ReplyButtonTitle: "Reply",
}

// Register the category
notifier.RegisterNotificationCategory(category)

// Send an interactive notification with the actions registered in the provided category
notifier.SendNotificationWithActions(notifications.NotificationOptions{
    ID:         "unique-id",
    Title:      "New Message",
    Subtitle:   "From: Jane Doe",
    Body:       "Are you able to make it?",
    CategoryID: categoryID,
})
```

### 增强字段（beta.9 新增）

`NotificationOptions` 在 `Title` / `Subtitle` / `Body` / `CategoryID` / `Data` 之外新增了以下可选字段。**平台不支持时会优雅降级**（忽略该字段而非报错）：

| 字段 | 类型 | 说明 |
|------|------|------|
| `Sound` | `*NotificationSound` | 送达提示音。`&NotificationSound{Silent: true}` 静音；`&NotificationSound{Name: "Ping"}` 指定音效（macOS 需音频文件位于 bundle 的 `Library/Sounds`） |
| `Attachments` | `[]NotificationAttachment` | 随通知展示的媒体文件（图片 / 音视频，主要 macOS） |
| `ThreadID` | `string` | 在通知中心把相关通知**分组**到同一线程 |
| `InterruptionLevel` | `string` | 优先级：`"passive"` / `"active"` / `"timeSensitive"` / `"critical"` |
| `Schedule` | `*NotificationSchedule` | 延迟 / 定时投递（macOS 用原生 trigger 并持久化） |

```go
notifier.SendNotification(notifications.NotificationOptions{
    ID:                "scheduled-1",
    Title:             "Standup 提醒",
    Body:              "10 分钟后开始",
    Sound:             &notifications.NotificationSound{Name: "Ping"},
    ThreadID:          "standup",
    InterruptionLevel: "timeSensitive",
})
```

## Notification Responses

Process user interactions with notifications:

```go
notifier.OnNotificationResponse(func(result notifications.NotificationResult) {
    response := result.Response
    fmt.Printf("Notification %s was actioned with: %s\n", response.ID, response.ActionIdentifier)

    if response.ActionIdentifier == "TEXT_REPLY" {
        fmt.Printf("User replied: %s\n", response.UserText)
    }

    if data, ok := response.UserInfo["sender"].(string); ok {
        fmt.Printf("Original sender: %s\n", data)
    }

    // Emit an event to the frontend
    app.Event.Emit("notification", result.Response)
})
```

## Notification Customisation

### Custom Metadata

Basic and interactive notifications can include custom data:

```go
notifier.SendNotification(notifications.NotificationOptions{
    ID: "unique-id",
    Title: "New Calendar Invite",
    Subtitle: "From: Jane Doe", // Optional
    Body: "Tap to view the event",
    Data: map[string]interface{}{
        "sender": "jane.doe@example.com",
        "timestamp": "2025-03-10T15:30:00Z",
    }
})

```

## Platform Considerations

<Tabs>
  <TabItem label="macOS" icon="fa-brands:apple">
    
    On macOS, notifications:
    
    - Require user authorization
    - Require the app to be notorized for distribution
    - Use system-standard notification appearances
    - Support `subtitle`
    - Support user text input
    - Support the `Destructive` action option
    - Automatically handle dark/light mode
    
  </TabItem>
  
  <TabItem label="Windows" icon="fa-brands:windows">
    
    On Windows, notifications:
    
    - Use Windows system toast styles
    - Adapt to Windows theme settings
    - Support user text input
    - Support high DPI displays
    - Do not support `subtitle`
    
  </TabItem>
  
  <TabItem label="Linux" icon="fa-brands:linux">
    
    On Linux, dialog behaviour depends on the desktop environment:
    
    - Use native notifications when available
    - Follow desktop environment theme
    - Position according to desktop environment rules
    - Support `subtitle`
    - Do not support user text input
    
  </TabItem>
</Tabs>

## Best Practices

1. Check and request for authorization:
   - macOS requires user authorization

2. Provide clear and concise notifications:
   - Use descriptive titles, subtitles, text, and action titles

3. Handle dialog responses appropriately:
   - Check for errors in notification responses
   - Provide feedback for user actions

4. Consider platform conventions:
   - Follow platform-specific notification patterns
   - Respect system settings

## Examples

Explore this example:

- [Notifications](/examples/notifications)

## API Reference

### Service Management
| Method                                     | Description                                           |
|--------------------------------------------|-------------------------------------------------------|
| `New()`                                    | Creates a new notifications service                   |

### Notification Authorization
| Method                                       | Description                                                |
|----------------------------------------------|------------------------------------------------------------|
| `RequestNotificationAuthorization()`         | Requests permission to display notifications (macOS)       |
| `CheckNotificationAuthorization()`           | Checks current notification authorization status (macOS)   |

### Sending Notifications
| Method                                                     | Description                                       |
|------------------------------------------------------------|---------------------------------------------------|
| `SendNotification(options NotificationOptions)`            | Sends a basic notification                        |
| `SendNotificationWithActions(options NotificationOptions)` | Sends an interactive notification with actions    |

### Notification Categories
| Method                                                        | Description                                       |
|---------------------------------------------------------------|---------------------------------------------------|
| `RegisterNotificationCategory(category NotificationCategory)` | Registers a reusable notification category        |
| `RemoveNotificationCategory(categoryID string)`               | Removes a previously registered category          |

### Managing Notifications
| Method                                          | Description                                                         |
|-------------------------------------------------|---------------------------------------------------------------------|
| `RemoveAllPendingNotifications()`               | Removes all pending notifications (macOS and Linux only)            |
| `RemovePendingNotification(identifier string)`  | Removes a specific pending notification (macOS and Linux only)      |
| `RemoveAllDeliveredNotifications()`             | Removes all delivered notifications (macOS and Linux only)          |
| `RemoveDeliveredNotification(identifier string)`| Removes a specific delivered notification (macOS and Linux only)    |
| `RemoveNotification(identifier string)`         | Removes a notification (Linux-specific)                             |

### Event Handling
| Method                                                             | Description                                     |
|--------------------------------------------------------------------|-------------------------------------------------|
| `OnNotificationResponse(callback func(result NotificationResult))` | Registers a callback for notification responses |

### Structs and Types

#### NotificationOptions
```go
type NotificationOptions struct {
    ID         string                 // Unique identifier for the notification
    Title      string                 // Main notification title
    Subtitle   string                 // Subtitle text (macOS and Linux only)
    Body       string                 // Main notification content
    CategoryID string                 // Category identifier for interactive notifications
    Data       map[string]interface{} // Custom data to associate with the notification
}
```

#### NotificationCategory 
```go
type NotificationCategory struct {
    ID               string                // Unique identifier for the category
    Actions          []NotificationAction  // Button actions for the notification
    HasReplyField    bool                  // Whether to include a text input field
    ReplyPlaceholder string                // Placeholder text for the input field
    ReplyButtonTitle string                // Text for the reply button
}
```

#### NotificationAction
```go
type NotificationAction struct {
    ID          string  // Unique identifier for the action
    Title       string  // Button text
    Destructive bool    // Whether the action is destructive (macOS-specific)
}
```

#### NotificationResponse 
```go
type NotificationResponse struct {
    ID               string                  // Notification identifier
    ActionIdentifier string                  // Action that was triggered
    CategoryID       string                  // Category of the notification
    Title            string                  // Title of the notification
    Subtitle         string                  // Subtitle of the notification
    Body             string                  // Body text of the notification
    UserText         string                  // Text entered by the user
    UserInfo         map[string]interface{}  // Custom data from the notification
}
```

#### NotificationResult
```go
type NotificationResult struct {
    Response NotificationResponse  // Response data
    Error    error                 // Any error that occurred
}
```