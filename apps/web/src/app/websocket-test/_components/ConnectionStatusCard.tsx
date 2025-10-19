/**
 * Connection Status Card Component
 *
 * Displays the current WebSocket connection status with visual indicators
 * and connect/disconnect controls.
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

export type ConnectionStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "error";

export interface ConnectionStatusConfig {
  color: string;
  text: string;
  textColor: string;
}

export interface ConnectionStatusCardProps {
  status: ConnectionStatus;
  onConnect: () => void;
  onDisconnect: () => void;
  isChatMode?: boolean;
}

// ============================================================================
// STATUS CONFIGURATION
// ============================================================================

/**
 * Maps each connection status to visual styles
 * Centralized configuration for consistent styling
 */
const statusConfig: Record<ConnectionStatus, ConnectionStatusConfig> = {
  disconnected: {
    color: "bg-gray-500",
    text: "Disconnected",
    textColor: "text-gray-600",
  },
  connecting: {
    color: "bg-yellow-500",
    text: "Connecting...",
    textColor: "text-yellow-600",
  },
  connected: {
    color: "bg-green-500",
    text: "Connected",
    textColor: "text-green-600",
  },
  error: {
    color: "bg-red-500",
    text: "Error",
    textColor: "text-red-600",
  },
};

// ============================================================================
// COMPONENT
// ============================================================================

export function ConnectionStatusCard({
  status,
  onConnect,
  onDisconnect,
  isChatMode = false,
}: ConnectionStatusCardProps) {
  const currentStatus = statusConfig[status];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Connection Status</span>
          <div className="flex items-center gap-2">
            {/* Animated status dot */}
            <div
              className={`w-3 h-3 rounded-full ${currentStatus.color} animate-pulse`}
            />
            {/* Status text */}
            <span className={`text-sm font-medium ${currentStatus.textColor}`}>
              {currentStatus.text}
            </span>
          </div>
        </CardTitle>
        <CardDescription>
          {status === "connected"
            ? isChatMode
              ? "You are connected to the chat room"
              : "You are connected to the WebSocket server"
            : isChatMode
            ? "Connect to join the chat room"
            : "Click connect to establish a WebSocket connection"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-3">
          <Button
            onClick={onConnect}
            disabled={status === "connected" || status === "connecting"}
            className="flex-1"
          >
            {status === "connecting" ? "Connecting..." : "Connect"}
          </Button>
          <Button
            onClick={onDisconnect}
            disabled={status === "disconnected"}
            variant="destructive"
            className="flex-1"
          >
            Disconnect
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
