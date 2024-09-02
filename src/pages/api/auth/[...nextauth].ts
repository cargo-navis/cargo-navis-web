import NextAuth from 'next-auth';
import CredentialsProvider from "next-auth/providers/credentials";

import { login } from '@/api';

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        if(!credentials?.email || !credentials?.password) return null;

        const { email, password } = credentials;
        const res = await login({ email, password });

        if(res.token) {
          return { isAuthenticated: true } as any;
        } else {
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: '/login',
    signOut: '/login',
  }
});