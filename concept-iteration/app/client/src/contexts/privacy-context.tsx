import { createContext, useContext, useState, ReactNode } from "react";

interface PrivacyContextType {
  privacyMode: boolean;
  setPrivacyMode: (value: boolean) => void;
  blurText: (text: string) => string;
  blurInitials: (text: string) => string;
}

const PrivacyContext = createContext<PrivacyContextType | undefined>(undefined);

export function PrivacyProvider({ children }: { children: ReactNode }) {
  const [privacyMode, setPrivacyMode] = useState(false);

  const blurText = (text: string) => {
    if (!privacyMode) return text;
    return text.replace(/[a-zA-Z]/g, '█');
  };

  const blurInitials = (name: string) => {
    if (!privacyMode) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return "██";
  };

  return (
    <PrivacyContext.Provider value={{ privacyMode, setPrivacyMode, blurText, blurInitials }}>
      {children}
    </PrivacyContext.Provider>
  );
}

export function usePrivacy() {
  const context = useContext(PrivacyContext);
  if (!context) {
    throw new Error("usePrivacy must be used within a PrivacyProvider");
  }
  return context;
}
