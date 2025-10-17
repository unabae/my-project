# WebSocket Architecture Documentation

## Table of Contents

1. [Overview](#overview)
2. [Architecture Components](#architecture-components)
3. [File Structure](#file-structure)
4. [Data Flow](#data-flow)
5. [Key Concepts](#key-concepts)
6. [Code Examples](#code-examples)
7. [Adding New Features](#adding-new-features)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

## Overview

This WebSocket implementation provides a scalable, maintainable real-time communication system. It's designed with separation of concerns in mind, making it easy to understand, test, and extend.

### Key Features

- **Multiple connections per user** (multiple tabs/devices)
- **Type-safe message handling** with TypeScript
- **Modular architecture** with separate concerns
- **Extensible message system** for different message types
- **Connection management** with user tracking
- **Broadcasting capabilities** to all or specific users

## Architecture Components

### 1. WebSocket Manager (`manager.ts`)

The core component that handles all WebSocket connection lifecycle events.

**Responsibilities:**

- Track connected users and their connections
- Handle connection open/close events
- Manage user state (online/offline)
- Broadcast messages to users
- Provide connection statistics

**Key Methods:**

- `handleOpen(ws)` - Called when a user connects
- `handleClose(ws)` - Called when a user disconnects
- `handleMessage(ws, message)` - Routes messages to handlers
- `broadcastMessage(message, excludeWs?)` - Sends messages to all users

### 2. Message Handlers (`handlers.ts`)

Specialized classes that process different types of messages.

**Responsibilities:**

- Validate incoming messages
- Process messages according to business logic
- Generate appropriate responses
- Handle message-specific broadcasting

**Built-in Handlers:**

- `ChatMessageHandler` - Processes chat messages
- `TypingIndicatorHandler` - Handles typing indicators
- `PingHandler` - Manages connection health checks

### 3. Type Definitions (`types.ts`)

Comprehensive TypeScript types and interfaces.

**Key Types:**

- `WebSocketData` - Data attached to each connection
- `ConnectedUser` - Information about connected users
- `WebSocketMessage` - Union type of all message types
- `WebSocketManagerConfig` - Configuration options

### 4. Main Server (`server.ts`)

The entry point that integrates everything together.

**Responsibilities:**

- Initialize WebSocket system
- Handle HTTP-to-WebSocket upgrades
- Route WebSocket events to the manager
- Integrate with authentication system

## File Structure

```
apps/server/src/websocket/
├── index.ts          # Main exports and convenience functions
├── types.ts          # TypeScript types and interfaces
├── manager.ts        # WebSocket connection management
├── handlers.ts       # Message processing handlers
└── README.md         # This documentation
```

## Data Flow

### 1. Connection Establishment

```
Client Request → Server Upgrade → Authentication → WebSocket Manager → User Tracking
```

1. Client sends WebSocket upgrade request to `/ws`
2. Server verifies authentication using Better Auth
3. If authenticated, connection is upgraded to WebSocket
4. `WebSocketManager.handleOpen()` is called
5. User is added to connected users map
6. Welcome message and user list are sent

### 2. Message Processing

```
Client Message → Message Parser → Handler Registry → Specific Handler → Broadcasting
```

1. Client sends a message
2. `WebSocketManager.handleMessage()` receives it
3. Message is parsed (JSON or plain text)
4. `MessageHandlerRegistry` finds appropriate handler
5. Handler validates and processes the message
6. Response is broadcast to relevant users

### 3. Disconnection

```
Client Disconnect → WebSocket Manager → User State Update → Broadcasting
```

1. Client disconnects or closes connection
2. `WebSocketManager.handleClose()` is called
3. Connection is removed from user's connection set
4. If last connection, user is removed from connected users
5. Other users are notified of the disconnection

## Key Concepts

### Multiple Connections Per User

Users can have multiple WebSocket connections (multiple browser tabs, devices, etc.). The system tracks:

- **Connected Users Map**: One entry per user (regardless of connection count)
- **WebSocket Instances Map**: Multiple connections per user

### Message Types

All messages follow a consistent structure:

```typescript
{
  type: "message_type",
  // ... other properties
}
```

### Broadcasting Strategies

- **Broadcast to All**: Send to every connected user
- **Broadcast to Others**: Send to all users except sender
- **Send to Specific User**: Send to a particular user's connections

### Connection State Management

The system maintains two main data structures:

```typescript
// One entry per user
connectedUsers: Map<string, ConnectedUser>;

// Multiple connections per user
wsInstances: Map<string, Set<WebSocket>>;
```

## Code Examples

### Basic Usage

```typescript
import { createWebSocketSystem } from "./src/websocket";

// Create WebSocket system
const { manager, processMessage } = createWebSocketSystem({
  verboseLogging: true,
  maxConnectionsPerUser: 5,
  echoToSender: false,
});

// Use in Bun server
const server = Bun.serve({
  websocket: {
    open: (ws) => manager.handleOpen(ws),
    message: (ws, message) => processMessage(ws, message),
    close: (ws) => manager.handleClose(ws),
  },
});
```

### Adding a Custom Message Handler

```typescript
import { MessageHandler } from "./src/websocket";

class CustomMessageHandler implements MessageHandler {
  readonly messageType = "custom_message";

  validate(data: any): boolean {
    return data?.type === this.messageType && data?.content;
  }

  handle(ws, data, connectedUsers, wsInstances) {
    // Custom logic here
    console.log("Custom message received:", data.content);
  }
}

// Register the handler
const registry = new MessageHandlerRegistry();
registry.register(new CustomMessageHandler());
```

### Broadcasting Messages

```typescript
// Broadcast to all users
wsManager.broadcastMessage(
  JSON.stringify({
    type: "announcement",
    message: "Server maintenance in 5 minutes",
  })
);

// Get connection statistics
const stats = wsManager.getConnectionStats();
console.log(`Total users: ${stats.totalUsers}`);
console.log(`Total connections: ${stats.totalConnections}`);
```

## Adding New Features

### 1. New Message Type

1. Define the message type in `types.ts`
2. Create a handler class in `handlers.ts`
3. Register the handler in the registry
4. Update the `WebSocketMessage` union type

### 2. New Broadcasting Method

1. Add method to `WebSocketManager` class
2. Implement the broadcasting logic
3. Add appropriate TypeScript types
4. Document the new functionality

### 3. Connection Limits

1. Configure `maxConnectionsPerUser` in the manager config
2. The system will automatically enforce limits
3. Customize error handling for limit exceeded

## Best Practices

### 1. Message Validation

Always validate incoming messages:

```typescript
validate(data: any): boolean {
  return (
    data &&
    typeof data === 'object' &&
    data.type === this.messageType &&
    // ... other validations
  );
}
```

### 2. Error Handling

Wrap message processing in try-catch blocks:

```typescript
try {
  handler.handle(ws, data, connectedUsers, wsInstances);
} catch (error) {
  console.error(`Error processing message:`, error);
}
```

### 3. Connection State Checks

Always check if WebSocket is open before sending:

```typescript
if (ws.readyState === WebSocket.OPEN) {
  ws.send(message);
}
```

### 4. Logging

Use consistent logging for debugging:

```typescript
if (this.config.verboseLogging) {
  console.log(`User ${email} connected`);
}
```

## Troubleshooting

### Common Issues

#### 1. Messages Not Being Received

- Check if the message type is registered
- Verify message format matches handler expectations
- Ensure WebSocket connection is open

#### 2. Users Not Appearing in Connected List

- Verify authentication is working
- Check if `handleOpen` is being called
- Ensure user data is being stored correctly

#### 3. Broadcasting Not Working

- Check if target WebSocket connections are open
- Verify broadcasting logic in handlers
- Ensure proper error handling

#### 4. Memory Leaks

- Monitor connection cleanup in `handleClose`
- Check for proper removal from Maps
- Verify no circular references

### Debugging Tips

1. **Enable Verbose Logging**:

   ```typescript
   const { manager } = createWebSocketSystem({
     verboseLogging: true,
   });
   ```

2. **Check Connection Stats**:

   ```typescript
   const stats = wsManager.getConnectionStats();
   console.log("Connection stats:", stats);
   ```

3. **Monitor Message Flow**:
   Add logging in message handlers to track message processing

4. **Test with Multiple Connections**:
   Open multiple browser tabs to test multi-connection scenarios

## Performance Considerations

### 1. Connection Limits

Set appropriate limits to prevent resource exhaustion:

```typescript
maxConnectionsPerUser: 5; // Reasonable limit for most applications
```

### 2. Message Size

Keep messages small and efficient:

- Use JSON for structured data
- Compress large payloads if needed
- Avoid sending unnecessary data

### 3. Broadcasting Efficiency

- Use targeted broadcasting when possible
- Batch multiple messages if needed
- Consider rate limiting for high-frequency messages

### 4. Memory Management

- Regularly clean up disconnected users
- Monitor memory usage in production
- Use connection pooling for database operations

## Security Considerations

### 1. Authentication

- Always verify user authentication before upgrading to WebSocket
- Re-validate sessions periodically for long-lived connections
- Implement proper session management

### 2. Message Validation

- Validate all incoming messages
- Sanitize user input
- Implement rate limiting to prevent spam

### 3. Access Control

- Implement proper authorization for different message types
- Restrict broadcasting based on user roles
- Log security-relevant events

This architecture provides a solid foundation for real-time applications while maintaining code quality, type safety, and extensibility. The modular design makes it easy to understand, test, and extend as your application grows.
