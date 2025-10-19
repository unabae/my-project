/**
 * Instructions Card Component
 *
 * Displays helpful instructions for using the WebSocket test page.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// ============================================================================
// TYPES
// ============================================================================

export interface InstructionsCardProps {
  title?: string;
  instructions?: readonly string[];
  className?: string;
}

// ============================================================================
// DEFAULT INSTRUCTIONS
// ============================================================================

const defaultInstructions = [
  "Make sure you're logged in (WebSocket requires authentication)",
  'Click the "Connect" button to establish a WebSocket connection',
  'Once connected, type a message and click "Send" or press Enter',
  "Watch the messages area to see sent and received messages",
  'Click "Disconnect" when you\'re done testing',
];

// ============================================================================
// COMPONENT
// ============================================================================

export function InstructionsCard({
  title = "💡 How to Use",
  instructions = defaultInstructions,
  className = "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800",
}: InstructionsCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-blue-900 dark:text-blue-100">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
        <ol className="list-decimal list-inside space-y-1">
          {instructions.map((instruction, index) => (
            <li key={index}>{instruction}</li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
