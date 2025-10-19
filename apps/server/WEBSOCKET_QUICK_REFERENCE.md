# WebSocket Quick Reference Guide

## 🚀 Quick Start

### Basic Setup

```typescript
import { createWebSocketSystem } from "./src/websocket";

const { manager, processMessage } = createWebSocketSystem();

const server = Bun.serve({
  websocket: {
    open: (ws) => manager.handleOpen(ws),
    message: (ws, message) => processMessage(ws, message),
    close: (ws) => manager.handleClose(ws),
  },
});
```

## 📁 File Structure Overview

```
websocket/
├── index.ts          # 🎯 Main exports - start here
├── types.ts          # 📝 All TypeScript types
├── manager.ts        # 🔧 Connection management
└── handlers.ts       # 📨 Message processing
```

## 🔑 Key Classes & Functions

### WebSocketManager

**Purpose**: Manages all WebSocket connections and user state

**Key Methods**:

- `handleOpen(ws)` - User connects
- `handleClose(ws)` - User disconnects
- `handleMessage(ws, message)` - Process incoming message
- `broadcastMessage(message, excludeWs?)` - Send to all users
- `getConnectionStats()` - Get connection statistics

### MessageHandlerRegistry

**Purpose**: Routes messages to appropriate handlers

**Key Methods**:

- `register(handler)` - Add new message handler
- `processMessage(ws, data, ...)` - Route message to handler

### Message Handlers

**Purpose**: Process specific types of messages

**Built-in Handlers**:

- `ChatMessageHandler` - Handles chat messages
- `TypingIndicatorHandler` - Handles typing indicators
- `PingHandler` - Handles ping/pong for health checks

## 📊 Data Structures

### Connected Users Map

```typescript
// One entry per user (regardless of connection count)
connectedUsers: Map<string, ConnectedUser>;
```

### WebSocket Instances Map

```typescript
// Multiple connections per user (tabs, devices)
wsInstances: Map<string, Set<WebSocket>>;
```

## 💬 Message Types

### Chat Message

```typescript
{
  type: "chat_message",
  message: "Hello world!"
}
```

### Typing Indicator

```typescript
{
  type: "typing_indicator",
  isTyping: true
}
```

### Ping/Pong

```typescript
// Client sends:
{ type: "ping" }

// Server responds:
{ type: "pong", timestamp: "2024-01-01T00:00:00.000Z" }
```

## 🎯 Common Patterns

### 1. Add New Message Type

```typescript
// 1. Define type in types.ts
interface MyMessage {
  type: "my_message";
  data: string;
}

// 2. Create handler
class MyMessageHandler implements MessageHandler {
  readonly messageType = "my_message";

  validate(data: any): boolean {
    return data?.type === "my_message" && data?.data;
  }

  handle(ws, data, connectedUsers, wsInstances) {
    // Your logic here
  }
}

// 3. Register handler
registry.register(new MyMessageHandler());
```

### 2. Broadcast to All Users

```typescript
const message = JSON.stringify({
  type: "announcement",
  text: "Server maintenance in 5 minutes",
});

wsManager.broadcastMessage(message);
```

### 3. Send to Specific User

```typescript
const userWsSet = wsInstances.get(userId);
if (userWsSet) {
  userWsSet.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(message);
    }
  });
}
```

### 4. Get Connection Info

```typescript
// Get all connected users
const users = wsManager.getConnectedUsers();

// Get connection statistics
const stats = wsManager.getConnectionStats();
console.log(
  `Users: ${stats.totalUsers}, Connections: ${stats.totalConnections}`
);

// Check if user is connected
const isConnected = wsManager.isUserConnected(userId);

// Get user's connection count
const count = wsManager.getUserConnectionCount(userId);
```

## ⚙️ Configuration Options

```typescript
const { manager } = createWebSocketSystem({
  verboseLogging: true, // Detailed console logs
  maxConnectionsPerUser: 5, // Limit connections per user (0 = unlimited)
  echoToSender: true, // Send messages back to sender
});
```

## 🔍 Debugging Tips

### Enable Verbose Logging

```typescript
const { manager } = createWebSocketSystem({
  verboseLogging: true,
});
```

### Check Connection Stats

```typescript
setInterval(() => {
  const stats = wsManager.getConnectionStats();
  console.log("Stats:", stats);
}, 5000);
```

### Monitor Message Flow

```typescript
// Add to your handler
handle(ws, data, connectedUsers, wsInstances) {
  console.log(`Processing ${this.messageType}:`, data);
  // ... rest of logic
}
```

## 🚨 Common Issues & Solutions

### Messages Not Received

- ✅ Check message type is registered
- ✅ Verify message format matches handler
- ✅ Ensure WebSocket is open

### Users Not in Connected List

- ✅ Verify authentication works
- ✅ Check `handleOpen` is called
- ✅ Ensure user data is stored

### Broadcasting Not Working

- ✅ Check target connections are open
- ✅ Verify broadcasting logic
- ✅ Add error handling

## 📈 Performance Tips

1. **Set Connection Limits**: Prevent resource exhaustion
2. **Keep Messages Small**: Use efficient JSON structures
3. **Use Targeted Broadcasting**: Don't broadcast unnecessarily
4. **Monitor Memory**: Clean up disconnected users

## 🔒 Security Checklist

- ✅ Authenticate before WebSocket upgrade
- ✅ Validate all incoming messages
- ✅ Sanitize user input
- ✅ Implement rate limiting
- ✅ Log security events

## 🧪 Testing Scenarios

### Test Multiple Connections

1. Open multiple browser tabs
2. Send messages from different tabs
3. Verify all tabs receive messages
4. Close one tab, verify others still work

### Test User Join/Leave

1. Connect user A
2. Connect user B
3. Verify B sees A in user list
4. Disconnect A
5. Verify B gets "user left" notification

### Test Message Types

1. Send chat message
2. Send typing indicator
3. Send ping message
4. Verify appropriate responses

This quick reference should help you understand and work with the WebSocket system efficiently!
