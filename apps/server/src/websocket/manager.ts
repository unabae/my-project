/**
 * WebSocket Manager
 *
 * This class handles all WebSocket connection management including:
 * - Tracking connected users
 * - Managing multiple connections per user
 * - Broadcasting messages
 * - Connection lifecycle events
 *
 * The manager maintains two main data structures:
 * 1. connectedUsers: Maps userId to user information (one entry per user)
 * 2. wsInstances: Maps userId to Set of WebSocket instances (multiple connections per user)
 */

import type {
  WebSocketData,
  ConnectedUser,
  WebSocketInstance,
  WebSocketInstancesMap,
  ConnectedUsersMap,
  ConnectionStats,
  WebSocketManagerConfig,
} from "./types";
import { ConnectionLimitError } from "./types";

export class WebSocketManager {
  // ============================================================================
  // PRIVATE PROPERTIES
  // ============================================================================

  /**
   * Map of connected users (one entry per user, regardless of connection count)
   * Key: userId, Value: ConnectedUser object
   */
  private connectedUsers: ConnectedUsersMap = new Map();

  /**
   * Map of WebSocket instances (supports multiple connections per user)
   * Key: userId, Value: Set of WebSocket instances for that user
   */
  private wsInstances: WebSocketInstancesMap = new Map();

  /**
   * Configuration options for the manager
   */
  private config: Required<WebSocketManagerConfig>;

  // ============================================================================
  // CONSTRUCTOR
  // ============================================================================

  constructor(config: WebSocketManagerConfig = {}) {
    this.config = {
      verboseLogging: config.verboseLogging ?? true,
      maxConnectionsPerUser: config.maxConnectionsPerUser ?? 0, // 0 = unlimited
      echoToSender: config.echoToSender ?? true,
    };
  }

  // ============================================================================
  // CONNECTION LIFECYCLE METHODS
  // ============================================================================

  /**
   * Handles a new WebSocket connection
   * Called when a client successfully connects to the WebSocket endpoint
   *
   * @param ws - The WebSocket instance with user data attached
   */
  handleOpen(ws: WebSocketInstance): void {
    const { userId, email } = ws.data as WebSocketData;

    if (this.config.verboseLogging) {
      console.log(`✅ WebSocket connected: ${userId} (${email})`);
    }

    // Check if this user already has connections
    const isNewUser = !this.connectedUsers.has(userId);

    // Check connection limit if configured
    if (this.config.maxConnectionsPerUser > 0) {
      const existingConnections = this.wsInstances.get(userId)?.size ?? 0;
      if (existingConnections >= this.config.maxConnectionsPerUser) {
        throw new ConnectionLimitError(
          userId,
          this.config.maxConnectionsPerUser
        );
      }
    }

    // Add user to connected users map (only if new user)
    if (isNewUser) {
      const userData: ConnectedUser = {
        userId,
        email,
        connectedAt: new Date().toISOString(),
      };
      this.connectedUsers.set(userId, userData);
    }

    // Add this WebSocket instance to the user's connection set
    if (!this.wsInstances.has(userId)) {
      this.wsInstances.set(userId, new Set());
    }
    this.wsInstances.get(userId)!.add(ws);

    const connectionCount = this.wsInstances.get(userId)!.size;
    if (this.config.verboseLogging) {
      console.log(`User ${email} now has ${connectionCount} connection(s)`);
    }

    // Send welcome message to the new connection
    this.sendToConnection(ws, `Welcome ${email}`);

    // Send current connected users list to the new connection
    this.sendConnectedUsersList(ws);

    // Only broadcast user joined event if this is a new user (not just a new tab)
    if (isNewUser) {
      this.broadcastUserJoined(userId);
    }
  }

  /**
   * Handles WebSocket disconnection
   * Called when a client disconnects or closes the connection
   *
   * @param ws - The WebSocket instance that's closing
   */
  handleClose(ws: WebSocketInstance): void {
    const { userId, email } = ws.data as WebSocketData;

    if (this.config.verboseLogging) {
      console.log(`❌ WebSocket closed: ${userId} (${email})`);
    }

    // Remove this specific WebSocket instance from the user's connection set
    const userWsSet = this.wsInstances.get(userId);
    if (userWsSet) {
      userWsSet.delete(ws);

      const remainingConnections = userWsSet.size;
      if (this.config.verboseLogging) {
        console.log(
          `User ${email} now has ${remainingConnections} connection(s)`
        );
      }

      // If this was the last connection for this user, remove them completely
      if (remainingConnections === 0) {
        const userData = this.connectedUsers.get(userId);
        this.connectedUsers.delete(userId);
        this.wsInstances.delete(userId);

        // Broadcast user left event to all remaining connected users
        if (userData) {
          this.broadcastUserLeft(userId, userData.email);
        }
      }
    }
  }

  // ============================================================================
  // MESSAGE HANDLING METHODS
  // ============================================================================

  /**
   * Handles incoming WebSocket messages
   * Routes messages to appropriate handlers based on message type
   *
   * @param ws - The WebSocket instance that sent the message
   * @param message - The raw message data (Buffer or string)
   */
  handleMessage(ws: WebSocketInstance, message: Buffer | string): void {
    const { userId, email } = ws.data as WebSocketData;

    if (this.config.verboseLogging) {
      console.log(`[${userId}] received message:`, message.toString());
    }

    try {
      // Try to parse as JSON first
      const data = JSON.parse(message.toString());

      // Route to appropriate handler based on message type
      switch (data.type) {
        case "chat_message":
          this.handleChatMessage(ws, data.message);
          break;
        default:
          if (this.config.verboseLogging) {
            console.log(`Unknown message type: ${data.type}`);
          }
      }
    } catch (error) {
      // If not JSON, treat as plain text chat message
      this.handleChatMessage(ws, message.toString());
    }
  }

  /**
   * Handles chat messages from users
   * Broadcasts the message to all connected users
   *
   * @param senderWs - The WebSocket instance that sent the message
   * @param message - The chat message content
   */
  private handleChatMessage(
    senderWs: WebSocketInstance,
    message: string
  ): void {
    const { userId, email } = senderWs.data as WebSocketData;

    const chatMessage = {
      type: "chat_message",
      user: { userId, email },
      message,
    };

    if (this.config.verboseLogging) {
      console.log(`Broadcasting chat message from ${email}: ${message}`);
    }

    // Broadcast to all connected users
    this.broadcastMessage(
      JSON.stringify(chatMessage),
      this.config.echoToSender ? undefined : senderWs
    );
  }

  // ============================================================================
  // BROADCASTING METHODS
  // ============================================================================

  /**
   * Broadcasts a message to all connected users
   *
   * @param message - The message to broadcast (should be JSON string)
   * @param excludeWs - Optional WebSocket instance to exclude from broadcast
   */
  broadcastMessage(message: string, excludeWs?: WebSocketInstance): void {
    this.wsInstances.forEach((wsSet) => {
      wsSet.forEach((wsInstance) => {
        // Skip if this is the excluded WebSocket
        if (excludeWs && wsInstance === excludeWs) {
          return;
        }

        // Only send to open connections
        if (wsInstance.readyState === WebSocket.OPEN) {
          wsInstance.send(message);
        }
      });
    });
  }

  /**
   * Broadcasts a user joined event to all users except the one who joined
   *
   * @param newUserId - The ID of the user who just joined
   */
  private broadcastUserJoined(newUserId: string): void {
    const userData = this.connectedUsers.get(newUserId);
    if (!userData) return;

    const userJoinedMessage = JSON.stringify({
      type: "user_joined",
      user: userData,
    });

    // Broadcast to all users except the one who joined
    this.wsInstances.forEach((wsSet, userId) => {
      if (userId !== newUserId) {
        wsSet.forEach((wsInstance) => {
          if (wsInstance.readyState === WebSocket.OPEN) {
            wsInstance.send(userJoinedMessage);
          }
        });
      }
    });
  }

  /**
   * Broadcasts a user left event to all remaining connected users
   *
   * @param leftUserId - The ID of the user who left
   * @param leftUserEmail - The email of the user who left
   */
  private broadcastUserLeft(leftUserId: string, leftUserEmail: string): void {
    const userLeftMessage = JSON.stringify({
      type: "user_left",
      userId: leftUserId,
      email: leftUserEmail,
    });

    this.broadcastMessage(userLeftMessage);
  }

  /**
   * Sends the list of connected users to a specific WebSocket connection
   *
   * @param ws - The WebSocket instance to send the list to
   */
  private sendConnectedUsersList(ws: WebSocketInstance): void {
    const usersList = Array.from(this.connectedUsers.values());
    const message = JSON.stringify({
      type: "connected_users",
      users: usersList,
    });

    this.sendToConnection(ws, message);
  }

  /**
   * Sends a message to a specific WebSocket connection
   *
   * @param ws - The WebSocket instance to send to
   * @param message - The message to send
   */
  private sendToConnection(ws: WebSocketInstance, message: string): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(message);
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Gets statistics about current connections
   * Useful for monitoring and debugging
   *
   * @returns ConnectionStats object with current connection information
   */
  getConnectionStats(): ConnectionStats {
    const connectionsPerUser = new Map<string, number>();

    this.wsInstances.forEach((wsSet, userId) => {
      connectionsPerUser.set(userId, wsSet.size);
    });

    const totalConnections = Array.from(connectionsPerUser.values()).reduce(
      (sum, count) => sum + count,
      0
    );

    return {
      totalUsers: this.connectedUsers.size,
      totalConnections,
      connectionsPerUser,
    };
  }

  /**
   * Gets the list of currently connected users
   *
   * @returns Array of ConnectedUser objects
   */
  getConnectedUsers(): ConnectedUser[] {
    return Array.from(this.connectedUsers.values());
  }

  /**
   * Checks if a user is currently connected
   *
   * @param userId - The user ID to check
   * @returns True if the user has at least one active connection
   */
  isUserConnected(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }

  /**
   * Gets the number of connections for a specific user
   *
   * @param userId - The user ID to check
   * @returns Number of active connections for the user
   */
  getUserConnectionCount(userId: string): number {
    return this.wsInstances.get(userId)?.size ?? 0;
  }
}
