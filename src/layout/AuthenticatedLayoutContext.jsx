import { createContext, useContext } from "react";

const AuthenticatedLayoutContext = createContext(false);

export const AuthenticatedLayoutProvider = AuthenticatedLayoutContext.Provider;
export const useInsideAuthenticatedLayout = () => useContext(AuthenticatedLayoutContext);