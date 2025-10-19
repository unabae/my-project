# Frontend WebSocket Architecture Documentation

## Table of Contents

1. [Overview](#overview)
2. [Architecture Components](#architecture-components)
3. [File Structure](#file-structure)
4. [Component Design](#component-design)
5. [Custom Hooks](#custom-hooks)
6. [Configuration Management](#configuration-management)
7. [Type Safety](#type-safety)
8. [Best Practices](#best-practices)
9. [Usage Examples](#usage-examples)
10. [Extending the System](#extending-the-system)

## Overview

This frontend WebSocket implementation provides a clean, modular architecture for real-time communication testing. It's designed with React best practices, TypeScript type safety, and component reusability in mind.

### Key Features

- **Modular Components**: Each UI section is a separate, reusable component
- **Custom Hooks**: Encapsulated logic for message handling and state management
- **Type Safety**: Full TypeScript support with proper interfaces
- **Configuration-Driven**: Centralized configuration for easy customization
- **Responsive Design**: Works well on different screen sizes
- **Accessibility**: Proper ARIA labels and keyboard navigation

## Architecture Components

### 1. Components (`_components/`)

Each component handles a specific UI responsibility:

#### ConnectionStatusCard

- **Purpose**: Displays connection status with visual indicators
- **Features**: Animated status dots, connect/disconnect buttons
- **Props**: `status`, `onConnect`, `onDisconnect`, `isChatMode`

#### MessageInputCard

- **Purpose**: Handles message input and sending
- **Features**: Controlled input, keyboard shortcuts, validation
- **Props**: `status`, `onSendMessage`, `onSendChatMessage`, `isChatMode`

#### MessageHistoryCard

- **Purpose**: Displays message history with styling
- **Features**: Color-coded messages, timestamps, scrollable area
- **Props**: `messages`, `onClearMessages`, `title`, `description`

#### ConnectedUsersCard

- **Purpose**: Shows list of connected users
- **Features**: User avatars, connection timestamps, online indicators
- **Props**: `users`, `title`, `description`

#### InstructionsCard

- **Purpose**: Displays help text and instructions
- **Features**: Customizable content, themed styling
- **Props**: `title`, `instructions`, `className`

#### NavigationTabs

- **Purpose**: Tab navigation between different screens
- **Features**: Active state styling, user count display
- **Props**: `currentScreen`, `onScreenChange`, `connectedUsersCount`

### 2. Custom Hooks (`_hooks/`)

#### useMessageHandlers

- **Purpose**: Manages different types of message sending
- **Returns**: Functions for sending various message types
- **Features**: Structured message creation, type safety

#### useScreenState

- **Purpose**: Manages screen navigation state
- **Returns**: Current screen, navigation functions, screen checks
- **Features**: Type-safe screen management

### 3. Utilities (`_utils/`)

#### constants.ts

- **Purpose**: Centralized configuration and constants
- **Contains**: WebSocket URL, UI text, message types, status values
- **Benefits**: Easy to modify, consistent across components

## File Structure

```
apps/web/src/app/websocket-test/
├── page.tsx                    # Main page component
├── _components/                # Reusable UI components
│   ├── index.ts               # Component exports
│   ├── ConnectionStatusCard.tsx
│   ├── MessageInputCard.tsx
│   ├── MessageHistoryCard.tsx
│   ├── ConnectedUsersCard.tsx
│   ├── InstructionsCard.tsx
│   └── NavigationTabs.tsx
├── _hooks/                     # Custom React hooks
│   ├── index.ts               # Hook exports
│   ├── useMessageHandlers.ts
│   └── useScreenState.ts
├── _utils/                     # Utilities and configuration
│   └── constants.ts
└── FRONTEND_ARCHITECTURE.md   # This documentation
```

## Component Design

### Component Principles

1. **Single Responsibility**: Each component has one clear purpose
2. **Props Interface**: Well-defined TypeScript interfaces for all props
3. **Default Values**: Sensible defaults for optional props
4. **Composition**: Components can be composed together easily
5. **Reusability**: Components are designed to be reused in different contexts

### Example Component Structure

```typescript
// 1. Types and interfaces
export interface ComponentProps {
  // Well-defined prop types
}

// 2. Default configuration
const defaultConfig = {
  // Sensible defaults
};

// 3. Component implementation
export function Component({ ...props }: ComponentProps) {
  // Component logic
  return (
    // JSX with proper styling
  );
}
```

## Custom Hooks

### Hook Design Patterns

1. **Encapsulation**: Complex logic is hidden inside hooks
2. **Return Objects**: Hooks return objects with related functions
3. **Type Safety**: Full TypeScript support for hook returns
4. **Dependency Management**: Proper useCallback for stable references

### Example Hook Structure

```typescript
export function useCustomHook(props: HookProps): HookReturn {
  // State management
  const [state, setState] = useState(initialState);

  // Memoized functions
  const handler = useCallback(() => {
    // Handler logic
  }, [dependencies]);

  // Return object with related functions
  return {
    state,
    handler,
    // ... other functions
  };
}
```

## Configuration Management

### Centralized Configuration

All configuration is centralized in `constants.ts`:

```typescript
export const PAGE_CONFIG = {
  title: "WebSocket Test Page",
  description: "Test real-time communication with the server",
} as const;

export const CARD_CONFIG = {
  test: {
    connectionStatus: {
      title: "Connection Status",
      description: "Click connect to establish a WebSocket connection",
    },
    // ... more configuration
  },
  chat: {
    // ... chat-specific configuration
  },
} as const;
```

### Benefits

- **Single Source of Truth**: All text and configuration in one place
- **Easy Localization**: Simple to translate or modify text
- **Type Safety**: `as const` ensures literal types
- **Consistency**: Same configuration used across components

## Type Safety

### TypeScript Features Used

1. **Interface Definitions**: Clear contracts for all props and data
2. **Union Types**: Type-safe status and screen values
3. **Generic Types**: Reusable type patterns
4. **Const Assertions**: Literal types for configuration
5. **Type Exports**: Clean type exports from components

### Example Type Definitions

```typescript
export type ConnectionStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "error";

export interface ConnectedUser {
  userId: string;
  email: string;
  connectedAt: string;
}

export interface ComponentProps {
  status: ConnectionStatus;
  onAction: () => void;
  isEnabled?: boolean;
}
```

## Best Practices

### 1. Component Organization

- **Co-location**: Related files are grouped together
- **Index Files**: Clean exports from each directory
- **Naming Conventions**: Consistent naming patterns

### 2. State Management

- **Local State**: Use useState for component-specific state
- **Custom Hooks**: Extract complex state logic into hooks
- **Props Drilling**: Minimize by using proper component composition

### 3. Performance

- **useCallback**: Memoize event handlers
- **useMemo**: Memoize expensive calculations
- **Component Splitting**: Split large components for better performance

### 4. Accessibility

- **Semantic HTML**: Use proper HTML elements
- **ARIA Labels**: Add accessibility labels where needed
- **Keyboard Navigation**: Support keyboard interactions

## Usage Examples

### Basic Component Usage

```typescript
import { ConnectionStatusCard } from "./_components";

function MyComponent() {
  const [status, setStatus] = useState("disconnected");

  return (
    <ConnectionStatusCard
      status={status}
      onConnect={() => setStatus("connecting")}
      onDisconnect={() => setStatus("disconnected")}
      isChatMode={false}
    />
  );
}
```

### Using Custom Hooks

```typescript
import { useMessageHandlers, useScreenState } from "./_hooks";

function MyComponent() {
  const { currentScreen, setCurrentScreen } = useScreenState("test");
  const messageHandlers = useMessageHandlers({ sendMessage });

  return (
    <div>
      <button onClick={() => setCurrentScreen("chat")}>Switch to Chat</button>
      <button onClick={messageHandlers.sendPing}>Send Ping</button>
    </div>
  );
}
```

### Configuration Usage

```typescript
import { CARD_CONFIG, PAGE_CONFIG } from "./_utils/constants";

function MyComponent() {
  return (
    <div>
      <h1>{PAGE_CONFIG.title}</h1>
      <p>{PAGE_CONFIG.description}</p>
      <Card title={CARD_CONFIG.test.connectionStatus.title}>
        {/* Card content */}
      </Card>
    </div>
  );
}
```

## Extending the System

### Adding New Components

1. **Create Component File**: Add new component in `_components/`
2. **Define Types**: Create proper TypeScript interfaces
3. **Export from Index**: Add to `_components/index.ts`
4. **Add Configuration**: Update `constants.ts` if needed

### Adding New Hooks

1. **Create Hook File**: Add new hook in `_hooks/`
2. **Define Return Type**: Create TypeScript interface for return value
3. **Export from Index**: Add to `_hooks/index.ts`
4. **Use in Components**: Import and use in components

### Adding New Message Types

1. **Update Constants**: Add new message type to `constants.ts`
2. **Update Hook**: Add handler in `useMessageHandlers`
3. **Update Types**: Add TypeScript types if needed
4. **Test Integration**: Ensure proper message handling

### Example: Adding a New Component

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

// constants.ts
export const NEW_COMPONENT_CONFIG = {
  title: "New Component",
  description: "A new component for testing",
} as const;
```

## Testing Considerations

### Component Testing

- **Unit Tests**: Test individual components in isolation
- **Props Testing**: Test with different prop combinations
- **User Interactions**: Test button clicks, input changes
- **Accessibility**: Test keyboard navigation and screen readers

### Hook Testing

- **Custom Hook Testing**: Use `@testing-library/react-hooks`
- **State Changes**: Test state updates and side effects
- **Dependencies**: Test hook dependencies and cleanup

### Integration Testing

- **Component Integration**: Test components working together
- **WebSocket Integration**: Test real WebSocket communication
- **User Flows**: Test complete user workflows

## Performance Optimization

### Component Optimization

- **React.memo**: Memoize components that don't need frequent updates
- **useCallback**: Memoize event handlers passed to child components
- **useMemo**: Memoize expensive calculations

### Bundle Optimization

- **Code Splitting**: Split components into separate chunks
- **Tree Shaking**: Ensure unused code is eliminated
- **Dynamic Imports**: Load components on demand

## Security Considerations

### Input Validation

- **Client-Side Validation**: Validate inputs before sending
- **XSS Prevention**: Sanitize user inputs
- **Type Safety**: Use TypeScript to prevent type-related issues

### WebSocket Security

- **Authentication**: Ensure proper authentication before connection
- **Message Validation**: Validate all incoming messages
- **Rate Limiting**: Implement client-side rate limiting

This architecture provides a solid foundation for building scalable, maintainable React applications with WebSocket functionality. The modular design makes it easy to understand, test, and extend as your application grows.
