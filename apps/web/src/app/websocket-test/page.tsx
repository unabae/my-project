/**
 * ============================================================================
 * WEBSOCKET TEST PAGE
 * ============================================================================
 *
 * This page demonstrates real-time WebSocket communication between the
 * frontend (React/Next.js) and backend (Bun server).
 *
 * PURPOSE:
 * - Test WebSocket connections in a user-friendly interface
 * - Visualize connection status, sent messages, and received messages
 * - Learn how WebSockets work through hands-on experimentation
 *
 * FEATURES:
 * 1. Connection Status - Visual indicator showing current connection state
 * 2. Connect/Disconnect Buttons - Manual control over the connection
 * 3. Message Input - Send custom messages to the server
 * 4. Message History - Console-style display of all communication
 *
 * HOW IT WORKS:
 * 1. User must be authenticated (logged in) first
 * 2. Click "Connect" to establish WebSocket connection
 * 3. Browser sends cookies automatically (for auth)
 * 4. Server verifies session and accepts/rejects connection
 * 5. Once connected, both sides can send messages anytime
 * 6. Messages appear in real-time in the message history
 *
 * TECHNICAL FLOW:
 * Frontend                         Backend
 *    |                                |
 *    |--- Connect to ws://...:3000/ws ---|
 *    |    (includes session cookie)  |
 *    |                                |
 *    |         Check auth.api.getSession()
 *    |         ✓ Valid session found
 *    |                                |
 *    |<------ Connection accepted ----|
 *    |<------ "Welcome user@email" ---|
 *    |                                |
 *    |--- Send: "Hello server!" ----->|
 *    |         Server logs message    |
 *    |                                |
 */

"use client";

import { useState, useEffect } from "react";
import { useWebSocket } from "@/hooks/useWebSocket";
import { WEBSOCKET_URL, PAGE_CONFIG, CARD_CONFIG } from "./_utils/constants";
import { useMessageHandlers } from "./_hooks/useMessageHandlers";
import { useScreenState } from "./_hooks/useScreenState";
import {
  ConnectionStatusCard,
  MessageInputCard,
  MessageHistoryCard,
  ConnectedUsersCard,
  InstructionsCard,
  NavigationTabs,
} from "./_components";

/**
 * Main component for the WebSocket test page
 */
export default function WebSocketTestPage() {
  // STATE: Track if component has mounted (to prevent hydration mismatch)
  const [isMounted, setIsMounted] = useState(false);

  // CUSTOM HOOKS: Manage screen state and message handling
  const { currentScreen, setCurrentScreen, isTestScreen } =
    useScreenState("test");

  /**
   * CUSTOM HOOK: useWebSocket
   * This hook manages all WebSocket logic and gives us:
   * - status: Current connection state (disconnected/connecting/connected/error)
   * - messages: Array of all messages sent and received
   * - connect: Function to establish connection
   * - disconnect: Function to close connection
   * - sendMessage: Function to send data to server
   * - clearMessages: Function to clear message history
   */
  const {
    status,
    messages,
    connectedUsers,
    connect,
    disconnect,
    sendMessage,
    clearMessages,
  } = useWebSocket(WEBSOCKET_URL);

  // CUSTOM HOOK: Message handlers for different message types
  const messageHandlers = useMessageHandlers({ sendMessage });

  /**
   * MOUNT EFFECT
   * This effect runs only on the client side after the component has mounted
   * It sets isMounted to true, which prevents hydration mismatches by ensuring
   * the entire component only renders after client-side hydration is complete
   */
  useEffect(() => {
    // Use setTimeout to defer the state update to the next tick
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // No need for individual handler functions - they're now in the custom hooks

  // Prevent hydration mismatch by not rendering until mounted
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
              {PAGE_CONFIG.title}
            </h1>
            <p className="text-slate-600 dark:text-slate-400">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
            {PAGE_CONFIG.title}
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            {PAGE_CONFIG.description}
          </p>
        </div>

        {/* Navigation Tabs */}
        <NavigationTabs
          currentScreen={currentScreen}
          onScreenChange={setCurrentScreen}
          connectedUsersCount={connectedUsers.length}
        />

        {/* Conditional Content Based on Current Screen */}
        {isTestScreen ? (
          <>
            {/* Test Screen Components */}
            <ConnectionStatusCard
              status={status}
              onConnect={connect}
              onDisconnect={disconnect}
              isChatMode={false}
            />

            <MessageInputCard
              status={status}
              onSendMessage={messageHandlers.sendMessage}
              isChatMode={false}
              {...CARD_CONFIG.test.messageInput}
            />

            <MessageHistoryCard
              messages={messages}
              onClearMessages={clearMessages}
              {...CARD_CONFIG.test.messageHistory}
            />

            <InstructionsCard {...CARD_CONFIG.test.instructions} />
          </>
        ) : (
          <>
            {/* Chat Screen Components */}
            <ConnectionStatusCard
              status={status}
              onConnect={connect}
              onDisconnect={disconnect}
              isChatMode={true}
            />

            <ConnectedUsersCard
              users={connectedUsers}
              {...CARD_CONFIG.chat.connectedUsers}
            />

            <MessageHistoryCard
              messages={messages}
              onClearMessages={clearMessages}
              {...CARD_CONFIG.chat.messageHistory}
            />

            <MessageInputCard
              status={status}
              onSendMessage={messageHandlers.sendMessage}
              onSendChatMessage={messageHandlers.sendChatMessage}
              isChatMode={true}
              {...CARD_CONFIG.chat.messageInput}
            />
          </>
        )}
      </div>
    </div>
  );
}

/**
 * ============================================================================
 * REFACTORED ARCHITECTURE NOTES
 * ============================================================================
 *
 * This page has been refactored into a modular, maintainable structure:
 *
 * COMPONENTS:
 * - ConnectionStatusCard: Displays connection status and controls
 * - MessageInputCard: Handles message input and sending
 * - MessageHistoryCard: Shows message history with styling
 * - ConnectedUsersCard: Lists connected users
 * - InstructionsCard: Displays help text
 * - NavigationTabs: Tab navigation between screens
 *
 * HOOKS:
 * - useMessageHandlers: Manages different message types
 * - useScreenState: Manages screen navigation state
 *
 * UTILITIES:
 * - constants.ts: Centralized configuration
 * - Component exports: Clean import structure
 *
 * BENEFITS:
 * - Separation of concerns
 * - Reusable components
 * - Type safety
 * - Easy to test and maintain
 * - Consistent styling
 */
