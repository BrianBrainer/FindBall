import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions: NextAuthOptions = {
  // Use Prisma adapter for OAuth providers only, not for credentials
  adapter: PrismaAdapter(prisma) as any,

  providers: [
    // Email/Password credentials provider
    CredentialsProvider({
      id: 'credentials',
      name: 'Email and Password',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'Enter your email' },
        password: { label: 'Password', type: 'password', placeholder: 'Enter your password' },
        isRegistering: { label: 'Is Registering', type: 'hidden' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const { email, password, isRegistering } = credentials;

        try {
          if (isRegistering === 'true') {
            // Registration flow
            const existingUser = await prisma.user.findUnique({
              where: { email },
            });

            if (existingUser) {
              throw new Error('User already exists');
            }

            const user = await prisma.user.create({
              data: {
                email,
                password, // Note: Not hashed per user's request
                name: email.split('@')[0], // Use email prefix as default name
              },
            });

            return {
              id: user.id,
              email: user.email,
              name: user.name,
            };
          } else {
            // Login flow
            const user = await prisma.user.findUnique({
              where: { email },
            });

            if (!user || user.password !== password) {
              return null;
            }

            return {
              id: user.id,
              email: user.email,
              name: user.name,
            };
          }
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),

    // Add a demo credentials provider for testing
    CredentialsProvider({
      id: 'demo',
      name: 'Demo User',
      credentials: {
        name: { label: 'Name', type: 'text', placeholder: 'Enter any name' },
      },
      async authorize(credentials) {
        // For demo purposes, accept any name
        if (credentials?.name) {
          return {
            id: 'demo-user-' + Date.now(),
            name: credentials.name,
            email: credentials.name.toLowerCase().replace(' ', '') + '@demo.com',
          };
        }
        return null;
      },
    }),

    // Keep Google provider but make it conditional
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
  ],

  callbacks: {
    session: ({ session, token }) => {
      // For JWT strategy, get user info from token
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id as string,
        },
      };
    },
    jwt: ({ token, user }) => {
      // When user signs in, add their ID to the token
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
  },

  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },

  session: {
    // Use JWT strategy for credentials provider compatibility
    strategy: 'jwt',
  },

  debug: process.env.NODE_ENV === 'development',
};
