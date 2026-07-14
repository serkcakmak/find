'use server';

import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Geçersiz e-posta veya şifre.';
        default:
          return 'Giriş yapılamadı, lütfen tekrar deneyin.';
      }
    }
    throw error;
  }
}
