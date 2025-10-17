/**
 * Custom Hook for Message Handling
 *
 * Provides utilities for handling different types of WebSocket messages.
 */

import { useCallback } from "react";
import { MESSAGE_TYPES } from "../_utils/constants";

// ============================================================================
// TYPES
// ============================================================================

export interface MessageHandlers {
  sendMessage: (message: string) => void;
  sendChatMessage: (message: string) => void;
  sendTypingIndicator: (isTyping: boolean) => void;
  sendPing: () => void;
}

export interface UseMessageHandlersProps {
  sendMessage: (message: string, isStructured?: boolean) => void;
}

// ============================================================================
// HOOK
// ============================================================================

export function useMessageHandlers({
  sendMessage,
}: UseMessageHandlersProps): MessageHandlers {
  /**
   * Sends a regular text message
   */
  const handleSendMessage = useCallback(
    (message: string) => {
      sendMessage(message, false);
    },
    [sendMessage]
  );

  /**
   * Sends a structured chat message
   */
  const handleSendChatMessage = useCallback(
    (message: string) => {
      const chatMessage = JSON.stringify({
        type: MESSAGE_TYPES.CHAT_MESSAGE,
        message: message,
      });
      sendMessage(chatMessage, true);
    },
    [sendMessage]
  );

  /**
   * Sends a typing indicator
   */
  const handleSendTypingIndicator = useCallback(
    (isTyping: boolean) => {
      const typingMessage = JSON.stringify({
        type: MESSAGE_TYPES.TYPING_INDICATOR,
        isTyping: isTyping,
      });
      sendMessage(typingMessage, true);
    },
    [sendMessage]
  );

  /**
   * Sends a ping message for connection health check
   */
  const handleSendPing = useCallback(() => {
    const pingMessage = JSON.stringify({
      type: MESSAGE_TYPES.PING,
    });
    sendMessage(pingMessage, true);
  }, [sendMessage]);

  return {
    sendMessage: handleSendMessage,
    sendChatMessage: handleSendChatMessage,
    sendTypingIndicator: handleSendTypingIndicator,
    sendPing: handleSendPing,
  };
}
