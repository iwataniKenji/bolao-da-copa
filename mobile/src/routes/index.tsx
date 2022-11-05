import { NavigationContainer } from "@react-navigation/native";
import { AppRoutes } from "./app.routes";

// separa decisão sobre rotas caso usuário esteja logado ou não
export function Routes() {
  return (
    <NavigationContainer>
      <AppRoutes />
    </NavigationContainer>
  );
}
