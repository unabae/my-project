/**
 * WebSocket Types and Interfaces
 *
 * This file contains all the TypeScript types and interfaces used throughout
 * the WebSocket implementation. It helps maintain type safety and makes the
 * code more readable and maintainable.
 */

// ============================================================================
// CORE WEBSOCKET TYPES
// ============================================================================

/**
 * Data that gets attached to each WebSocket connection
 * This is set during the upgrade process and contains user information
 */
export type WebSocketData = {
  userId: string;
  email: string;
};

/**
 * Information about a connected user
 * Stored in our connectedUsers Map to track who's online
 */
export interface ConnectedUser {
  userId: string;
  email: string;
  connectedAt: string; // ISO timestamp when user first connected
}

// ============================================================================
// MESSAGE TYPES
// ============================================================================

/**
 * Base interface for all WebSocket messages
 * All messages should have a type field for proper handling
 */
export interface BaseMessage {
  type: string;
}

/**
 * Chat message sent by users
 */
export interface ChatMessage extends BaseMessage {
  type: "chat_message";
  message: string;
}

/**
 * System message sent when a user joins
 */
export interface UserJoinedMessage extends BaseMessage {
  type: "user_joined";
  user: ConnectedUser;
}

/**
 * System message sent when a user leaves
 */
export interface UserLeftMessage extends BaseMessage {
  type: "user_left";
  userId: string;
  email: string;
}

/**
 * Message containing the list of currently connected users
 */
export interface ConnectedUsersMessage extends BaseMessage {
  type: "connected_users";
  users: ConnectedUser[];
}

/**
 * Union type of all possible message types
 * This helps TypeScript understand what messages we can receive/send
 */
export type WebSocketMessage =
  | ChatMessage
  | UserJoinedMessage
  | UserLeftMessage
  | ConnectedUsersMessage;

// ============================================================================
// WEBSOCKET MANAGER TYPES
// ============================================================================

/**
 * Configuration options for the WebSocket manager
 * Allows customization of behavior without changing the core logic
 */
export interface WebSocketManagerConfig {
  /** Whether to log detailed connection information */
  verboseLogging?: boolean;
  /** Maximum number of connections per user (default: unlimited) */
  maxConnectionsPerUser?: number;
  /** Whether to broadcast messages back to the sender */
  echoToSender?: boolean;
}

/**
 * Statistics about WebSocket connections
 * Useful for monitoring and debugging
 */
export interface ConnectionStats {
  totalUsers: number;
  totalConnections: number;
  connectionsPerUser: Map<string, number>;
}

// ============================================================================
// ERROR TYPES
// ============================================================================

/**
 * Custom error types for WebSocket operations
 */
export class WebSocketError extends Error {
  constructor(message: string, public code: string, public userId?: string) {
    super(message);
    this.name = "WebSocketError";
  }
}

export class ConnectionLimitError extends WebSocketError {
  constructor(userId: string, maxConnections: number) {
    super(
      `User ${userId} has reached the maximum connection limit of ${maxConnections}`,
      "CONNECTION_LIMIT_EXCEEDED",
      userId
    );
    this.name = "ConnectionLimitError";
  }
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Generic WebSocket instance type
 * We use 'any' here because Bun's WebSocket type isn't fully exported
 * In a real production app, you might want to create a more specific type
 */
export type WebSocketInstance = any;

/**
 * Set of WebSocket instances for a single user
 * Allows users to have multiple connections (multiple tabs/devices)
 */
export type UserConnectionSet = Set<WebSocketInstance>;

/**
 * Map storing all WebSocket instances by user ID
 * Key: userId, Value: Set of WebSocket instances for that user
 */
export type WebSocketInstancesMap = Map<string, UserConnectionSet>;

/**
 * Map storing connected user information
 * Key: userId, Value: ConnectedUser object
 */
export type ConnectedUsersMap = Map<string, ConnectedUser>;
