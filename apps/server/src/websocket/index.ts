/**
 * WebSocket Module Exports
 *
 * This file provides a clean interface for importing WebSocket functionality.
 * It exports all the necessary classes, types, and utilities in an organized way.
 */

// ============================================================================
// MAIN CLASSES
// ============================================================================

export { WebSocketManager } from "./manager";
export {
  MessageHandlerRegistry,
  createDefaultHandlerRegistry,
  parseMessage,
} from "./handlers";

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export type {
  WebSocketData,
  ConnectedUser,
  WebSocketMessage,
  ChatMessage,
  UserJoinedMessage,
  UserLeftMessage,
  ConnectedUsersMessage,
  WebSocketManagerConfig,
  ConnectionStats,
  WebSocketInstance,
  UserConnectionSet,
  WebSocketInstancesMap,
  ConnectedUsersMap,
} from "./types";

export { WebSocketError, ConnectionLimitError } from "./types";

// ============================================================================
// MESSAGE HANDLERS
// ============================================================================

export {
  ChatMessageHandler,
  TypingIndicatorHandler,
  PingHandler,
} from "./handlers";

export type { MessageHandler } from "./handlers";

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Creates a fully configured WebSocket manager with default settings
 * This is the easiest way to get started with WebSocket functionality
 *
 * @param config - Optional configuration overrides
 * @returns A configured WebSocketManager instance
 */
export function createWebSocketManager(
  config?: import("./types").WebSocketManagerConfig
) {
  const { WebSocketManager } = require("./manager");
  return new WebSocketManager(config);
}

/**
 * Creates a WebSocket manager with message handlers
 * This provides both connection management and message processing
 *
 * @param config - Optional configuration overrides
 * @returns Object with manager and handler registry
 */
export function createWebSocketSystem(
  config?: import("./types").WebSocketManagerConfig
) {
  const { WebSocketManager } = require("./manager");
  const { createDefaultHandlerRegistry, parseMessage } = require("./handlers");

  const manager = new WebSocketManager(config);
  const handlers = createDefaultHandlerRegistry();

  return {
    manager,
    handlers,
    // Convenience method to process messages
    processMessage: (ws: any, message: Buffer | string) => {
      const { data, isJson } = parseMessage(message);
      return handlers.processMessage(
        ws,
        data,
        manager["connectedUsers"],
        manager["wsInstances"]
      );
    },
  };
}
