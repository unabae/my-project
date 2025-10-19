# WebSocket Implementation Documentation

## 📚 Table of Contents

1. [Overview](#overview)
2. [Files Created](#files-created)
3. [How It Works](#how-it-works)
4. [Key Concepts Explained](#key-concepts-explained)
5. [Testing Instructions](#testing-instructions)
6. [Understanding the Code Flow](#understanding-the-code-flow)
7. [Common Questions](#common-questions)

---

## Overview

This documentation explains the WebSocket implementation for real-time communication between your Next.js frontend and Bun backend.

**What is a WebSocket?**

- A WebSocket is like a phone call - both sides stay connected and can talk anytime
- HTTP requests are like text messages - you send one, get a reply, and it's done
- WebSockets enable real-time features like chat, live notifications, and collaborative editing

---

## Files Created

### 1. `apps/web/src/hooks/useWebSocket.ts`

**Purpose:** Custom React hook that manages WebSocket connections

**What it provides:**

- `status` - Current connection state (disconnected/connecting/connected/error)
- `messages` - Array of all sent and received messages
- `connect()` - Function to open a WebSocket connection
- `disconnect()` - Function to close the connection
- `sendMessage(text)` - Function to send data to the server
- `clearMessages()` - Function to clear message history

**Key features:**

- Automatic cleanup (no memory leaks)
- Event handling (onopen, onmessage, onerror, onclose)
- State management
- Reusable in any component

### 2. `apps/web/src/app/websocket-test/page.tsx`

**Purpose:** Test page with UI to try WebSocket connections

**Features:**

- ✅ Visual connection status indicator
- 🔌 Connect/Disconnect buttons
- 💬 Message input with Send button
- 📜 Console-style message history
- 📋 Instructions for users

---

## How It Works

### The Complete Flow

```
┌─────────────┐                    ┌─────────────┐
│   FRONTEND  │                    │   BACKEND   │
│  (Browser)  │                    │ (Bun Server)│
└──────┬──────┘                    └──────┬──────┘
       │                                  │
       │  1. User clicks "Connect"        │
       │─────────────────────────────────>│
       │     (includes session cookie)    │
       │                                  │
       │  2. Check auth.api.getSession()  |
       │      ✓ Valid session            |
       │                                  │
       │  3. Connection accepted          │
       │<─────────────────────────────────│
       │                                  │
       │  4. "Welcome user@email.com"     │
       │<─────────────────────────────────│
       │                                  │
       │  5. User types "Hello!"          │
       │     Click "Send"                 │
       │─────────────────────────────────>│
       │                                  │
       │            6. Server logs message
       │               (No response sent)  │
       │                                  │
```

### Authentication Flow

1. **User must be logged in** - WebSocket requires authentication
2. **Browser sends cookies** - Automatically included with WebSocket handshake
3. **Server checks session** - Uses Better Auth to verify
4. **Accept or reject** - Server either upgrades connection or returns 401

---

## Key Concepts Explained

### 1. WebSocket States (readyState)

The WebSocket connection has 4 possible states:

| State      | Value | Meaning                             |
| ---------- | ----- | ----------------------------------- |
| CONNECTING | 0     | Connection is being established     |
| OPEN       | 1     | Connection is ready to send/receive |
| CLOSING    | 2     | Connection is closing               |
| CLOSED     | 3     | Connection is closed                |

**Why this matters:**

- You can only send messages when state is OPEN (1)
- The hook checks this before sending: `if (wsRef.current?.readyState === WebSocket.OPEN)`

### 2. WebSocket Events

The WebSocket API provides 4 event handlers:

```javascript
ws.onopen = () => {
  // Triggered when connection is established
  console.log("Connected!");
};

ws.onmessage = (event) => {
  // Triggered when server sends data
  console.log("Received:", event.data);
};

ws.onerror = (error) => {
  // Triggered when something goes wrong
  console.error("Error:", error);
};

ws.onclose = () => {
  // Triggered when connection closes
  console.log("Disconnected");
};
```

### 3. React Hooks Used

#### useState

- Stores data that affects what's rendered on screen
- When state changes, React re-renders the component
- Examples: `status`, `messages`, `messageInput`

```javascript
const [status, setStatus] = useState("disconnected");
// Later: setStatus("connected") → triggers re-render
```

#### useRef

- Stores data that doesn't need to trigger re-renders
- Persists across re-renders (doesn't reset)
- Examples: WebSocket instance, timeout IDs

```javascript
const wsRef = useRef(null);
wsRef.current = new WebSocket(url);
// Later: wsRef.current.send("Hello")
```

#### useEffect

- Runs code when component mounts/unmounts
- Cleanup function prevents memory leaks
- Empty dependency array `[]` = run once

```javascript
useEffect(() => {
  // Setup code (runs once on mount)

  return () => {
    // Cleanup code (runs once on unmount)
    // CRITICAL: Close WebSocket here!
  };
}, []);
```

### 4. Controlled Components

A "controlled component" means React controls the input's value:

```javascript
// ❌ Uncontrolled (DOM manages value)
<input type="text" />

// ✅ Controlled (React manages value)
<input
  type="text"
  value={messageInput}           // React controls value
  onChange={(e) => setMessageInput(e.target.value)}  // Update on change
/>
```

**Benefits:**

- Single source of truth (state)
- Easy to validate or transform input
- Can programmatically set/clear value

### 5. Conditional Rendering

Showing different UI based on conditions:

```javascript
// Pattern 1: Ternary operator
{status === "connected" ? "Connected!" : "Not connected"}

// Pattern 2: Logical AND
{status !== "connected" && <p>⚠️ Please connect first</p>}

// Pattern 3: Early return
{messages.length === 0 ? (
  <p>No messages yet</p>
) : (
  <div>{messages.map(msg => ...)}</div>
)}
```

---

## Testing Instructions

### Step 1: Start the Backend Server

```bash
cd apps/server
bun run dev
```

You should see:

```
🚀 Server running on http://localhost:3000
```

### Step 2: Make Sure You're Logged In

1. Navigate to `/auth/login`
2. Sign in with your account
3. WebSockets require authentication!

### Step 3: Open the Test Page

Navigate to: `http://localhost:3000/websocket-test`
(Adjust port if your frontend runs on a different port)

### Step 4: Test the Connection

1. **Click "Connect"**

   - Status should change from gray to yellow to green
   - You should see a welcome message from the server

2. **Send a Message**

   - Type "Hello server!" in the input
   - Click "Send" or press Enter
   - You'll see the message in the history (blue = sent)

3. **Check Server Console**

   - You should see: `[user-id] says: Hello server!`

4. **Try Disconnecting**
   - Click "Disconnect"
   - Status should turn gray
   - Try sending a message (should show error)

---

## Understanding the Code Flow

### When Component Mounts

```
1. Component renders
2. useWebSocket hook initializes
   - Sets status to "disconnected"
   - Creates empty messages array
   - Sets up refs
3. UI displays with "Connect" button enabled
```

### When User Clicks "Connect"

```
1. connect() function is called
2. Check if already connected (guard clause)
3. Set status to "connecting" → UI updates (yellow dot)
4. Create new WebSocket instance
5. Browser sends HTTP upgrade request with cookies
6. Server checks authentication
7. If valid:
   - Server sends upgrade response
   - ws.onopen fires
   - Set status to "connected" → UI updates (green dot)
   - Server sends welcome message
   - ws.onmessage fires
   - Add message to array → UI updates
```

### When User Sends Message

```
1. User types in input
2. onChange updates messageInput state
3. User clicks "Send" (or presses Enter)
4. handleSend() is called
5. Checks if input has content
6. Calls sendMessage(text)
7. Check if WebSocket is open
8. ws.send(text) - sends to server
9. Add "Sent: text" to messages array
10. Clear input field
11. UI updates with new message (blue)
```

### When Component Unmounts

```
1. React calls useEffect cleanup function
2. Close WebSocket connection
3. Clear any pending timeouts
4. Clean up refs
5. Prevents memory leaks!
```

---

## Common Questions

### Q: Why use WebSockets instead of regular API calls?

**A:** WebSockets are better when you need real-time updates:

| Feature     | HTTP                     | WebSocket         |
| ----------- | ------------------------ | ----------------- |
| Connection  | New for each request     | Stays open        |
| Server push | No (must poll)           | Yes               |
| Overhead    | High (headers each time) | Low               |
| Latency     | Higher                   | Lower             |
| Use case    | Regular data fetching    | Real-time updates |

### Q: Can the server send messages without me asking?

**A:** Yes! That's the main benefit of WebSockets:

- HTTP: Client must always initiate
- WebSocket: Either side can send anytime

### Q: What happens if connection drops?

**A:** Current implementation:

- Status changes to "disconnected"
- Can't send messages until reconnected
- Must manually click "Connect" again

**Future enhancement:** Add auto-reconnect logic

### Q: Why do we need authentication?

**A:** Security!

- Prevents unauthorized access
- Server knows who is connected
- Can associate messages with users
- Prevents abuse

### Q: Can I send JSON data?

**A:** Yes! Just stringify it:

```javascript
const data = { type: "chat", text: "Hello", userId: 123 };
ws.send(JSON.stringify(data));

// Server receives: '{"type":"chat","text":"Hello","userId":123}'
```

### Q: How do I see WebSocket traffic?

**A:** Use browser DevTools:

1. Open DevTools (F12)
2. Go to Network tab
3. Filter by "WS" (WebSocket)
4. Click on connection
5. See "Messages" tab - shows all frames sent/received!

### Q: What's the difference between ws:// and wss://?

**A:**

- `ws://` - Unencrypted (like HTTP)
- `wss://` - Encrypted with TLS (like HTTPS)
- Use `wss://` in production!

---

## Next Steps

Now that you understand the basics, try:

1. **Modify the welcome message** on the server
2. **Add auto-reconnect** on disconnect
3. **Send JSON data** instead of plain text
4. **Build a chat room** with multiple users
5. **Add typing indicators** ("User is typing...")
6. **Store messages in database** for history

---

## Summary

You've learned:

- ✅ What WebSockets are and why they're useful
- ✅ How to create a custom React hook
- ✅ useState vs useRef vs useEffect
- ✅ WebSocket API (events, states)
- ✅ Controlled components
- ✅ Conditional rendering
- ✅ Authentication with WebSockets
- ✅ Clean up to prevent memory leaks

**Remember:** Always close WebSocket connections when components unmount!

Happy coding! 🚀
