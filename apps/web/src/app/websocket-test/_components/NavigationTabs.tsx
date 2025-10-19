/**
 * Navigation Tabs Component
 *
 * Provides tab navigation between different screens (test and chat).
 */

// ============================================================================
// TYPES
// ============================================================================

export type ScreenType = "test" | "chat";

export interface NavigationTabsProps {
  currentScreen: ScreenType;
  onScreenChange: (screen: ScreenType) => void;
  connectedUsersCount: number;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function NavigationTabs({
  currentScreen,
  onScreenChange,
  connectedUsersCount,
}: NavigationTabsProps) {
  return (
    <div className="flex justify-center">
      <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-1 flex gap-1">
        <button
          onClick={() => onScreenChange("test")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            currentScreen === "test"
              ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          WebSocket Test
        </button>
        <button
          onClick={() => onScreenChange("chat")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            currentScreen === "chat"
              ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          Chat Room ({connectedUsersCount})
        </button>
      </div>
    </div>
  );
}
