import { useEffect, useRef, useState } from "react";

/**
 * WEBSOCKET HOOK - useWebSocket
 *
 * This custom hook manages WebSocket connections in React components.
 *
 * WHAT IS A WEBSOCKET?
 * - Unlike regular HTTP requests (which are one-time: request → response → done),
 *   WebSockets create a persistent two-way connection between client and server.
 * - This allows real-time communication - the server can push data to the client
 *   at any time without the client having to ask for it.
 *
 * USE CASES:
 * - Chat applications (messages appear instantly)
 * - Live notifications
 * - Real-time dashboards
 * - Collaborative editing (like Google Docs)
 * - Live sports scores
 *
 * WHY USE A CUSTOM HOOK?
 * - Encapsulates all WebSocket logic in one reusable place
 * - Handles connection lifecycle (connect, disconnect, cleanup)
 * - Manages state (connection status, messages)
 * - Prevents memory leaks when component unmounts
 */

// Type definition for the connection status
// This helps TypeScript know exactly what values are valid
type WebSocketStatus = "disconnected" | "connecting" | "connected" | "error";

// Interface for connected user data
interface ConnectedUser {
  userId: string;
  email: string;
  connectedAt: string;
}

// Interface defining what this hook returns
// Think of this as a contract - anyone using this hook knows exactly what they'll get
interface UseWebSocketReturn {
  status: WebSocketStatus; // Current connection state
  messages: string[]; // Array of all messages sent/received
  connectedUsers: ConnectedUser[]; // Array of all connected users
  connect: () => void; // Function to establish connection
  disconnect: () => void; // Function to close connection
  sendMessage: (message: string, isChatMessage?: boolean) => void; // Function to send data to server
  clearMessages: () => void; // Function to clear message history
}

/**
 * The main hook function
 * @param url - The WebSocket server URL (e.g., "ws://localhost:3000/ws")
 * @returns Object with status, messages, and control functions
 */
export function useWebSocket(url: string): UseWebSocketReturn {
  // STATE: Tracks the current connection status
  // React will re-render the component whenever this changes
  const [status, setStatus] = useState<WebSocketStatus>("disconnected");

  // STATE: Stores all messages sent and received
  // Displayed in the UI so users can see the conversation history
  const [messages, setMessages] = useState<string[]>([]);

  // STATE: Stores list of all connected users
  // Updated when users join or leave the chat
  const [connectedUsers, setConnectedUsers] = useState<ConnectedUser[]>([]);

  // REF: Stores the WebSocket instance
  // Why useRef instead of useState?
  // - Refs don't cause re-renders when changed (we only care about status changes)
  // - We need to access the same WebSocket instance across different functions
  // - Refs persist across re-renders (unlike regular variables)
  const wsRef = useRef<WebSocket | null>(null);

  // REF: Stores timeout ID for potential reconnection logic
  // (Not currently used but useful for future auto-reconnect features)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  /**
   * CONNECT FUNCTION
   * Establishes a WebSocket connection to the server
   *
   * HOW IT WORKS:
   * 1. Check if already connected (prevent duplicate connections)
   * 2. Update status to "connecting"
   * 3. Create new WebSocket instance with the provided URL
   * 4. Set up event handlers (onopen, onmessage, onerror, onclose)
   * 5. Browser automatically includes cookies (used for authentication)
   */
  const connect = () => {
    // GUARD: Prevent multiple connections
    // WebSocket.OPEN means the connection is already established
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log("WebSocket already connected");
      return;
    }

    // Update UI to show "connecting" state
    setStatus("connecting");

    try {
      // CREATE WEBSOCKET CONNECTION
      // The browser's WebSocket API handles the connection handshake
      // Format: ws:// for unencrypted, wss:// for encrypted (like http vs https)
      const ws = new WebSocket(url);

      // Store the WebSocket instance in a ref so we can use it later
      wsRef.current = ws;

      /**
       * EVENT: onopen
       * Triggered when the connection is successfully established
       * This means the server accepted our connection request
       */
      ws.onopen = () => {
        console.log("✅ WebSocket connected");
        setStatus("connected"); // Update UI to show connected state
      };

      /**
       * EVENT: onmessage
       * Triggered whenever the server sends us data
       * This is the "magic" of WebSockets - the server can push data to us!
       *
       * @param event - Contains the message data in event.data
       */
      ws.onmessage = (event) => {
        console.log("📨 Message received:", event.data);

        try {
          // Try to parse as JSON for structured messages
          const data = JSON.parse(event.data);

          if (data.type === "user_joined") {
            // Add user to connected users list
            setConnectedUsers((prev) => [...prev, data.user]);
            setMessages((prev) => [
              ...prev,
              `User ${data.user.email} joined the chat`,
            ]);
          } else if (data.type === "user_left") {
            // Remove user from connected users list
            setConnectedUsers((prev) =>
              prev.filter((user) => user.userId !== data.userId)
            );
            setMessages((prev) => [
              ...prev,
              `User ${data.email} left the chat`,
            ]);
          } else if (data.type === "connected_users") {
            // Update the entire connected users list
            setConnectedUsers(data.users);
          } else if (data.type === "chat_message") {
            // Handle chat messages
            console.log("Received chat message:", data);
            setMessages((prev) => [
              ...prev,
              `${data.user.email}: ${data.message}`,
            ]);
          } else {
            // Fallback for other message types
            setMessages((prev) => [...prev, `Received: ${event.data}`]);
          }
        } catch {
          // If not JSON, treat as plain text message
          setMessages((prev) => [...prev, `Received: ${event.data}`]);
        }
      };

      /**
       * EVENT: onerror
       * Triggered when something goes wrong with the connection
       * Examples: Network issues, server crashed, authentication failed
       */
      ws.onerror = (error) => {
        console.error("❌ WebSocket error:", error);
        setStatus("error");
      };

      /**
       * EVENT: onclose
       * Triggered when the connection is closed (by either side)
       * Could be intentional (user clicked disconnect) or unexpected (server restart)
       */
      ws.onclose = () => {
        console.log("🔌 WebSocket disconnected");
        setStatus("disconnected");
        wsRef.current = null; // Clean up the reference
      };
    } catch (error) {
      // Catch any errors during WebSocket creation
      console.error("Failed to create WebSocket:", error);
      setStatus("error");
    }
  };

  /**
   * DISCONNECT FUNCTION
   * Manually closes the WebSocket connection
   *
   * When to use:
   * - User clicks a "disconnect" button
   * - User logs out
   * - Component is unmounting
   */
  const disconnect = () => {
    if (wsRef.current) {
      wsRef.current.close(); // Tell the server we're closing the connection
      wsRef.current = null; // Clear our reference
      setStatus("disconnected"); // Update UI
      clearUsers(); // Clear connected users when disconnecting
    }
  };

  /**
   * SEND MESSAGE FUNCTION
   * Sends data to the server through the WebSocket connection
   *
   * HOW IT WORKS:
   * 1. Check if connection is open (WebSocket.OPEN = 1)
   * 2. If open, send the message using ws.send()
   * 3. Add to messages array for display in UI
   * 4. If not open, log an error
   *
   * NOTE: You can send strings or binary data (Blob, ArrayBuffer)
   * For JSON, stringify it first: ws.send(JSON.stringify({ type: 'chat', text: 'hi' }))
   */
  const sendMessage = (message: string, isChatMessage: boolean = false) => {
    // Check if WebSocket is in OPEN state (readyState === 1)
    // readyState values: 0=CONNECTING, 1=OPEN, 2=CLOSING, 3=CLOSED
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      // Send the message to the server
      wsRef.current.send(message);

      // Only add to local messages if it's not a chat message
      // Chat messages will be handled by the server broadcast
      if (!isChatMessage) {
        setMessages((prev) => [...prev, `Sent: ${message}`]);
      }
      console.log("📤 Sent message:", message);
    } else {
      // Connection not ready - show error
      console.warn("Cannot send message - WebSocket not connected");
      setMessages((prev) => [...prev, `Error: Not connected`]);
    }
  };

  /**
   * CLEAR MESSAGES FUNCTION
   * Simple utility to reset the messages array
   * Useful for "clear history" buttons
   */
  const clearMessages = () => {
    setMessages([]);
  };

  /**
   * CLEAR USERS FUNCTION
   * Simple utility to reset the connected users array
   * Useful when disconnecting
   */
  const clearUsers = () => {
    setConnectedUsers([]);
  };

  /**
   * CLEANUP EFFECT
   * This is CRITICAL for preventing memory leaks!
   *
   * WHY DO WE NEED THIS?
   * - When a React component unmounts, the WebSocket connection stays open
   * - This wastes resources and can cause errors if the connection tries to update state
   * - useEffect's cleanup function runs when the component unmounts
   *
   * WHAT IT DOES:
   * 1. Clears any pending reconnection timers
   * 2. Closes the WebSocket connection
   * 3. Cleans up the reference
   *
   * The empty dependency array [] means this effect only runs:
   * - Once when component mounts (setup)
   * - Once when component unmounts (cleanup)
   */
  useEffect(() => {
    // Capture ref values at the time the effect runs
    const currentTimeout = reconnectTimeoutRef.current;
    const currentWs = wsRef.current;

    // Return a cleanup function
    return () => {
      // Clear any pending timeouts (prevents memory leaks)
      if (currentTimeout) {
        clearTimeout(currentTimeout);
      }

      // Close the WebSocket if it exists
      if (currentWs) {
        currentWs.close();
        wsRef.current = null;
      }
    };
  }, []); // Empty dependency array = only run on mount/unmount

  /**
   * RETURN VALUE
   * The hook returns an object with all the state and functions
   * Components can destructure what they need:
   *
   * const { status, connect, sendMessage } = useWebSocket("ws://...");
   *
   * This makes the hook very flexible - use only what you need!
   */
  return {
    status, // Current connection state
    messages, // Message history
    connectedUsers, // List of connected users
    connect, // Function to open connection
    disconnect, // Function to close connection
    sendMessage, // Function to send data
    clearMessages, // Function to clear history
  };
}

/**
 * ============================================================================
 * USAGE EXAMPLE
 * ============================================================================
 *
 * import { useWebSocket } from './useWebSocket';
 *
 * function ChatComponent() {
 *   const { status, messages, connect, sendMessage } = useWebSocket('ws://localhost:3000/ws');
 *
 *   return (
 *     <div>
 *       <p>Status: {status}</p>
 *       <button onClick={connect}>Connect</button>
 *       <button onClick={() => sendMessage('Hello!')}>Send</button>
 *       {messages.map(msg => <p>{msg}</p>)}
 *     </div>
 *   );
 * }
 *
 * ============================================================================
 * KEY CONCEPTS TO REMEMBER
 * ============================================================================
 *
 * 1. WebSocket vs HTTP:
 *    - HTTP: Client asks → Server responds → Connection closes
 *    - WebSocket: Client connects → Both can send anytime → Connection stays open
 *
 * 2. WebSocket States (readyState):
 *    - 0 (CONNECTING): Connection is being established
 *    - 1 (OPEN): Connection is open and ready
 *    - 2 (CLOSING): Connection is closing
 *    - 3 (CLOSED): Connection is closed
 *
 * 3. Authentication:
 *    - Browser automatically sends cookies with WebSocket handshake
 *    - Server can check session before accepting connection
 *    - If rejected, onclose event fires immediately
 *
 * 4. Error Handling:
 *    - Always check readyState before sending
 *    - Handle onerror and onclose events
 *    - Consider auto-reconnect logic for production apps
 *
 * 5. Cleanup:
 *    - Always close connections when component unmounts
 *    - Use useEffect cleanup function
 *    - Prevents memory leaks and orphaned connections
 */
