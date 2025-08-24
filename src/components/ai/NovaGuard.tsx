import React from "react";
import { useUser } from "@/context/UserContext";
import { emit } from "@/utils/events";

interface NovaGuardProps {
  children: React.ReactNode;
}

/**
 * Authentication guard for Nova AI components
 * Ensures all Nova interactions require authentication
 */
const NovaGuard: React.FC<NovaGuardProps> = ({ children }) => {
  const { user, status } = useUser();

  // If not authenticated, trigger login prompt and block rendering
  if (status !== "authenticated" || !user) {
    // Dispatch login prompt event
    emit("nova:prompt-login");
    return null;
  }

  // User is authenticated, render children
  return <>{children}</>;
};

export default NovaGuard;
