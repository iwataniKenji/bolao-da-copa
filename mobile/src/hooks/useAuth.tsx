import { useContext } from "react";

import { AuthContext, AuthContextDataProps } from "../contexts/AuthContext";

// retorna dados do contexto ao chamar hook
export function useAuth(): AuthContextDataProps {
  const context = useContext(AuthContext);

  return context;
}
