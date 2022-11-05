import { NavigationContainer } from "@react-navigation/native";
import { AppRoutes } from "./app.routes";
import { SignIn } from "../screens/SignIn";

// separa decisão sobre rotas caso usuário esteja logado ou não
export function Routes() {
  return (
    <NavigationContainer>
      <SignIn />
    </NavigationContainer>
  );
}
