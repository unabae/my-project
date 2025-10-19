/**
 * Custom Hook for Screen State Management
 *
 * Manages the current screen state and provides utilities for screen navigation.
 */

import { useState, useCallback } from "react";

// ============================================================================
// TYPES
// ============================================================================

export type ScreenType = "test" | "chat";

export interface UseScreenStateReturn {
  currentScreen: ScreenType;
  setCurrentScreen: (screen: ScreenType) => void;
  isTestScreen: boolean;
  isChatScreen: boolean;
}

// ============================================================================
// HOOK
// ============================================================================

export function useScreenState(
  initialScreen: ScreenType = "test"
): UseScreenStateReturn {
  const [currentScreen, setCurrentScreenState] =
    useState<ScreenType>(initialScreen);

  const setCurrentScreen = useCallback((screen: ScreenType) => {
    setCurrentScreenState(screen);
  }, []);

  const isTestScreen = currentScreen === "test";
  const isChatScreen = currentScreen === "chat";

  return {
    currentScreen,
    setCurrentScreen,
    isTestScreen,
    isChatScreen,
  };
}
