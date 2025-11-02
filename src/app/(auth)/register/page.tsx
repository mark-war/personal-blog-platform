// src/app/(auth)/register/page.tsx

import RegisterForm from '@/components/auth/RegisterForm';

export const metadata = {
  title: 'Register - Personal Blog',
  description: 'Create a new account',
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center p-4">
      <RegisterForm />
    </div>
  );
}