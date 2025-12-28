import { createContext } from "react";
import { State } from "./AuthReducer";

export const AuthContext = createContext<
  State & { setLoginData: (data: State) => void }
>({
  isAuth: false,
  setLoginData: () => {},
  verifyUser: () => Promise<void>,
});
