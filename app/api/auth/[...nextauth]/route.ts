import NextAuth, { AuthOptions } from 'next-auth';
import AzureADProvider from 'next-auth/providers/azure-ad';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';
import {NextApiRequest, NextApiResponse} from "next";

const prisma = new PrismaClient();

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID as string,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET as string,
      tenantId: process.env.AZURE_AD_TENANT_ID as string,
      authorization: {
        params: {
          scope: "openid profile email User.Read groups"
        }
      },
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: null,
          groups: profile.groups,
        }
      }
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account && account.provider === 'azure-ad') {
        const tid = (profile as any)?.tid;
        if (!tid) {
          console.error('Tenant ID (tid) not found in profile');
          return false;
        }

        let organization = await prisma.organization.findUnique({
          where: { slug: tid },
        });

        if (!organization) {
          organization = await prisma.organization.create({
            data: {
              name: (profile as any)?.name || 'Default Organization',
              slug: tid,
            },
          });
        }

        const orgUser = await prisma.organizationUser.findUnique({
          where: {
            userId_organizationId: {
              userId: user.id,
              organizationId: organization.id,
            },
          },
        });

        if (!orgUser) {
          const groups = (profile as any)?.groups || [];
          let role = 'member';
          if (groups.includes('owner')) {
            role = 'owner';
          } else if (groups.includes('admin')) {
            role = 'admin';
          }

          await prisma.organizationUser.create({
            data: {
              userId: user.id,
              organizationId: organization.id,
              role: role,
            },
          });
        }
      }
      return true;
    },
    async session({ session, user }) {
      const orgUser = await prisma.organizationUser.findFirst({
        where: { userId: user.id },
        include: { organization: true },
      });

      if (orgUser) {
        session.user.id = user.id;
        (session.user as any).organizationId = orgUser.organizationId;
        (session.user as any).organization = orgUser.organization;
        (session.user as any).role = orgUser.role;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'database',
  },
};

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST };
