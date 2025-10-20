/**
 * Constants and Configuration
 *
 * Centralized configuration for the WebSocket test page.
 */

// ============================================================================
// WEBSOCKET CONFIGURATION
// ============================================================================

const DEFAULT_WS_URL = "ws://localhost:3000/ws";

export const WEBSOCKET_URL =
  process.env.NEXT_PUBLIC_WS_URL ?? DEFAULT_WS_URL;

// ============================================================================
// UI CONFIGURATION
// ============================================================================

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
    messageInput: {
      title: "Send Message",
      description:
        "Type a message and click send to test the WebSocket connection",
      placeholder: "Type your message here...",
    },
    messageHistory: {
      title: "Messages",
      description: "Messages sent and received will appear here",
    },
    instructions: {
      title: "💡 How to Use",
      instructions: [
        "Make sure you're logged in (WebSocket requires authentication)",
        'Click the "Connect" button to establish a WebSocket connection',
        'Once connected, type a message and click "Send" or press Enter',
        "Watch the messages area to see sent and received messages",
        'Click "Disconnect" when you\'re done testing',
      ],
    },
  },
  chat: {
    connectionStatus: {
      title: "Connection Status",
      description: "Connect to join the chat room",
    },
    connectedUsers: {
      title: "Connected Users",
      description: "Users currently connected to the chat room",
    },
    messageHistory: {
      title: "Chat Messages",
      description: "Real-time chat messages from all connected users",
    },
    messageInput: {
      title: "Send Chat Message",
      description: "Type a message to send to all connected users",
      placeholder: "Type your chat message here...",
    },
  },
} as const;

// ============================================================================
// MESSAGE TYPES
// ============================================================================

export const MESSAGE_TYPES = {
  CHAT_MESSAGE: "chat_message",
  TYPING_INDICATOR: "typing_indicator",
  PING: "ping",
  PONG: "pong",
} as const;

// ============================================================================
// CONNECTION STATUS
// ============================================================================

export const CONNECTION_STATUS = {
  DISCONNECTED: "disconnected",
  CONNECTING: "connecting",
  CONNECTED: "connected",
  ERROR: "error",
} as const;

export type ConnectionStatus =
  (typeof CONNECTION_STATUS)[keyof typeof CONNECTION_STATUS];
