'use client';

import RegisterForm from '../components/auth/register-form';
import { AuthProvider } from '../contexts/auth-context';

export default function RegisterPage() {
  return (
    <AuthProvider>
      <RegisterForm />
    </AuthProvider>
  );
}
