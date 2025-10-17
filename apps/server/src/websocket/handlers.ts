/**
 * WebSocket Message Handlers
 *
 * This file contains specialized handlers for different types of WebSocket messages.
 * It provides a clean separation of concerns and makes it easy to add new message types.
 *
 * Each handler is responsible for:
 * 1. Validating the incoming message
 * 2. Processing the message according to business logic
 * 3. Generating appropriate responses
 * 4. Broadcasting to relevant users
 */

import type {
  WebSocketInstance,
  WebSocketMessage,
  ChatMessage,
  ConnectedUser,
  WebSocketInstancesMap,
  ConnectedUsersMap,
} from "./types";

// ============================================================================
// MESSAGE HANDLER INTERFACE
// ============================================================================

/**
 * Interface that all message handlers must implement
 * This ensures consistency across different message types
 */
export interface MessageHandler {
  /**
   * The message type this handler processes
   */
  readonly messageType: string;

  /**
   * Validates the incoming message data
   * @param data - The parsed message data
   * @returns True if the message is valid
   */
  validate(data: any): boolean;

  /**
   * Processes the message and performs necessary actions
   * @param ws - The WebSocket instance that sent the message
   * @param data - The validated message data
   * @param connectedUsers - Map of connected users
   * @param wsInstances - Map of WebSocket instances
   */
  handle(
    ws: WebSocketInstance,
    data: any,
    connectedUsers: ConnectedUsersMap,
    wsInstances: WebSocketInstancesMap
  ): void;
}

// ============================================================================
// CHAT MESSAGE HANDLER
// ============================================================================

/**
 * Handles chat messages from users
 * Validates the message and broadcasts it to all connected users
 */
export class ChatMessageHandler implements MessageHandler {
  readonly messageType = "chat_message";

  validate(data: any): boolean {
    return (
      data &&
      typeof data === "object" &&
      data.type === this.messageType &&
      typeof data.message === "string" &&
      data.message.trim().length > 0
    );
  }

  handle(
    ws: WebSocketInstance,
    data: ChatMessage,
    connectedUsers: ConnectedUsersMap,
    wsInstances: WebSocketInstancesMap
  ): void {
    const { userId, email } = ws.data;
    const userData = connectedUsers.get(userId);

    if (!userData) {
      console.warn(`Chat message from unknown user: ${userId}`);
      return;
    }

    // Create the chat message object
    const chatMessage = {
      type: "chat_message",
      user: {
        userId: userData.userId,
        email: userData.email,
      },
      message: data.message.trim(),
      timestamp: new Date().toISOString(),
    };

    console.log(`Broadcasting chat message from ${email}: ${data.message}`);

    // Broadcast to all connected users
    this.broadcastToAll(wsInstances, JSON.stringify(chatMessage));
  }

  /**
   * Broadcasts a message to all connected WebSocket instances
   */
  private broadcastToAll(
    wsInstances: WebSocketInstancesMap,
    message: string
  ): void {
    wsInstances.forEach((wsSet) => {
      wsSet.forEach((wsInstance) => {
        if (wsInstance.readyState === WebSocket.OPEN) {
          wsInstance.send(message);
        }
      });
    });
  }
}

// ============================================================================
// TYPING INDICATOR HANDLER
// ============================================================================

/**
 * Handles typing indicators (user is typing...)
 * This is a more advanced feature that shows when users are actively typing
 */
export class TypingIndicatorHandler implements MessageHandler {
  readonly messageType = "typing_indicator";

  validate(data: any): boolean {
    return (
      data &&
      typeof data === "object" &&
      data.type === this.messageType &&
      typeof data.isTyping === "boolean"
    );
  }

  handle(
    ws: WebSocketInstance,
    data: { type: string; isTyping: boolean },
    connectedUsers: ConnectedUsersMap,
    wsInstances: WebSocketInstancesMap
  ): void {
    const { userId, email } = ws.data;
    const userData = connectedUsers.get(userId);

    if (!userData) {
      console.warn(`Typing indicator from unknown user: ${userId}`);
      return;
    }

    const typingMessage = {
      type: "typing_indicator",
      user: {
        userId: userData.userId,
        email: userData.email,
      },
      isTyping: data.isTyping,
      timestamp: new Date().toISOString(),
    };

    // Broadcast to all users except the one typing
    this.broadcastToOthers(wsInstances, userId, JSON.stringify(typingMessage));
  }

  /**
   * Broadcasts a message to all users except the specified user
   */
  private broadcastToOthers(
    wsInstances: WebSocketInstancesMap,
    excludeUserId: string,
    message: string
  ): void {
    wsInstances.forEach((wsSet, userId) => {
      if (userId !== excludeUserId) {
        wsSet.forEach((wsInstance) => {
          if (wsInstance.readyState === WebSocket.OPEN) {
            wsInstance.send(message);
          }
        });
      }
    });
  }
}

// ============================================================================
// PING/PONG HANDLER
// ============================================================================

/**
 * Handles ping messages for connection health checks
 * Responds with a pong message to keep connections alive
 */
export class PingHandler implements MessageHandler {
  readonly messageType = "ping";

  validate(data: any): boolean {
    return data && typeof data === "object" && data.type === this.messageType;
  }

  handle(
    ws: WebSocketInstance,
    data: { type: string },
    connectedUsers: ConnectedUsersMap,
    wsInstances: WebSocketInstancesMap
  ): void {
    const pongMessage = {
      type: "pong",
      timestamp: new Date().toISOString(),
    };

    // Send pong response back to the sender
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(pongMessage));
    }
  }
}

// ============================================================================
// MESSAGE HANDLER REGISTRY
// ============================================================================

/**
 * Registry that manages all available message handlers
 * Makes it easy to add new message types and route messages appropriately
 */
export class MessageHandlerRegistry {
  private handlers: Map<string, MessageHandler> = new Map();

  constructor() {
    // Register default handlers
    this.register(new ChatMessageHandler());
    this.register(new TypingIndicatorHandler());
    this.register(new PingHandler());
  }

  /**
   * Registers a new message handler
   * @param handler - The handler to register
   */
  register(handler: MessageHandler): void {
    this.handlers.set(handler.messageType, handler);
    console.log(`Registered message handler for type: ${handler.messageType}`);
  }

  /**
   * Processes an incoming message using the appropriate handler
   * @param ws - The WebSocket instance that sent the message
   * @param data - The parsed message data
   * @param connectedUsers - Map of connected users
   * @param wsInstances - Map of WebSocket instances
   * @returns True if a handler was found and processed the message
   */
  processMessage(
    ws: WebSocketInstance,
    data: any,
    connectedUsers: ConnectedUsersMap,
    wsInstances: WebSocketInstancesMap
  ): boolean {
    const handler = this.handlers.get(data.type);

    if (!handler) {
      console.log(`No handler found for message type: ${data.type}`);
      return false;
    }

    if (!handler.validate(data)) {
      console.warn(`Invalid message format for type: ${data.type}`, data);
      return false;
    }

    try {
      handler.handle(ws, data, connectedUsers, wsInstances);
      return true;
    } catch (error) {
      console.error(`Error processing message type ${data.type}:`, error);
      return false;
    }
  }

  /**
   * Gets all registered message types
   * @returns Array of message type strings
   */
  getRegisteredTypes(): string[] {
    return Array.from(this.handlers.keys());
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Creates a default message handler registry with all standard handlers
 * @returns A configured MessageHandlerRegistry instance
 */
export function createDefaultHandlerRegistry(): MessageHandlerRegistry {
  return new MessageHandlerRegistry();
}

/**
 * Safely parses a WebSocket message as JSON
 * Falls back to treating it as plain text if JSON parsing fails
 * @param message - The raw message from WebSocket
 * @returns Object with parsed data and whether it was JSON
 */
export function parseMessage(message: Buffer | string): {
  data: any;
  isJson: boolean;
} {
  try {
    const data = JSON.parse(message.toString());
    return { data, isJson: true };
  } catch {
    // If not JSON, treat as plain text chat message
    return {
      data: {
        type: "chat_message",
        message: message.toString(),
      },
      isJson: false,
    };
  }
}
