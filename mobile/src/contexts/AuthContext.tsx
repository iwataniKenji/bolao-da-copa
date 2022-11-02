import { createContext, ReactNode } from "react";

interface UserProps {
  name: string;
  avatarUrl: string;
}

export interface AuthContextDataProps {
  user: UserProps;
  signIn: () => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

// armazena contexto
export const AuthContext = createContext({} as AuthContextDataProps);

// provider permite compartilhar o contexto com a aplicação
export function AuthContextProvider({ children }: AuthProviderProps) {
  async function signIn() {
    console.log("Vamos logar!");
  }

  return (
    <AuthContext.Provider
      value={{
        signIn,
        user: {
          name: "Kenji Iwatani",
          avatarUrl: "https://github.com/iwataniKenji.png",
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
