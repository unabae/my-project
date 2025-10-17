/**
 * Message History Card Component
 *
 * Displays all sent and received messages in a console-style interface.
 * Supports different message types with color coding.
 */

import { Button } from "@/components/ui/button";
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

export interface MessageHistoryCardProps {
  messages: string[];
  onClearMessages: () => void;
  title?: string;
  description?: string;
}

// ============================================================================
// MESSAGE STYLING UTILITIES
// ============================================================================

/**
 * Determines the styling class for a message based on its content
 */
function getMessageStyle(message: string): string {
  const isSent = message.startsWith("Sent:");
  const isReceived = message.startsWith("Received:");
  const isError = message.startsWith("Error:");
  const isUserJoined = message.includes("joined the chat");
  const isUserLeft = message.includes("left the chat");
  const isChatMessage =
    message.includes(":") &&
    !isSent &&
    !isReceived &&
    !isError &&
    !isUserJoined &&
    !isUserLeft;

  if (isSent) return "bg-blue-500/20 text-blue-300";
  if (isReceived) return "bg-green-500/20 text-green-300";
  if (isError) return "bg-red-500/20 text-red-300";
  if (isUserJoined) return "bg-emerald-500/20 text-emerald-300";
  if (isUserLeft) return "bg-orange-500/20 text-orange-300";
  if (isChatMessage) return "bg-slate-700 text-slate-200";
  return "text-slate-300";
}

// ============================================================================
// COMPONENT
// ============================================================================

export function MessageHistoryCard({
  messages,
  onClearMessages,
  title = "Messages",
  description = "Messages sent and received will appear here",
}: MessageHistoryCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{title}</span>
          <Button
            onClick={onClearMessages}
            variant="outline"
            size="sm"
            disabled={messages.length === 0}
          >
            Clear
          </Button>
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-slate-900 dark:bg-slate-950 rounded-lg p-4 min-h-[300px] max-h-[400px] overflow-y-auto">
          {messages.length === 0 ? (
            <p className="text-slate-500 text-center py-8">
              No messages yet. Connect and send a message to get started!
            </p>
          ) : (
            <div className="space-y-2 font-mono text-sm">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`p-2 rounded ${getMessageStyle(msg)}`}
                >
                  <span className="opacity-60 text-xs">
                    [{new Date().toLocaleTimeString()}]
                  </span>{" "}
                  {msg}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
