// src/pages/SignUp.jsx
import { useLocation } from "react-router-dom";
import SignUpForm from "../components/SignUpForm"; // client (2-step)
import ProviderSignUpForm from "../components/ProviderSignUpForm"; // provider (4-step)

const SignUp = () => {
  const { state } = useLocation();
  const role = state?.role || "client";
  return role === "service_provider" ? <ProviderSignUpForm /> : <SignUpForm />;
};
export default SignUp;
