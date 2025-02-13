import React from "react";
import AuthLayout from "@/components/auth/AuthLayout";
import RegisterForm from "@/components/auth/RegisterForm";

const RegisterPage = () => {
  return (
    <AuthLayout title="Create an Account">
      <RegisterForm />
    </AuthLayout>
  );
};

export default RegisterPage;
