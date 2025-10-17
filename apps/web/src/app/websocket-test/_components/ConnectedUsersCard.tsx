/**
 * Connected Users Card Component
 *
 * Displays a list of currently connected users with their connection information.
 */

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

export interface ConnectedUser {
  userId: string;
  email: string;
  connectedAt: string;
}

export interface ConnectedUsersCardProps {
  users: ConnectedUser[];
  title?: string;
  description?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function ConnectedUsersCard({
  users,
  title = "Connected Users",
  description = "Users currently connected to the chat room",
}: ConnectedUsersCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{title}</span>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {users.length} online
          </span>
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {users.length === 0 ? (
            <p className="text-slate-500 text-center py-4">
              No users connected. Connect to see other users!
            </p>
          ) : (
            users.map((user) => (
              <div
                key={user.userId}
                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {/* User avatar */}
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {user.email.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {user.email}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Connected{" "}
                      {new Date(user.connectedAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                {/* Online indicator */}
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
