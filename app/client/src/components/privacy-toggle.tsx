import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { usePrivacy } from "@/contexts/privacy-context";

export function PrivacyToggle() {
  const { privacyMode, setPrivacyMode } = usePrivacy();

  return (
    <Button
      variant={privacyMode ? "default" : "outline"}
      size="icon"
      onClick={() => setPrivacyMode(!privacyMode)}
      data-testid="button-privacy-mode"
    >
      {privacyMode ? (
        <EyeOff className="h-4 w-4" />
      ) : (
        <Eye className="h-4 w-4" />
      )}
      <span className="sr-only">
        {privacyMode ? "Privacy Mode On" : "Privacy Mode Off"}
      </span>
    </Button>
  );
}
