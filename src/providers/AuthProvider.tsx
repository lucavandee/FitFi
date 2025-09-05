import { ReactNode } from "react";

type AuthProviderProps = { children: ReactNode };

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // hier jouw bestaande auth-logica / context-provider
  return <>{children}</>;
};

export default AuthProvider;