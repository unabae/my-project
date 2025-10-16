import { SessionProvider } from "@/providers/session-provider";
import { WelcomeContent } from "@/components/WelcomeContent";

export default function Home() {
  return (
    <SessionProvider>
      <div className="my-6 px-4 max-w-md mx-auto">
        <WelcomeContent />
      </div>
    </SessionProvider>
  );
}
