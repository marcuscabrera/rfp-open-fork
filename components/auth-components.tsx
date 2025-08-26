'use client';

import { signIn, signOut } from 'next-auth/react';
import { Button } from './ui/button';

export function SignIn() {
  return (
    <Button onClick={() => signIn('azure-ad')}>
      Sign in with Azure AD
    </Button>
  );
}

export function SignOut() {
  return (
    <Button onClick={() => signOut()}>
      Sign out
    </Button>
  );
}
