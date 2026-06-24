import React from "react";
import { useLocation } from "react-router-dom";
import SignUpForm from "../components/SignUpForm";

const SignUp = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <SignUpForm />
    </div>
  );
};

export default SignUp;
