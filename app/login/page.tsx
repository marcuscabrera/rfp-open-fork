'use client';

import { SignIn } from '@/components/auth-components';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left Column: Login Form */}
      <div className="flex flex-1 flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
          </div>

          <div className="mt-8">
            <div className="mt-6">
              <SignIn />
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Quote */}
      <div className="relative hidden lg:flex flex-1 items-center justify-center px-6 bg-slate-800">
        {/* Placeholder for a quote or image */}
      </div>
    </div>
  );
}
