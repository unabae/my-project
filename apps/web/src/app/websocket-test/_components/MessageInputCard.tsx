/**
 * Message Input Card Component
 *
 * Provides a text input and send button for sending messages.
 * Handles both regular messages and structured chat messages.
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// ============================================================================
// TYPES
// ============================================================================

export type ConnectionStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "error";

export interface MessageInputCardProps {
  status: ConnectionStatus;
  onSendMessage: (message: string) => void;
  onSendChatMessage?: (message: string) => void;
  isChatMode?: boolean;
  placeholder?: string;
  title?: string;
  description?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function MessageInputCard({
  status,
  onSendMessage,
  onSendChatMessage,
  isChatMode = false,
  placeholder = "Type your message here...",
  title = "Send Message",
  description = "Type a message and click send to test the WebSocket connection",
}: MessageInputCardProps) {
  const [messageInput, setMessageInput] = useState("");

  /**
   * Handles sending a regular message
   */
  const handleSend = () => {
    if (messageInput.trim()) {
      onSendMessage(messageInput);
      setMessageInput("");
    }
  };

  /**
   * Handles sending a structured chat message
   */
  const handleChatSend = () => {
    if (messageInput.trim() && onSendChatMessage) {
      onSendChatMessage(messageInput);
      setMessageInput("");
    }
  };

  /**
   * Handles keyboard input (Enter to send)
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (isChatMode && onSendChatMessage) {
        handleChatSend();
      } else {
        handleSend();
      }
    }
  };

  const isConnected = status === "connected";
  const canSend = isConnected && messageInput.trim();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-3">
          <Input
            type="text"
            placeholder={placeholder}
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={!isConnected}
            className="flex-1"
          />
          <Button
            onClick={
              isChatMode && onSendChatMessage ? handleChatSend : handleSend
            }
            disabled={!canSend}
          >
            Send
          </Button>
        </div>

        {/* Warning message when not connected */}
        {!isConnected && (
          <p className="text-sm text-amber-600 dark:text-amber-400 mt-2">
            ⚠️ Connect to the server first to send messages
          </p>
        )}
      </CardContent>
    </Card>
  );
}
