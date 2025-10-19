# Frontend WebSocket Quick Reference Guide

## 🚀 Quick Start

### Basic Component Usage

```typescript
import { ConnectionStatusCard, MessageInputCard } from "./_components";

function MyComponent() {
  return (
    <div>
      <ConnectionStatusCard
        status="connected"
        onConnect={() => console.log("Connect")}
        onDisconnect={() => console.log("Disconnect")}
      />
      <MessageInputCard
        status="connected"
        onSendMessage={(msg) => console.log("Send:", msg)}
      />
    </div>
  );
}
```

## 📁 File Structure Overview

```
websocket-test/
├── page.tsx                    # 🎯 Main page - start here
├── _components/                # 🧩 Reusable UI components
│   ├── index.ts               # 📤 Component exports
│   ├── ConnectionStatusCard.tsx
│   ├── MessageInputCard.tsx
│   ├── MessageHistoryCard.tsx
│   ├── ConnectedUsersCard.tsx
│   ├── InstructionsCard.tsx
│   └── NavigationTabs.tsx
├── _hooks/                     # 🎣 Custom React hooks
│   ├── index.ts               # 📤 Hook exports
│   ├── useMessageHandlers.ts
│   └── useScreenState.ts
├── _utils/                     # ⚙️ Configuration
│   └── constants.ts
└── FRONTEND_ARCHITECTURE.md   # 📚 Documentation
```

## 🧩 Components

### ConnectionStatusCard

**Purpose**: Shows connection status with controls

```typescript
<ConnectionStatusCard
  status="connected" // Connection status
  onConnect={() => connect()} // Connect handler
  onDisconnect={() => disconnect()} // Disconnect handler
  isChatMode={false} // Chat mode styling
/>
```

### MessageInputCard

**Purpose**: Handles message input and sending

```typescript
<MessageInputCard
  status="connected" // Connection status
  onSendMessage={(msg) => sendMessage(msg)} // Send regular message
  onSendChatMessage={(msg) => sendChat(msg)} // Send chat message (optional)
  isChatMode={true} // Chat mode behavior
  placeholder="Type your message..." // Input placeholder
  title="Send Message" // Card title
  description="Type and send messages" // Card description
/>
```

### MessageHistoryCard

**Purpose**: Displays message history with styling

```typescript
<MessageHistoryCard
  messages={messages} // Array of message strings
  onClearMessages={() => clearMessages()} // Clear handler
  title="Messages" // Card title
  description="Message history" // Card description
/>
```

### ConnectedUsersCard

**Purpose**: Shows connected users list

```typescript
<ConnectedUsersCard
  users={connectedUsers} // Array of user objects
  title="Connected Users" // Card title
  description="Online users" // Card description
/>
```

### InstructionsCard

**Purpose**: Displays help text

```typescript
<InstructionsCard
  title="💡 How to Use" // Card title
  instructions={[
    // Array of instruction strings
    "Step 1: Connect",
    "Step 2: Send message",
  ]}
  className="bg-blue-50" // Custom styling
/>
```

### NavigationTabs

**Purpose**: Tab navigation between screens

```typescript
<NavigationTabs
  currentScreen="test" // Current screen
  onScreenChange={setCurrentScreen} // Screen change handler
  connectedUsersCount={5} // User count for display
/>
```

## 🎣 Custom Hooks

### useMessageHandlers

**Purpose**: Manages different message types

```typescript
const messageHandlers = useMessageHandlers({ sendMessage });

// Available methods:
messageHandlers.sendMessage("Hello"); // Regular message
messageHandlers.sendChatMessage("Hi all"); // Chat message
messageHandlers.sendTypingIndicator(true); // Typing indicator
messageHandlers.sendPing(); // Ping message
```

### useScreenState

**Purpose**: Manages screen navigation

```typescript
const {
  currentScreen, // Current screen ("test" | "chat")
  setCurrentScreen, // Function to change screen
  isTestScreen, // Boolean: is test screen
  isChatScreen, // Boolean: is chat screen
} = useScreenState("test");
```

## ⚙️ Configuration

### Constants Usage

```typescript
import {
  WEBSOCKET_URL,
  PAGE_CONFIG,
  CARD_CONFIG,
  MESSAGE_TYPES,
  CONNECTION_STATUS,
} from "./_utils/constants";

// WebSocket URL
const wsUrl = WEBSOCKET_URL; // "ws://localhost:3000/ws"

// Page configuration
const title = PAGE_CONFIG.title; // "WebSocket Test Page"

// Card configuration
const testConfig = CARD_CONFIG.test.connectionStatus;

// Message types
const chatType = MESSAGE_TYPES.CHAT_MESSAGE; // "chat_message"

// Connection status
const connected = CONNECTION_STATUS.CONNECTED; // "connected"
```

## 🎯 Common Patterns

### 1. Create a New Component

```typescript
// _components/NewComponent.tsx
export interface NewComponentProps {
  title: string;
  onAction: () => void;
}

export function NewComponent({ title, onAction }: NewComponentProps) {
  return (
    <div>
      <h2>{title}</h2>
      <button onClick={onAction}>Action</button>
    </div>
  );
}

// _components/index.ts
export { NewComponent } from "./NewComponent";
export type { NewComponentProps } from "./NewComponent";
```

### 2. Add New Message Handler

```typescript
// In useMessageHandlers.ts
const handleCustomMessage = useCallback(
  (data: string) => {
    const message = JSON.stringify({
      type: MESSAGE_TYPES.CUSTOM_MESSAGE,
      data: data,
    });
    sendMessage(message, true);
  },
  [sendMessage]
);

// Return in hook
return {
  // ... existing handlers
  sendCustomMessage: handleCustomMessage,
};
```

### 3. Add New Screen

```typescript
// In constants.ts
export type ScreenType = "test" | "chat" | "settings";

// In useScreenState.ts
export type ScreenType = "test" | "chat" | "settings";

// In NavigationTabs.tsx
<button onClick={() => onScreenChange("settings")}>Settings</button>;
```

### 4. Customize Styling

```typescript
// In constants.ts
export const CUSTOM_CONFIG = {
  myComponent: {
    title: "My Component",
    className: "bg-purple-50 border-purple-200",
    styles: {
      button: "bg-purple-500 hover:bg-purple-600",
      text: "text-purple-900",
    },
  },
} as const;

// In component
<MyComponent
  className={CUSTOM_CONFIG.myComponent.className}
  {...CUSTOM_CONFIG.myComponent}
/>;
```

## 🔧 Development Tips

### Component Development

1. **Start with Types**: Define interfaces first
2. **Use Default Props**: Provide sensible defaults
3. **Test Props**: Test with different prop combinations
4. **Export Types**: Export interfaces for reuse

### Hook Development

1. **Encapsulate Logic**: Keep complex logic in hooks
2. **Return Objects**: Return objects with related functions
3. **Use useCallback**: Memoize functions to prevent re-renders
4. **Type Returns**: Define clear return types

### Configuration Management

1. **Centralize Config**: Put all config in constants.ts
2. **Use Const Assertions**: Use `as const` for literal types
3. **Group Related Config**: Group related configuration together
4. **Document Config**: Add comments for complex configuration

## 🧪 Testing Patterns

### Component Testing

```typescript
import { render, screen, fireEvent } from "@testing-library/react";
import { ConnectionStatusCard } from "./_components";

test("renders connection status", () => {
  render(
    <ConnectionStatusCard
      status="connected"
      onConnect={jest.fn()}
      onDisconnect={jest.fn()}
    />
  );

  expect(screen.getByText("Connected")).toBeInTheDocument();
});
```

### Hook Testing

```typescript
import { renderHook, act } from "@testing-library/react-hooks";
import { useScreenState } from "./_hooks";

test("changes screen state", () => {
  const { result } = renderHook(() => useScreenState("test"));

  act(() => {
    result.current.setCurrentScreen("chat");
  });

  expect(result.current.currentScreen).toBe("chat");
  expect(result.current.isChatScreen).toBe(true);
});
```

## 🚨 Common Issues & Solutions

### Components Not Rendering

- ✅ Check imports are correct
- ✅ Verify props are passed correctly
- ✅ Check for TypeScript errors
- ✅ Ensure components are exported

### Hooks Not Working

- ✅ Check hook dependencies
- ✅ Verify useCallback usage
- ✅ Check for infinite re-renders
- ✅ Ensure proper cleanup

### Styling Issues

- ✅ Check Tailwind classes
- ✅ Verify dark mode classes
- ✅ Check component className props
- ✅ Ensure proper CSS imports

### Type Errors

- ✅ Check interface definitions
- ✅ Verify prop types match
- ✅ Check for missing exports
- ✅ Ensure proper type imports

## 📈 Performance Tips

1. **Memoize Components**: Use React.memo for expensive components
2. **Optimize Re-renders**: Use useCallback for event handlers
3. **Lazy Load**: Use dynamic imports for large components
4. **Bundle Analysis**: Analyze bundle size regularly

## 🔒 Security Best Practices

1. **Validate Inputs**: Always validate user inputs
2. **Sanitize Data**: Sanitize data before displaying
3. **Type Safety**: Use TypeScript for type safety
4. **Error Boundaries**: Implement error boundaries

This quick reference should help you work efficiently with the refactored frontend architecture!
