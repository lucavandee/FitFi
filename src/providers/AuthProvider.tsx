import { ReactNode } from "react";

type AuthProviderProps = { children: ReactNode };

function AuthProvider({ children }: AuthProviderProps) {
  // Plaats hier je bestaande context/provider-implementatie
  return <>{children}</>;
}

export default AuthProvider;